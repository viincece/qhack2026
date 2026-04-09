/**
 * Tender draft generation orchestrator.
 * Two-pass approach:
 *   Pass 1: Analyze tender + retrieve ALL relevant wiki content
 *   Pass 2: Single LLM call generates the complete draft using a style template
 */

import * as llm from "./llm";
import * as wiki from "./wiki";
import * as storage from "./storage";
import { parseDocument } from "./parser";
import fs from "fs/promises";
import path from "path";

const TEAM_WIKI_DIR = path.join(process.cwd(), "knowledge-base", "wiki", "team");
const REFERENCES_DIR = path.join(process.cwd(), "knowledge-base", "references");

/**
 * Read team member names from wiki/team/ directory.
 * Only team members with a CV/wiki page can be used in drafts.
 * Excludes overview.md and other non-person files.
 */
async function getValidTeamMembers(): Promise<string[]> {
  try {
    const files = await fs.readdir(TEAM_WIKI_DIR);
    return files
      .filter(f => f.endsWith(".md") && f !== "overview.md" && f !== "index.md" && f !== "log.md")
      .map(f => {
        // Convert filename like "anna_becker.md" → "Anna Becker"
        return f
          .replace(/\.md$/, "")
          .split("_")
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
      });
  } catch {
    return [];
  }
}

// ── Load past tender references ──────────────────────

export interface PastReference {
  filename: string;
  title: string;
  reference: string;
  client: string;
  content: string;
}

/**
 * Load all past tender response references from knowledge-base/references/.
 * These provide the LLM with concrete style/structure templates.
 */
export async function loadPastReferences(): Promise<PastReference[]> {
  try {
    const files = await fs.readdir(REFERENCES_DIR);
    const refs: PastReference[] = [];
    for (const file of files.filter(f => f.endsWith(".md"))) {
      const raw = await fs.readFile(path.join(REFERENCES_DIR, file), "utf-8");
      // Parse YAML frontmatter
      const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
      if (!fmMatch) continue;
      const frontmatter = fmMatch[1];
      const content = fmMatch[2].trim();
      const getField = (key: string) => {
        const m = frontmatter.match(new RegExp(`^${key}:\\s*"?(.+?)"?$`, "m"));
        return m ? m[1] : "";
      };
      refs.push({
        filename: file,
        title: getField("title"),
        reference: getField("reference"),
        client: getField("client"),
        content,
      });
    }
    return refs;
  } catch {
    return [];
  }
}

/**
 * Compute a simple keyword overlap similarity score between two texts.
 * Returns a value between 0 and 1.
 */
function computeSimilarity(textA: string, textB: string): number {
  const tokenize = (t: string) => {
    const words = t.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(w => w.length > 3);
    return new Set(words);
  };
  const setA = tokenize(textA);
  const setB = tokenize(textB);
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const w of setA) {
    if (setB.has(w)) intersection++;
  }
  return intersection / Math.min(setA.size, setB.size);
}

/**
 * Rank past references by similarity to the input tender text.
 * Returns references sorted by relevance (most similar first),
 * with the similarity score attached.
 */
export function rankReferences(
  tenderText: string,
  references: PastReference[]
): Array<PastReference & { similarity: number }> {
  return references
    .map(ref => ({
      ...ref,
      similarity: computeSimilarity(tenderText, ref.content),
    }))
    .sort((a, b) => b.similarity - a.similarity);
}

// ── Hard-coded post-processing ────────────────────────

/**
 * Robust table repair: fix broken rows, missing separators, column mismatches,
 * and ensure blank lines surround tables.
 */
function repairTables(text: string): string {
  const lines = text.split("\n");
  const result: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const trimmed = lines[i].trim();
    // Detect table row: starts with | (but not inside a code block)
    if (!trimmed.startsWith("|") || trimmed.startsWith("| ---") && !trimmed.endsWith("|")) {
      result.push(lines[i]);
      i++;
      continue;
    }

    // Collect consecutive table lines, merging broken rows
    const tableLines: string[] = [];
    while (i < lines.length && lines[i].trim().startsWith("|")) {
      let line = lines[i].trim();
      // Fix broken rows: starts with | but doesn't end with |
      while (!line.endsWith("|") && i + 1 < lines.length && lines[i + 1].trim() !== "") {
        i++;
        line += " " + lines[i].trim();
      }
      // Ensure line ends with |
      if (!line.endsWith("|")) line += " |";
      tableLines.push(line);
      i++;
    }

    if (tableLines.length < 2) {
      result.push(...tableLines);
      continue;
    }

    // Determine max column count
    const colCounts = tableLines.map((l) => (l.match(/\|/g) || []).length - 1);
    const maxCols = Math.max(...colCounts.filter((c) => c > 0));

    // Check if row 1 is a separator
    const isSeparator = (line: string) => /^\|[\s\-:|]+\|$/.test(line);

    // Ensure separator row exists after header
    if (tableLines.length >= 2 && !isSeparator(tableLines[1])) {
      const sep = "|" + Array(maxCols).fill(" --- ").join("|") + "|";
      tableLines.splice(1, 0, sep);
    }

    // Pad rows to consistent column count
    const normalized = tableLines.map((line) => {
      if (isSeparator(line)) {
        // Rebuild separator with correct column count
        return "|" + Array(maxCols).fill(" --- ").join("|") + "|";
      }
      const cells = line.split("|").slice(1, -1); // strip leading/trailing empty
      while (cells.length < maxCols) cells.push(" ");
      return "|" + cells.join("|") + "|";
    });

    // Ensure blank line before table
    if (result.length > 0 && result[result.length - 1].trim() !== "") {
      result.push("");
    }
    result.push(...normalized);
    // Ensure blank line after table
    if (i < lines.length && lines[i]?.trim() !== "") {
      result.push("");
    }
  }

  return result.join("\n");
}

/**
 * Enforce format constraints deterministically — no AI involved.
 * Strips LLM verbosity artefacts that survive even strong prompting.
 */
export function postProcessDraft(draft: string): string {
  let result = draft;

  // 0. Robust table repair (handles broken rows, missing separators, column mismatches)
  result = repairTables(result);

  // 1. Remove accidental markdown code block wrappers
  result = result.replace(/^```(?:markdown)?\s*\n/m, "");
  result = result.replace(/\n```\s*$/m, "");

  // 2. Ensure table separator rows exist (secondary safety net)
  result = result.replace(
    /(\|[^\n]+\|)\n(\|[^\n-|][^\n]+\|)/gm,
    (match, headerRow, dataRow) => {
      const cols = (headerRow.match(/\|/g) || []).length - 1;
      if (cols > 0) {
        const separator = "|" + Array(cols).fill("---|").join("");
        if (!/^\|[\s-|]+\|$/.test(dataRow)) {
          return `${headerRow}\n${separator}\n${dataRow}`;
        }
      }
      return match;
    }
  );

  // 3. Strip trailing LLM commentary after the price table
  //    Past tenders end immediately after the price table — no closing remarks.
  const priceTableEnd = result.lastIndexOf("| TOTAL");
  if (priceTableEnd !== -1) {
    const afterTotal = result.indexOf("\n", priceTableEnd);
    if (afterTotal !== -1) {
      // Find end of the table row(s) after TOTAL
      const restAfterTotal = result.slice(afterTotal);
      const tableEndMatch = restAfterTotal.match(/^(\|[^\n]*\n)*\s*\n/m);
      if (tableEndMatch) {
        const cutPoint = afterTotal + tableEndMatch[0].length;
        const trailing = result.slice(cutPoint).trim();
        // If there's non-heading text after the price table, remove it
        if (trailing && !trailing.startsWith("#")) {
          result = result.slice(0, cutPoint).trimEnd() + "\n";
        }
      }
    }
  }

  // 4. Strip common LLM filler phrases (deterministic regex, not AI)
  const fillerPatterns = [
    /^(?:In this section,? )?(?:we (?:will |shall )?(?:now |briefly )?(?:outline|describe|present|discuss|detail|explain|summarize|provide an overview of))[^.]*\.\s*/gmi,
    /^(?:As (?:outlined|described|noted|mentioned|discussed) (?:above|below|earlier|previously))[^.]*\.\s*/gmi,
    /^(?:In conclusion|To summarize|In summary|Overall)[^.]*\.\s*/gmi,
  ];
  for (const pattern of fillerPatterns) {
    result = result.replace(pattern, "");
  }

  // 5. Clean up any resulting double blank lines
  result = result.replace(/\n{3,}/g, "\n\n");

  return result.trim() + "\n";
}

export interface DraftResult {
  tenderId: string;
  analysis: llm.TenderAnalysis;
  draft: string;
  version: number;
  sectionDetails: Array<{
    id: string;
    title: string;
    contentType: string;
    pagesUsed: number;
    hasGaps: boolean;
  }>;
}

/**
 * Full pipeline: take a tender PDF, generate a structured draft.
 * Uses single-pass generation for coherent, properly formatted output.
 */
export type ProgressCallback = (step: string, detail?: string) => void;

export async function generateDraft(
  buffer: Buffer,
  filename: string,
  onProgress?: ProgressCallback
): Promise<DraftResult> {
  // 1. Parse the tender document
  onProgress?.("parsing", "Parsing document...");
  const tenderText = await parseDocument(buffer, filename);

  // 2. Save the raw tender
  const tenderId = filename
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .toLowerCase();

  await storage.saveRawDocument(filename, buffer, "tenders_received");

  // 3. Analyze the tender structure
  onProgress?.("analyzing", "Analyzing tender structure...");
  const analysis = await llm.analyzeTender(tenderText);
  onProgress?.("analyzing_done", `Found ${analysis.sections.length} sections: ${analysis.sections.map(s => s.title).join(", ")}`);
  await storage.saveDraftAnalysis(tenderId, JSON.stringify(analysis, null, 2));

  // 4. Retrieve ALL relevant wiki content for ALL sections at once
  onProgress?.("retrieving", "Retrieving knowledge base content...");
  const allWikiContentParts: string[] = [];
  const sectionDetails: DraftResult["sectionDetails"] = [];
  const seenPages = new Set<string>();

  for (let i = 0; i < analysis.sections.length; i++) {
    const section = analysis.sections[i];
    onProgress?.("retrieving_section", `Section ${i + 1}/${analysis.sections.length}: ${section.title}`);

    const wikiContent = await wiki.retrieveForSection(
      section.requirement,
      section.contentType
    );

    // Track pages used per section (for metadata)
    const pagesUsed = (wikiContent.match(/--- Source:/g) || []).length;
    sectionDetails.push({
      id: section.id,
      title: section.title,
      contentType: section.contentType,
      pagesUsed,
      hasGaps: false, // will be updated after draft generation
    });

    // Deduplicate: don't send the same wiki page content twice
    const pageMatches = wikiContent.match(/--- Source: [\s\S]*?(?=--- Source:|$)/g) || [];
    for (const pageBlock of pageMatches) {
      const sourceMatch = pageBlock.match(/--- Source: (.+?) ---/);
      const sourcePath = sourceMatch?.[1] || "";
      if (!seenPages.has(sourcePath)) {
        seenPages.add(sourcePath);
        allWikiContentParts.push(pageBlock);
      }
    }
  }

  const allWikiContent = allWikiContentParts.join("\n\n");

  // 5. Get valid team members (only those with CVs on disk)
  onProgress?.("team", "Loading team member profiles...");
  const validTeamMembers = await getValidTeamMembers();

  // 5b. Load and rank past tender references by similarity to input
  onProgress?.("references", "Loading past tender references...");
  const pastRefs = await loadPastReferences();
  const ranked = rankReferences(tenderText, pastRefs);
  if (ranked.length > 0) {
    onProgress?.("references", `Best match: ${ranked[0].title} (${(ranked[0].similarity * 100).toFixed(0)}% similar)`);
  }

  // 6. Generate the complete draft in a single pass
  onProgress?.("drafting", "Generating complete draft (this is the big one)...");
  const fullDraft = await llm.draftFullResponse(
    tenderText,
    analysis,
    allWikiContent,
    validTeamMembers,
    ranked.map(r => ({
      title: r.title,
      reference: r.reference,
      client: r.client,
      content: r.content,
      similarity: r.similarity,
    }))
  );

  // 7. Hard-coded post-processing (deterministic, no AI)
  onProgress?.("postprocessing", "Post-processing and saving...");
  const cleanDraft = postProcessDraft(fullDraft);

  // 8. Update gap detection in section details
  for (const detail of sectionDetails) {
    detail.hasGaps = cleanDraft.includes("[NEEDS INPUT:");
  }

  // 9. Save draft
  const version = 1;
  await storage.saveDraft(tenderId, cleanDraft, version);

  onProgress?.("done", "Draft complete!");

  return {
    tenderId,
    analysis,
    draft: cleanDraft,
    version,
    sectionDetails,
  };
}

/**
 * Regenerate a single section of an existing draft.
 */
export async function regenerateSection(
  tenderId: string,
  sectionId: string,
  userInstruction?: string
): Promise<string> {
  // Read the analysis
  const analysisRaw = await storage.readDraftAnalysis(tenderId);
  if (!analysisRaw) throw new Error("No analysis found for this tender");
  const analysis = JSON.parse(analysisRaw) as llm.TenderAnalysis;

  const section = analysis.sections.find((s) => s.id === sectionId);
  if (!section) throw new Error(`Section ${sectionId} not found`);

  // Retrieve fresh content
  const requirement = userInstruction
    ? `${section.requirement}\n\nAdditional instruction: ${userInstruction}`
    : section.requirement;

  const wikiContent = await wiki.retrieveForSection(
    requirement,
    section.contentType
  );

  const tenderContext = `Tender: ${analysis.title}\nReference: ${analysis.reference}\nClient: ${analysis.client}`;

  return await llm.draftSection(
    section.title,
    requirement,
    wikiContent,
    tenderContext
  );
}
