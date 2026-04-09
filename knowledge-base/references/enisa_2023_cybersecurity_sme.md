---
title: "ENISA 2023 — Cybersecurity SME Landscape"
reference: "ENISA/2023/OP/0008"
client: "ENISA — EU Agency for Cybersecurity, Athens"
sections: 6
word_count: 1500
---

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
| Julia Schneider | Research Analyst — verification, report writing | 65 days |

## 5. Quality Assurance
False-positive rate commitment: <3% in final delivered dataset, verified by 5% random manual audit sample. Coverage commitment: ≥95% of large enterprises (250+), ≥80% of medium enterprises (50–249), ≥70% of small enterprises (10–49) in the relevant population. All commitments documented in the Inception Report and tracked throughout the contract.

## 6. Price

| Item | Days | Day rate (EUR) | Total (EUR) |
|---|---|---|---|
| Dr. Anna Becker — Project Director | 36 | 1,450 | 52,200 |
| Thomas Vogel — Technical Lead | 110 | 1,100 | 121,000 |
| Sofia Chen — Policy Lead | 70 | 1,100 | 77,000 |
| Marcus Weber — Data Scientist | 90 | 1,050 | 94,500 |
| Julia Schneider — Research Analyst | 65 | 850 | 55,250 |
| Infrastructure (AWS, data sources, tools) | — | — | 36,000 |
| Travel and subsistence | — | — | 12,000 |
| Contingency (5%) | — | — | 22,397 |
| TOTAL (excl. VAT) | — | — | 470,347 |
