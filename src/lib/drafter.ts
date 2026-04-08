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

  // 5. Generate the complete draft in a single pass
  const fullDraft = await llm.draftFullResponse(
    tenderText,
    analysis,
    allWikiContent
  );

  // 6. Update gap detection in section details
  for (const detail of sectionDetails) {
    detail.hasGaps = fullDraft.includes("[NEEDS INPUT:");
  }

  // 7. Save draft
  const version = 1;
  await storage.saveDraft(tenderId, fullDraft, version);

  return {
    tenderId,
    analysis,
    draft: fullDraft,
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
