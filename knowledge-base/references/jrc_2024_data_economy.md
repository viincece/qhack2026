---
title: "JRC 2024 — European Data Economy Monitoring Tool"
reference: "JRC/2024/OP/0019"
client: "European Commission — Joint Research Centre (JRC), Seville"
sections: 5
word_count: 1400
---

# European Data Economy Monitoring Tool — Phase III Update and Enhancement

## Technical Tender

**Contracting authority**
European Commission — Joint Research Centre (JRC), Seville

## Executive Summary

Meridian Intelligence GmbH proposes to deliver Phase III of the European Data Market Monitoring Tool (EDM), building on our established track record in web-based organisational data collection and our direct experience with the EDM methodology from previous phases. We bring enhanced NLP pipeline capabilities, a redesigned indicator derivation framework aligned with the European Data Act and Data Governance Act, and a new API delivery mechanism enabling near-real-time access to indicator updates for JRC staff and Commission policy teams.

Our proposed approach combines Meridian's large-scale web data infrastructure with targeted survey design (subcontracted to a survey specialist) and structured stakeholder engagement. The result is a monitoring tool that is more granular, more timely, and more actionable than its predecessor.

## 1. Understanding of the Assignment

The European Data Market Study has been a cornerstone of evidence-based EU data policy since its first edition in 2016. Phase III faces two challenges simultaneously: updating the empirical baseline (the data economy has changed substantially since Phase II); and extending the methodology to capture developments that Phase II did not adequately cover — including data intermediaries under the Data Governance Act, cloud and edge computing markets, and AI-data service bundles.

The key methodological challenge is that the data economy is a poor fit for standard NACE-based enumeration. 'Data companies' as defined in the EDM framework include firms that would be classified in NACE J62 (software), J63 (data processing), or even C26 (electronics) — but also many that self-classify elsewhere. Identifying this population reliably at EU-wide scale requires web-based signal analysis, not just database filtering.

## 2. Methodology

### 2.1 Population Identification — Enhanced WebMap Application
We will apply Meridian's WebMap methodology to construct the Phase III entity universe, with the following enhancements relative to Phase II:
- Extension of coverage to include data intermediaries under Article 10 of the Data Governance Act — a new entity class not present in Phase II
- Updated NLP classifiers trained on web content from known data economy actors in 2023–2024 (as opposed to Phase II classifiers trained on 2019–2020 data)
- New supply chain linkage module identifying upstream data providers and downstream AI/analytics consumers
- Improved SME detection: Phase II underrepresented data companies with <10 employees; the new pipeline includes micro-enterprise-specific signals (Freelance platform profiles, GitHub organisation pages, B2B marketplace listings)

### 2.2 Indicator Framework

| Indicator dimension | Phase II approach | Phase III enhancement |
|---|---|---|
| Revenue estimation | Top-down sector benchmarks | Bottom-up from registry accounts + web signals; individual-level estimates for named entities |
| Employment | Eurostat aggregates | LinkedIn-derived firm-level bands, validated against Eurostat SSBF |
| Data intensity | Binary flag | Continuous score (0–1) derived from share of data-related content in web corpus |
| AI involvement | Not measured | New indicator: AI product/service signal derived from NLP classifier |
| Cross-border activity | Country of HQ only | Operational geography: countries with significant web presence or job postings |

### 2.3 Quarterly Update Process
Rather than annual full rebuilds, Phase III will operate on a rolling quarterly update cycle. Each quarter:
- Automated re-crawl of all entity domains in the database (~500,000 active organisations)
- Change detection: entities with >15% cosine distance from previous snapshot flagged for review
- New entrant sweep: pipeline re-run on candidate seed universe to identify organisations meeting scope criteria since last update
- Structured change log delivered alongside updated dataset

## 3. Work Plan

| Phase | Activities | Timeline |
|---|---|---|
| Phase 0 — Setup | Inception report; methodology documentation; API architecture design | Months 1–2 |
| Phase 1 — Baseline | Full pipeline run; entity universe construction; baseline indicator delivery | Months 3–8 |
| Phase 2 — Monitoring (Year 1) | Q1–Q4 quarterly updates; Annual trend report; capacity building | Months 9–20 |
| Phase 3 — Monitoring (Year 2) | Q5–Q8 quarterly updates; Annual trend report; Final evaluation | Months 21–24 |

## 4. Team

| Name | Organisation | Role | Days |
|---|---|---|---|
| Dr. Anna Becker | Meridian Intelligence | Project Director | 45 |
| Thomas Vogel | Meridian Intelligence | Technical Architect | 130 |
| Sofia Chen | Meridian Intelligence | Policy Research Lead | 85 |
| Marcus Weber | Meridian Intelligence | Data Science Lead | 110 |
| Andrei Popescu | Meridian Intelligence | Junior Data Engineer | 80 |

## 5. Price Summary

| Cost category | Total (EUR) |
|---|---|
| Staff costs (all roles combined) | 472,000 |
| Infrastructure and data licences | 58,000 |
| Survey subcontract (Year 1) | 45,000 |
| Survey subcontract (Year 2) | 35,000 |
| Stakeholder engagement events (x4) | 18,000 |
| Travel and subsistence | 14,000 |
| Contingency (5%) | 32,100 |
| TOTAL (excl. VAT) | 674,100 |
