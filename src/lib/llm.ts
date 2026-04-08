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

export async function draftFullResponse(
  tenderText: string,
  analysis: TenderAnalysis,
  allWikiContent: string,
  validTeamMembers: string[] = []
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

REFERENCE — a complete past Meridian tender (note the density and length):

# Cybersecurity SME Landscape in the EU: Market Mapping and Supply Chain Analysis

## Technical Tender

**Contracting authority**
ENISA — EU Agency for Cybersecurity, Athens

## Executive Summary

Meridian Intelligence GmbH proposes a systematic, evidence-based mapping of the EU cybersecurity SME landscape across all 27 member states, combining large-scale web data analysis with structured verification procedures. Our approach identifies cybersecurity-relevant organisations that are invisible to commercial databases — including niche product specialists, managed security service providers, and technology integrators operating below the visibility threshold of standard industry registries.

The deliverable is a structured, machine-readable dataset of 14,000+ verified SMEs with full indicator profiles, updated quarterly, covering supply chain linkages across eight CRA-relevant product categories. The methodology is fully aligned with the ECSMAF and can be adapted to ENISA's ongoing market surveillance requirements beyond the duration of this contract.

## 1. Understanding of Objectives

The objective of this tender is to support ENISA in building a comprehensive, evidence-based understanding of the EU cybersecurity SME landscape — the organisations that develop, integrate, and operate cybersecurity products and services, and the supply chain relationships that connect them.

The core challenge is a population problem. Standard commercial databases reliably cover large, named cybersecurity vendors. They systematically miss the long tail: the 10-person vulnerability assessment specialist in Tallinn, the industrial OT security provider in Stuttgart, the cloud security integration firm in Warsaw. These organisations are relevant to ENISA's mandate — including under the CRA and NIS2 — but they do not appear in standard filtering of company databases by NACE code or keyword.

Meridian's approach is designed specifically for this problem. We identify relevance through hard evidence in organisations' own web content — product descriptions, service offerings, job postings, technical certifications — rather than relying on self-reported classifications or database labels.

## 2. Proposed Methodology

### 2.1 Scope Definition
Working from the CRA product category taxonomy and the NIS2 entity scope definitions, we will define a precise classification specification identifying the types of organisations in scope, the evidence types accepted for each category, and the rejection criteria for ambiguous cases. This specification will be submitted as part of the Inception Report (Deliverable D1) and approved by ENISA before data collection begins.

### 2.2 Seed Universe Construction
We construct a seed universe from three source tiers:
- Tier 1: National company registries for all 27 EU member states, accessed via OpenCorporates API, supplemented by Eurostat SIREN/FAME data.
- Tier 2: Meridian's proprietary web index, covering primary organisational domains for approximately 12 million European organisations.
- Tier 3: Sector-specific registries — BSI IT-Grundschutz certified organisations, Common Criteria evaluation laboratories, ISO 27001 certification lists, FIRST members.

### 2.3 Evidence Classification
Each candidate organisation is scored against the classification specification.

| Evidence type | Weight | Example |
|---|---|---|
| Explicit product/service on own website | High | 'We provide EDR software for industrial control systems' |
| Procurement record as cybersecurity supplier | High | Award notice naming entity for pen testing contract |
| Job posting for cybersecurity-specific role | Medium | Vacancy: 'OT Security Analyst' or 'SIEM Engineer' |
| Technical certification in relevant area | Medium | CREST accreditation, Common Criteria lab status |
| Trade association membership | Low | ECSO membership, BITKOM cybersecurity working group |

### 2.4 Supply Chain Mapping
For the identified SME population, we will derive supply chain linkages using procurement data (TED contract award notices) and web-based relationship signals (partner pages, integration documentation, OEM references). Linkages will be represented as directed edges in a relationship graph, with edge type (supplier, integrator, reseller, OEM) and confidence score.

## 3. Work Plan

| Milestone | Deliverable | Month |
|---|---|---|
| Inception Report — methodology, scope definition, data dictionary | D1 | M2 |
| Baseline dataset — EU27 cybersecurity SME population | D2 | M6 |
| Q1 monitoring update + change log | D3a | M9 |
| Sector deep-dive: CRA high-priority categories | D4 | M11 |
| Q2 monitoring update + change log | D3b | M12 |
| Q3 monitoring update + annual trend analysis | D3c + D5 | M15 |
| Capacity building workshop with ENISA staff | D6 | M16 |
| Final report and Q4 update | D3d + D7 | M18 |

## 4. Team

| Name | Role | Days allocated |
|---|---|---|
| Dr. Anna Becker | Project Director | 36 days |
| Thomas Vogel | Technical Lead — data pipeline and delivery | 110 days |
| Sofia Chen | Policy Lead — scope definition, regulatory context | 70 days |
| Marcus Weber | Data Scientist — NLP classifiers, entity resolution | 90 days |

## 5. Quality Assurance
False-positive rate commitment: <3% in final delivered dataset, verified by 5% random manual audit sample. Coverage commitment: ≥95% of large enterprises (250+), ≥80% of medium enterprises (50–249), ≥70% of small enterprises (10–49) in the relevant population. All commitments documented in the Inception Report and tracked throughout the contract.

## 6. Price

| Cost category | Total (EUR) |
|---|---|
| Staff costs | 399,950 |
| Infrastructure (AWS, data sources, tools) | 36,000 |
| Travel and subsistence | 12,000 |
| Contingency (5%) | 22,397 |
| TOTAL (excl. VAT) | 470,347 |

--- END REFERENCE (note: ~1,500 words total, 3 pages) ---

NOW GENERATE THE RESPONSE FOR THIS TENDER. Match the reference length and density exactly.

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
