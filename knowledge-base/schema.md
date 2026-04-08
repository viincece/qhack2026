# Knowledge Base Schema & Governance Rules

## Purpose

This document defines the rules for maintaining the Meridian Intelligence GmbH (MIG) tender knowledge base wiki. Any LLM agent that reads, writes, or updates pages in the wiki MUST follow these rules.

## Directory Structure

```
knowledge-base/
  schema.md              <-- THIS FILE (governance rules)
  wiki/
    index.md             <-- Master catalog of all pages
    log.md               <-- Change log (append-only)
    company/
      profile.md         <-- Legal entity, address, financials
      capabilities.md    <-- Service lines, capacity metrics
    team/
      overview.md        <-- Skills matrix, availability
      <person_name>.md   <-- One page per key team member
    projects/
      overview.md        <-- Summary table of all past projects
      <project_slug>.md  <-- One page per project
    methodology/
      webmap_pipeline.md <-- WebMap v4.1 pipeline description
      data_quality.md    <-- QA procedures (MIG-QA-001)
      classification_approach.md <-- NLP/ML classification details
    past_responses/
      <response_slug>.md <-- Narrative from past tender submissions
    boilerplate/
      company_intro.md   <-- Reusable intro paragraphs
      quality_assurance.md <-- Reusable QA section text
      references.md      <-- Reusable project reference table
```

## Page Format Rules

### 1. YAML Frontmatter (Required)

Every `.md` file under `wiki/` MUST begin with YAML frontmatter:

```yaml
---
title: "Human-readable page title"
category: company | team | projects | methodology | past_responses | boilerplate
tags: [tag1, tag2, tag3]
source_files: [file1.pdf, file2.xlsx]
last_updated: "YYYY-MM-DD"
---
```

- `title`: Concise, descriptive title.
- `category`: Must match the subdirectory name.
- `tags`: Lowercase, hyphenated keywords for retrieval (e.g., `market-mapping`, `nlp`, `enisa`).
- `source_files`: List of original source documents this page derives from.
- `last_updated`: ISO 8601 date of last substantive edit.

### 2. Wiki Links

Use double-bracket links to cross-reference other pages:

```
[[page_slug]]           -> links to wiki/<category>/<page_slug>.md
[[category/page_slug]]  -> explicit path when ambiguous
```

Examples: `[[anna_becker]]`, `[[webmap_pipeline]]`, `[[enisa_2023_cybersecurity]]`

### 3. Content Sections

Pages SHOULD include these sections where applicable:

- **Summary** -- 2-4 sentence overview
- **Details** -- Structured body (tables, lists, prose)
- **Relevance for Future Tenders** -- How this content can be reused in bids
- **Source References** -- Which source files were used

### 4. Factual Accuracy

- NEVER fabricate data. Every claim must trace to a source file listed in `source_files`.
- Use exact figures (currency, counts, dates) from source documents.
- If a value is uncertain, mark it with `[unverified]`.

### 5. Change Log Protocol

When any page is created or updated:

1. Append a line to `wiki/log.md` in this format:
   ```
   | YYYY-MM-DD | <page_path> | created/updated | <brief description> |
   ```
2. Update `last_updated` in the page's frontmatter.
3. Update `wiki/index.md` if a new page was added.

### 6. Tagging Conventions

Use these standard tags consistently:

| Tag | Meaning |
|-----|---------|
| `market-mapping` | Market/ecosystem mapping work |
| `nlp` | NLP/ML classification |
| `data-engineering` | Data pipelines, crawling, ETL |
| `policy` | EU/national policy analysis |
| `cybersecurity` | Cybersecurity domain |
| `fintech` | FinTech/DORA domain |
| `data-economy` | Data economy domain |
| `media` | Media market domain |
| `deep-tech` | Deep tech / industrial tech |
| `ai` | Artificial intelligence domain |
| `supply-chain` | Supply chain analysis |
| `eu-institution` | EU institutional client |
| `german-federal` | German federal client |
| `boilerplate` | Reusable tender text |
| `webmap` | WebMap pipeline/methodology |
| `quality-assurance` | QA procedures |

### 7. Naming Conventions

- File slugs: lowercase, underscores, no spaces. E.g., `anna_becker.md`, `enisa_2023_cybersecurity.md`.
- Project slugs: `<client>_<year>_<short_topic>.md`
- Response slugs: `<client>_<year>_response.md`

### 8. Retrieval Guidance

When an agent needs to answer a tender-related question:

1. Start with `wiki/index.md` to locate relevant pages.
2. Follow `[[wiki-links]]` to navigate.
3. Use `tags` for semantic search.
4. Check `past_responses/` for reusable narrative.
5. Check `boilerplate/` for standard text blocks.
6. Cross-reference `projects/` and `team/` for evidence of capability.
