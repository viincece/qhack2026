/**
 * Claude API integration for the tender agent.
 * All LLM calls go through here.
 */

import Anthropic from "@anthropic-ai/sdk";

function getClient(): Anthropic {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to .env.local"
    );
  }
  return new Anthropic({ apiKey: key });
}

const MODEL = "claude-opus-4-20250514";

// ── Analyze a tender document ───────────────────────────

export interface TenderSection {
  id: string;
  title: string;
  requirement: string;
  contentType: string; // e.g. "company_profile", "methodology", "team", "past_experience", etc.
}

export interface TenderAnalysis {
  title: string;
  reference: string;
  client: string;
  deadline: string;
  estimatedValue: string;
  sections: TenderSection[];
  summary: string;
}

export async function analyzeTender(tenderText: string): Promise<TenderAnalysis> {
  const client = getClient();

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `You are a tender analysis expert. Analyze this tender document and extract ONLY the sections it explicitly requires.

Return a JSON object with this exact structure (no markdown, just raw JSON):
{
  "title": "tender title",
  "reference": "reference number",
  "client": "contracting authority",
  "deadline": "submission deadline",
  "estimatedValue": "contract value",
  "summary": "2-3 sentence summary of what the tender requires",
  "sections": [
    {
      "id": "section_1",
      "title": "Section Title",
      "requirement": "What this section requires in detail",
      "contentType": "one of: company_profile, past_experience, methodology, team, quality_assurance, project_management, deliverables, pricing, references, technical_approach, executive_summary, other"
    }
  ]
}

CRITICAL RULES FOR SECTION IDENTIFICATION:
1. ONLY include sections that the tender document EXPLICITLY asks for — through evaluation criteria, required response structure, terms of reference, or specific instructions about what the response must contain.
2. Do NOT invent sections the tender does not request. If the tender does not mention quality assurance, do not add a quality assurance section.
3. Do NOT pad with generic "standard" sections. If the tender asks for 4 things, return 4 sections (plus pricing).
4. Always include an Executive Summary as section 1 and Pricing as the final section — these are inherently needed for any tender response.
5. Use the EXACT section titles from the tender where provided. Do not rename them.
6. Read the evaluation criteria carefully — they define what sections are scored and therefore required.

TENDER DOCUMENT:
${tenderText}`,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";
  // Extract JSON from response (may be wrapped in markdown code blocks)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse tender analysis from LLM response");
  }
  return JSON.parse(jsonMatch[0]) as TenderAnalysis;
}

// ── Retrieve relevant wiki pages for a section ──────────

export async function findRelevantPages(
  sectionRequirement: string,
  contentType: string,
  wikiIndex: string
): Promise<string[]> {
  const client = getClient();

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `You are a knowledge base retrieval system. Given a tender section requirement, identify which wiki pages are most relevant.

WIKI INDEX:
${wikiIndex}

SECTION REQUIREMENT:
${sectionRequirement}

CONTENT TYPE NEEDED: ${contentType}

Return a JSON array of wiki page paths (relative to wiki/), ordered by relevance. Include 3-8 pages.
Example: ["company/profile.md", "projects/enisa_2023_cybersecurity.md", "boilerplate/company_intro.md"]

Return ONLY the JSON array, no other text.`,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";
  const arrMatch = text.match(/\[[\s\S]*\]/);
  if (!arrMatch) return [];
  return JSON.parse(arrMatch[0]) as string[];
}

// ── Draft a single section ──────────────────────────────

export async function draftSection(
  sectionTitle: string,
  sectionRequirement: string,
  wikiContent: string,
  tenderContext: string
): Promise<string> {
  const client = getClient();

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `You are a tender response writer for Meridian Intelligence GmbH. Draft a section for a tender response.

RULES:
1. Use ONLY the provided wiki content as source material. Do not invent facts, figures, or claims.
2. Adapt the tone to be professional and directly responsive to the tender's requirements.
3. If the wiki content does not adequately cover something the section needs, write: [NEEDS INPUT: description of what is missing]
4. Use specific numbers, dates, and project references from the wiki content.
5. Write in a confident but factual tone typical of EU institutional tender responses.
6. Structure the section with clear headings and bullet points where appropriate.

TENDER CONTEXT:
${tenderContext}

SECTION: ${sectionTitle}
REQUIREMENT: ${sectionRequirement}

AVAILABLE KNOWLEDGE BASE CONTENT:
${wikiContent}

Write the draft section now. Use markdown formatting.`,
      },
    ],
  });

  return response.content[0].type === "text" ? response.content[0].text : "";
}

// ── Draft complete tender response (single pass) ────────

export interface RankedReference {
  title: string;
  reference: string;
  client: string;
  content: string;
  similarity: number;
}

export async function draftFullResponse(
  tenderText: string,
  analysis: TenderAnalysis,
  allWikiContent: string,
  validTeamMembers: string[] = [],
  rankedReferences: RankedReference[] = []
): Promise<string> {
  const client = getClient();

  // Build the dynamic section outline from the analysis
  const sectionOutline = analysis.sections
    .filter(s => s.contentType !== "executive_summary")
    .map((s, i) => `## ${i + 1}. ${s.title}\nRequirement: ${s.requirement}\nContent type: ${s.contentType}`)
    .join("\n\n");

  // Team constraint block
  const teamConstraint = validTeamMembers.length > 0
    ? `\nALLOWED TEAM MEMBERS — you may ONLY use these people in the Team section and staffing tables. Do NOT invent other team members:\n${validTeamMembers.map(n => `- ${n}`).join("\n")}\nIf the tender requires more roles than there are team members, write [NEEDS INPUT: additional team member for <role>] instead of fabricating a person.\n`
    : "";

  // Compute word budget: scale with number of sections, but cap to match past tender lengths
  const numSections = analysis.sections.filter(s => s.contentType !== "executive_summary").length;
  // Past tenders: ENISA (6 sections, ~1500 words), EBA (6 sections, ~1200 words), JRC (5 sections, ~1400 words)
  // Base: 1200 words + 50 words per section above 4
  const wordBudget = Math.min(1500, 1200 + Math.max(0, numSections - 4) * 50);

  // Build reference block from ranked past tenders
  let referenceBlock = "";
  if (rankedReferences.length > 0) {
    const primary = rankedReferences[0];
    const others = rankedReferences.slice(1);

    referenceBlock = `
PRIMARY REFERENCE — This is the most similar past Meridian tender (similarity: ${(primary.similarity * 100).toFixed(0)}%). Your output MUST match its structure, tone, density, and formatting as closely as possible. If the input tender covers the same topic, reproduce the reference content with only the minimal changes needed to address any differences in the tender requirements.

<primary_reference title="${primary.title}" ref="${primary.reference}">
${primary.content}
</primary_reference>

--- END PRIMARY REFERENCE ---`;

    if (others.length > 0) {
      referenceBlock += `

ADDITIONAL REFERENCES — These are other past Meridian tenders. Use them to understand the consistent patterns across all Meridian responses (heading style, table formats, section density, tone).

${others.map(ref => `<reference title="${ref.title}" ref="${ref.reference}" similarity="${(ref.similarity * 100).toFixed(0)}%">
${ref.content}
</reference>`).join("\n\n")}

--- END ADDITIONAL REFERENCES ---`;
    }

    referenceBlock += `

STYLE CONSISTENCY RULES (derived from ALL past references):
- Executive Summary: exactly 2 paragraphs, first states what Meridian proposes, second states the concrete deliverable with numbers
- Section 1 is always "Understanding of Objectives" / "Problem Framing" — frames the challenge, then explains Meridian's approach
- Methodology sections use ### subsections (2.1, 2.2, etc.) with tables for classification schemes
- Work Plan / Deliverables: always a table with milestone/deliverable/month columns
- Team: always a table with Name/Role/Days columns, NO prose
- Price: always a table with cost categories, always ends with TOTAL (excl. VAT) row
- NO concluding paragraphs after the price table
- Every sentence carries a fact, number, or specific commitment
- Use "Meridian" (not "we" or "our team") when referring to the company in technical descriptions`;
  }

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `You are a senior tender response writer for Meridian Intelligence GmbH. Generate a COMPLETE tender response document.

ABSOLUTE WORD LIMIT: The ENTIRE document must be ${wordBudget}–${wordBudget + 200} words (including table content). This is non-negotiable. Past Meridian tenders are exactly 3 PDF pages / ~1,200–1,500 words. Match that density.

WORD BUDGETS PER SECTION:
- Executive Summary: 80–120 words (exactly 2 paragraphs)
- Each content section (methodology, team, deliverables, etc.): 100–250 words
- Sections with tables: the table + 1 short intro paragraph (no more)
- Team section: table ONLY, no prose
- Price section: table ONLY, no prose
- Do NOT write concluding paragraphs, transition sentences, or summaries at the end

DOCUMENT STRUCTURE — follow this EXACTLY:

# ${analysis.title}

## Technical Tender

**Contracting authority**
${analysis.client}

## Executive Summary
[2 short paragraphs: what Meridian proposes and what the deliverable is. Specific numbers. 80–120 words total.]

Then the following NUMBERED SECTIONS:

${sectionOutline}

SECTION RULES:
- Include ALL sections listed above and ONLY those sections.
- Do NOT skip, merge, or reorder.
- Do NOT add sections not listed above.
- The LAST numbered section must ALWAYS be Price with a cost breakdown table.
${teamConstraint}
HEADING HIERARCHY:
- Title: # (h1)
- "Technical Tender", "Executive Summary": ## (h2)
- Main numbered sections (1., 2., 3.): ## (h2)
- Subsections (2.1, 2.2): ### (h3)
- Sub-subsections (2.1.1): #### (h4)

CONCISENESS RULES — these override all other instincts:
- Every sentence must carry a fact, number, or specific commitment. Delete any sentence that doesn't.
- Use tables instead of prose for structured information (deliverables, timelines, team, pricing, classification schemes).
- When a table is present, write at most ONE introductory sentence before it.
- NO transition sentences between sections ("In this section we will...", "As outlined above...").
- NO concluding/summary paragraphs at the end of the document.
- NO marketing language ("we are pleased to", "unique position", "comprehensive solution").
- Bullet points only when listing 3+ parallel items. Otherwise use prose.

FORMATTING:
- ALL tables: proper markdown with |---|---| separator rows.
- If information is missing: [NEEDS INPUT: what is needed] — never fabricate.
${referenceBlock}

NOW GENERATE THE RESPONSE FOR THIS TENDER. Match the primary reference's length, density, and style exactly.

TENDER DOCUMENT:
${tenderText}

KNOWLEDGE BASE CONTENT (use ONLY this information):
${allWikiContent}`,
      },
    ],
  });

  return response.content[0].type === "text" ? response.content[0].text : "";
}

// ── Ingest a document into the wiki ─────────────────────

export interface WikiPageUpdate {
  path: string;
  content: string;
  action: "create" | "update";
}

export async function generateWikiPages(
  documentText: string,
  filename: string,
  existingIndex: string,
  schemaRules: string
): Promise<WikiPageUpdate[]> {
  const client = getClient();

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 8192,
    messages: [
      {
        role: "user",
        content: `You are a wiki maintainer for Meridian Intelligence GmbH's knowledge base.

A new document has been added to the raw sources. Your job is to create or update wiki pages based on its content.

SCHEMA RULES:
${schemaRules}

CURRENT WIKI INDEX:
${existingIndex}

NEW DOCUMENT (filename: ${filename}):
${documentText}

Analyze the document and return a JSON array of wiki page operations:
[
  {
    "path": "category/page_slug.md",
    "content": "full markdown content with YAML frontmatter",
    "action": "create or update"
  }
]

RULES:
1. Every page MUST have YAML frontmatter (title, category, tags, source_files, last_updated with today's date 2026-04-08)
2. Use [[wiki-links]] for cross-references
3. Include a "Relevance for Future Tenders" section where applicable
4. If this document updates information already in the wiki, provide the COMPLETE updated page content
5. Be factually accurate — only use information from the document
6. Follow the naming conventions from the schema

Return ONLY the JSON array, no other text.`,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";
  const arrMatch = text.match(/\[[\s\S]*\]/);
  if (!arrMatch) return [];
  return JSON.parse(arrMatch[0]) as WikiPageUpdate[];
}

// ── Update the wiki index ───────────────────────────────

export async function generateUpdatedIndex(
  currentIndex: string,
  newPages: Array<{ path: string; title: string }>
): Promise<string> {
  const client = getClient();

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `You are a wiki index maintainer. Update the wiki index to include new pages.

CURRENT INDEX:
${currentIndex}

NEW/UPDATED PAGES TO ADD:
${JSON.stringify(newPages, null, 2)}

Return the COMPLETE updated index.md content (with YAML frontmatter). Add the new pages into the appropriate category sections. Maintain the existing table format. Update the last_updated date to 2026-04-08.

Return ONLY the markdown content, no code blocks or extra text.`,
      },
    ],
  });

  return response.content[0].type === "text" ? response.content[0].text : currentIndex;
}
