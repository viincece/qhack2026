---
title: "Data Quality and Validation Procedures"
category: methodology
tags: [quality-assurance, validation, deduplication, delivery, data-quality]
source_files: [data_quality_procedures.txt]
last_updated: 2026-04-08
---

# Data Quality and Validation Procedures

Internal Reference: MIG-QA-001 v3.2

## Overview
Meridian's standard procedures for ensuring quality, accuracy, and consistency of organisational datasets. Applies to all projects regardless of client or scope.

## Four-Stage Quality Lifecycle

### Stage 1: Ingestion and Deduplication
- **Source prioritisation**: Tier 1 (official registries, VAT DBs, Eurostat FAME) → Tier 2 (organisational websites) → Tier 3 (LinkedIn, Crunchbase, news)
- Tier 1 = canonical authority for legal name, registration country, company ID
- Tier 2/3 = capability and activity signals only
- **Deduplication protocol** (3-stage):
  1. Exact match on VAT or national registration number
  2. Fuzzy name matching (Jaro-Winkler threshold: 0.92) within same country
  3. Domain-level matching (same primary web domain = same entity)
- All probable duplicates reviewed manually before merging; merge decisions logged

### Stage 2: Entity Verification and False-Positive Rejection
- Each classified entity passes a verification check before client delivery:
  - Primary web domain is active and reachable
  - At least one piece of **hard evidence** supports the classification
  - Entity is a genuine legal organisation (not shell, holding, or redirect)
  - Country of establishment correctly assigned
- **Hard evidence requirements** (at least one must be present):
  - Explicit product/service description matching classification criteria
  - Procurement record naming the entity as supplier/contractor
  - Job posting for relevant role (within last 18 months)
  - Patent filing or certification in relevant technical area
  - Self-reported membership in relevant industry association
- Generic keywords ("digital solutions", "innovation") are NOT accepted as evidence in isolation
- **Target false-positive rate: <3%** — audited on random 5% sample of each dataset

### Stage 3: Indicator Derivation and Validation
- Derived indicators: employee size band, revenue band, primary NACE code, activity start year
- Automated validation rules:
  - Employee count vs. revenue band must be internally consistent
  - NACE code must match registry-reported code at 2-digit level in >80% of cases
  - Activity start year: ≤ current year and ≥ 1900
  - Country = valid ISO 3166-1 alpha-2 code
- Records failing validation are quarantined before delivery

### Stage 4: Delivery and Change Tracking
- **Formats**: JSON (preferred), CSV, Parquet (machine-readable); Excel with data dictionary (human-readable)
- **Change log protocol**: every update includes additions, deletions, indicator changes
  - Change types: NEW_ENTITY, REMOVED_ENTITY, INDICATOR_UPDATE, VERIFICATION_UPDATE
- **Semantic versioning**: MAJOR (schema changes), MINOR (data updates), PATCH (corrections)
- **Retention**: raw source data 36 months, processed datasets 60 months

## Governance
- Monthly quality meeting: FP audit results, coverage monitoring, validation failure rates, escalation decisions
- Client feedback loop: logged in issue tracker, triaged within 3 working days
- Critical errors (>1% of dataset) corrected and redelivered within 10 working days

## Relevance for Future Tenders
- Demonstrates rigorous, documented QA processes — strong for compliance-focused tenders
- Specific, quantifiable targets (<3% FP, coverage tiers) provide credible quality commitments
- Change tracking and versioning show mature delivery practices
- See also: [[webmap_pipeline]], [[classification_approach]]
