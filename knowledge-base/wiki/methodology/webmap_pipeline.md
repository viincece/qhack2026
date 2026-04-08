---
title: "WebMap v4.1 Pipeline"
category: methodology
tags: [methodology, webmap, pipeline, data-engineering, nlp, market-mapping, crawling]
source_files: [webmap_methodology.pdf]
last_updated: "2026-04-08"
---

# WebMap v4.1 Pipeline

## Summary

WebMap is Meridian Intelligence GmbH's proprietary data collection and classification framework, in continuous development since 2017 and currently at version 4.1. It is the methodological backbone of all MIG market mapping projects, having been deployed across 25+ engagements. The pipeline consists of five sequential stages: Seed Universe, Web Crawl, Classification, Verification, and Delivery.

## Pipeline Overview

```
Stage 1: Seed Universe
    |
    v
Stage 2: Web Crawl
    |
    v
Stage 3: Classification
    |
    v
Stage 4: Verification
    |
    v
Stage 5: Delivery
```

## Stage 1: Seed Universe

**Purpose**: Construct the initial candidate universe of organisations to investigate.

**Process**:
- Ingest data from Tier 1 sources (high-quality structured databases) and Tier 2 sources (supplementary/niche databases)
- Apply geographic pre-filters (e.g., EU-27, specific member states)
- Apply sector pre-filters (e.g., SIC/NACE codes, keyword-based)
- Output: a seed list of candidate organisations with basic identifiers (name, domain, country, sector hint)

**Scale**: Seed universes typically range from 10,000 to 500,000 candidate entities depending on project scope (see [[company/capabilities]]).

## Stage 2: Web Crawl

**Purpose**: Collect textual evidence from each candidate organisation's web presence.

**Process**:
- Crawl primary domains for each seed entity
- Extract text from key pages: About, Products/Services, Team, and similar high-signal pages
- Store raw HTML and extracted text with metadata (crawl date, URL, HTTP status)
- Handle edge cases: redirects, multi-language sites, CMS-generated content

**Scale**: 30M+ web pages processed to date (see [[team/thomas_vogel]]).

## Stage 3: Classification

**Purpose**: Apply NLP classifiers to determine relevance and assign category labels.

**Process**:
- NLP classifiers assign relevance scores to each entity based on crawled text
- Multi-label classification allows entities to be tagged with multiple categories
- Domain-specific classifiers are trained for each project (see [[methodology/classification_approach]])
- Output: relevance scores and category labels for each entity

**Performance**: F1 scores range from 0.84 to 0.91 across domains (see [[team/marcus_weber]] for per-domain scores).

## Stage 4: Verification

**Purpose**: Hard evidence check to reject false positives and ensure data quality.

**Process**:
- Entities flagged by classifiers undergo evidence verification
- Hard evidence check: requires concrete textual evidence of relevance (not just keyword matching)
- False-positive rejection: systematic removal of incorrectly classified entities
- Target: false-positive rate below 3%, audited on 5% random sample

**Quality**: <3% false-positive rate target, governed by [[methodology/data_quality]] (MIG-QA-001 v3.2).

## Stage 5: Delivery

**Purpose**: Package verified data into structured, versioned outputs for client consumption.

**Process**:
- Generate structured datasets in client-specified formats
- Apply semantic versioning to all deliverables
- Produce change logs documenting additions, removals, and modifications
- Provide API access where specified (e.g., [[projects/jrc_2024_data_economy]])
- Formats: JSON, CSV, Parquet, and Excel (see [[methodology/data_quality]])

## Version History

| Version | Year | Notes |
|---------|------|-------|
| v4.1 | Current | Latest production version |
| v1.0 | 2017 | Initial release |

WebMap has been in continuous development since 2017, with iterative improvements driven by project requirements across 25+ engagements.

## Relevance for Future Tenders

- **Proprietary methodology** is a key differentiator -- demonstrates purpose-built tooling rather than off-the-shelf solutions.
- **25+ projects** of deployment history provides evidence of maturity and reliability.
- **5-stage pipeline** provides a clear, structured narrative for methodology sections of tender proposals.
- **Each stage maps to specific quality controls** (see [[methodology/data_quality]]), allowing detailed description in technical proposals.
- **Adaptability**: The pipeline has been adapted for cybersecurity, data economy, FinTech, deep tech, media, and AI domains -- cite specific adaptations in domain-relevant bids.
- **The pipeline description can be adapted** to match tender-specific terminology (e.g., "data collection and enrichment" instead of "web crawl" if the tender uses that language).

## Source References

- `webmap_methodology.pdf`
