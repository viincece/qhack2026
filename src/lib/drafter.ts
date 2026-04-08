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

// ── Hard-coded post-processing ────────────────────────

/**
 * Enforce format constraints deterministically — no AI involved.
 * Strips LLM verbosity artefacts that survive even strong prompting.
 */
function postProcessDraft(draft: string): string {
  let result = draft;

  // 1. Remove accidental markdown code block wrappers
  result = result.replace(/^```(?:markdown)?\s*\n/m, "");
  result = result.replace(/\n```\s*$/m, "");

  // 2. Ensure table separator rows exist (fix missing |---|---|)
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
export async function generateDraft(
  buffer: Buffer,
  filename: string
): Promise<DraftResult> {
  // 1. Parse the tender document
  const tenderText = await parseDocument(buffer, filename);

  // 2. Save the raw tender
  const tenderId = filename
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .toLowerCase();

  await storage.saveRawDocument(filename, buffer, "tenders_received");

  // 3. Analyze the tender structure
  const analysis = await llm.analyzeTender(tenderText);
  await storage.saveDraftAnalysis(tenderId, JSON.stringify(analysis, null, 2));

  // 4. Retrieve ALL relevant wiki content for ALL sections at once
  const allWikiContentParts: string[] = [];
  const sectionDetails: DraftResult["sectionDetails"] = [];
  const seenPages = new Set<string>();

  for (const section of analysis.sections) {
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
  const validTeamMembers = await getValidTeamMembers();

  // 6. Generate the complete draft in a single pass
  const fullDraft = await llm.draftFullResponse(
    tenderText,
    analysis,
    allWikiContent,
    validTeamMembers
  );

  // 7. Hard-coded post-processing (deterministic, no AI)
  const cleanDraft = postProcessDraft(fullDraft);

  // 8. Update gap detection in section details
  for (const detail of sectionDetails) {
    detail.hasGaps = cleanDraft.includes("[NEEDS INPUT:");
  }

  // 9. Save draft
  const version = 1;
  await storage.saveDraft(tenderId, cleanDraft, version);

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
