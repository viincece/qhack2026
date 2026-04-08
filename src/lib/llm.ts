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

const MODEL = "claude-sonnet-4-20250514";

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
        content: `You are a tender analysis expert. Analyze this tender document and extract its structure.

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

Identify ALL sections that a response would need. Read the tender carefully — different tenders need DIFFERENT section structures.

First, identify what the tender EXPLICITLY asks for (evaluation criteria, required sections, terms of reference structure). These take priority.

Then fill in standard sections that are always needed but may not be explicitly listed.

Common sections (include when relevant, but adapt naming and scope to the tender):
- Executive Summary (always)
- Problem Framing / Understanding of the Assignment (when the tender defines a complex problem)
- Technical Approach / Methodology (always — may need subsections)
- Deliverables (as a SEPARATE section when the tender lists specific deliverables or a deliverable schedule)
- Work Plan (when the tender asks for a timeline/milestones — can be combined with Deliverables only if the tender treats them as one)
- Team / Key Personnel (always)
- Quality Assurance (when the tender mentions quality criteria or KPIs)
- Past Experience / References (when the tender evaluates track record)
- Pricing (always the last section)
- Any domain-specific sections the tender requires (e.g., "Entity Typology", "Concentration Analysis", "Risk Assessment Framework")

IMPORTANT: Do NOT always produce the same generic 6 sections. Tailor the sections to THIS specific tender's requirements. If the tender emphasizes deliverables, make that its own section. If it asks for a specific analytical framework, create a section for it.

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

export async function draftFullResponse(
  tenderText: string,
  analysis: TenderAnalysis,
  allWikiContent: string
): Promise<string> {
  const client = getClient();

  // Build the dynamic section outline from the analysis
  const sectionOutline = analysis.sections
    .filter(s => s.contentType !== "executive_summary")
    .map((s, i) => `**${i + 1}. ${s.title}**\nRequirement: ${s.requirement}\nContent type: ${s.contentType}`)
    .join("\n\n");

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 8192,
    messages: [
      {
        role: "user",
        content: `You are a senior tender response writer for Meridian Intelligence GmbH. Generate a COMPLETE tender response document.

DOCUMENT STRUCTURE — follow this EXACTLY:

1. Title block:
# ${analysis.title}

## Technical Tender

**Contracting authority**
${analysis.client}

## Executive Summary
[2 concise paragraphs: what Meridian proposes and what the deliverable is. Use specific numbers.]

2. Then the following NUMBERED SECTIONS (adapted to this specific tender):

${sectionOutline}

IMPORTANT: You MUST include ALL the sections listed above. These were identified from the tender requirements. Each section addresses a specific need. Do NOT skip any. Do NOT merge them. Do NOT substitute sections from a different tender.

If the tender requires a Deliverables section, it must be its OWN numbered section — not folded into Methodology or Work Plan.
If the tender requires a Problem Framing section, write it as its own section.
Adapt the structure to what THIS tender needs.

The LAST numbered section must ALWAYS be Price with a cost breakdown table.

FORMATTING RULES:
- The title uses # (h1). "Technical Tender" and "Executive Summary" use ## (h2).
- ALL numbered sections use **bold** format: **1. Section Title**, **2.1 Subsection**, etc. Do NOT use # or ## for numbered sections.
- ALL tables MUST use proper markdown with header separator rows (|---|---|---|).
- Use tables for: evidence classification, deliverable timelines, team composition, pricing, and any structured data.
- Write in professional, dense EU institutional prose — no marketing language, no filler.
- Every claim must use specific numbers from the knowledge base (EUR amounts, entity counts, F1 scores, timelines).
- If information is missing, write [NEEDS INPUT: what is needed] — never fabricate.
- The document should be 3-4 pages. Be CONCISE.

REFERENCE STYLE — here is how a past Meridian tender looks (for formatting/tone guidance ONLY, NOT for section structure):

# Cybersecurity SME Landscape in the EU: Market Mapping and Supply Chain Analysis

## Technical Tender

**Contracting authority**
ENISA — EU Agency for Cybersecurity, Athens

## Executive Summary

Meridian Intelligence GmbH proposes a systematic, evidence-based mapping of the EU cybersecurity SME landscape across all 27 member states...

**1. Understanding of Objectives**
[Dense paragraphs with specific problem framing]

**2. Proposed Methodology**

**2.1 Scope Definition**
[Concise paragraph with specifics]

**2.2 Evidence Classification**

| Evidence type | Weight | Example |
|---|---|---|
| Explicit product/service on own website | High | 'We provide EDR software' |

**3. Work Plan**

| Milestone | Deliverable | Month |
|---|---|---|
| Inception Report | D1 | M2 |

**4. Team**

| Name | Role | Days allocated |
|---|---|---|
| Dr. Anna Becker | Project Director | 36 days |

**5. Quality Assurance**
[Specific commitments: <3% false-positive rate, etc.]

**6. Price**

| Cost category | Total (EUR) |
|---|---|
| Staff costs | 228,250 |
| TOTAL (excl. VAT) | 290,062 |

--- END REFERENCE ---

NOW GENERATE THE RESPONSE FOR THIS TENDER:

TENDER DOCUMENT:
${tenderText}

KNOWLEDGE BASE CONTENT (use ONLY this information):
${allWikiContent}

Generate the complete tender response now. Use the section structure defined above, NOT the reference example's sections.`,
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
