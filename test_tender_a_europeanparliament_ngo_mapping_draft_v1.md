# Mapping and Monitoring of Civil Society Organisations Active in EU Policy Processes

## Technical Tender

**Contracting authority**
European Parliament — DG OPPD (Office for Promotion of Parliamentary Democracy)

## Executive Summary

Meridian Intelligence GmbH proposes a systematic mapping and continuous monitoring system for civil society organisations active in EU policy processes, combining evidence-based identification via web data analysis with structured classification aligned to European Parliament committee domains. Our approach identifies organisations invisible to the EU Transparency Register — including national NGOs participating in EU consultations, academic institutes publishing EU policy research, and grassroots coalitions mobilising around EU legislative files — through observable participation signals rather than self-reported registration.

The deliverable is a structured, machine-readable dataset of 18,000+ verified CSOs with full indicator profiles covering organisation type, policy domains, EU activity level, and coalition memberships, updated quarterly over 30 months. The baseline covers all EU27 member states plus Switzerland, UK, Norway, and USA, with automated change detection tracking new entrants, shifts in policy focus, and network evolution.

## 1. Understanding of Objectives

The objective is to provide the European Parliament's Office for Promotion of Parliamentary Democracy with comprehensive intelligence on the civil society ecosystem participating in EU policy processes — enabling evidence-based democracy promotion, informed intergroup coordination, and strategic committee research support.

The core challenge is that civil society participation in EU policy is not captured by any single registry. The EU Transparency Register covers only organisations that choose to register and provide substantive information. Many relevant actors — national NGOs responding to Commission consultations, academic institutes analysing EU directives, faith-based organisations mobilising on EU social policy — remain invisible in official databases despite their active participation in EU democratic processes.

Meridian's approach addresses this visibility gap through systematic evidence collection. We identify CSO participation through hard signals: submissions to EUR-Lex consultations, appearances in European Parliament committee hearings, co-signatory status on joint policy statements, media coverage of EU policy positions. This evidence-based approach captures the full ecosystem, not just self-selecting registered entities.

## 2. Technical Quality

### 2.1 Identification Methodology
Seed universe construction begins with 450,000+ candidate organisations drawn from national association registries (all EU27), academic institution databases, and Meridian's proprietary web index covering 12 million European organisational domains. We apply participation signal detection across five evidence channels: EUR-Lex consultation portal API (identifying all respondents to public consultations since 2019), European Parliament committee hearing records (extracting invited expert affiliations), policy-focused web content (NLP classification on 500,000+ CSO websites), EU-level umbrella organisation membership lists, and structured media monitoring for EU policy coverage.

### 2.2 Multilingual Classification Approach
Civil society organisations produce EU policy content across all 24 official languages. Our NLP pipeline, developed by Marcus Weber, operates on multilingual transformers fine-tuned for policy domain classification (F1: 0.86 across EN/FR/DE/ES, 0.82 for full 24-language set). Classification aligns to European Parliament committee structure: AFET (foreign affairs), ENVI (environment), LIBE (civil liberties), IMCO (internal market), etc. Multi-label assignment captures organisations active across domains.

### 2.3 Coverage Strategy
EU27 coverage via systematic processing of national registries and web presence. Key third countries addressed through targeted collection: Switzerland (bilateral framework participants), UK (former member state legacy engagement), Norway (EEA civil society), USA (transatlantic advocacy organisations). Eastern Partnership and Western Balkans CSOs included where they demonstrate direct EU policy engagement.

### 2.4 Continuous Monitoring
Quarterly update cycles powered by automated change detection on 500,000+ monitored organisational websites. New consultation participation tracked via EUR-Lex API. Coalition formation detected through co-signatory analysis on joint statements. Domain shift monitoring: organisations pivoting focus (e.g., health NGOs engaging on digital policy post-COVID) flagged for review.

## 3. Deliverables

| Deliverable | Description | Month |
| --- | --- | --- |
| D1 — Inception Report | Scope definition aligned to EP committee structure, classification criteria, data dictionary | M2 |
| D2 — Baseline Dataset | 18,000+ verified CSOs with full indicator profiles, machine-readable JSON/CSV | M7 |
| D3 — Network Analysis | Coalition mapping, co-signatory networks, umbrella organisation hierarchies | M9 |
| D4a–h — Quarterly Updates | Incremental updates with structured change logs, new entrant identification | M7,10,13,16,19,22,25,28 |
| D5 — Annual Trend Reports | Longitudinal analysis of ecosystem evolution, emerging coalitions, domain shifts | M12, M24 |
| D6 — Capacity Building | 2 workshops for EP research staff on dataset usage and interpretation | M22 |
| D7 — Final Report | Methodology assessment, sustainability recommendations, handover documentation | M30 |

## 4. Team

| Name | Role | Days allocated |
| --- | --- | --- |
| Dr. Anna Becker | Project Director | 45 |
| Sofia Chen | Policy Lead — EP process expertise, taxonomy | 95 |
| Thomas Vogel | Technical Lead — pipeline and API development | 120 |
| Marcus Weber | Data Scientist — multilingual NLP classifiers | 105 |
| [NEEDS INPUT: additional team member for verification/QA] | Research Analyst | 85 |

## 5. Track Record and References

Meridian has completed comparable organisational mapping contracts for EU institutions with consistent methodology since 2017. ENISA/2023/OP/0008 (Cybersecurity SME Landscape, EUR 480,000) identified 14,200+ entities across EU27 using the same evidence-based approach proposed here. DG CNECT/2023/OP/0021 (Media Market Monitoring, EUR 350,000) demonstrated continuous monitoring with quarterly updates over 18 months, tracking 11,000+ media organisations.

Reference contacts: Dr Klaus Müller, Head of Unit Market Analysis, ENISA (k.mueller@enisa.europa.eu); Isabelle Fontaine, Project Manager Industrial Strategy, DG GROW (isabelle.fontaine@ec.europa.eu). Annual turnover averaged EUR 3.7M over 2022–2024, exceeding the EUR 400,000 minimum requirement.

## 6. Price

| Item | Days | Day rate (EUR) | Total (EUR) |
| --- | --- | --- | --- |
| Dr. Anna Becker — Project Director | 45 | 1,450 | 65,250 |
| Sofia Chen — Policy Lead | 95 | 1,100 | 104,500 |
| Thomas Vogel — Technical Lead | 120 | 1,100 | 132,000 |
| Marcus Weber — Data Scientist | 105 | 1,050 | 110,250 |
| Research Analyst | 85 | 850 | 72,250 |
| Infrastructure (AWS, APIs, data sources) | — | — | 48,000 |
| Travel and subsistence | — | — | 15,000 |
| Contingency (5%) | — | — | 27,362 |
| TOTAL (excl. VAT) | — | — | 574,612 |
