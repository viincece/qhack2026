---
title: "Boilerplate — Quality Assurance"
category: boilerplate
tags: [quality-assurance, boilerplate, compliance]
source_files: [data_quality_procedures.txt, capabilities_overview.pdf]
last_updated: 2026-04-08
---

# Standard Quality Assurance Section

## Reusable QA Commitment (for tender responses)
Meridian Intelligence applies a documented, four-stage quality assurance framework (MIG-QA-001) to all data collection, classification, and delivery activities. This framework ensures that all deliverables meet the highest standards of accuracy, consistency, and reproducibility:

1. **Ingestion and Deduplication**: All candidate entities are processed through a three-stage deduplication protocol (exact registration number match, fuzzy name matching at Jaro-Winkler 0.92 threshold, and domain-level matching), ensuring that each entity appears exactly once in the delivered dataset.

2. **Entity Verification**: Every classified entity passes a manual or semi-automated verification check before inclusion in client deliverables, confirming that at least one piece of hard evidence (product/service description, procurement record, job posting, patent, or industry association membership) supports the classification. Generic keywords are not accepted as evidence in isolation.

3. **Indicator Validation**: All derived indicators (employee size band, revenue band, NACE code, activity start year) are validated against automated consistency rules and cross-checked against registry-reported values where available. Records failing validation are quarantined and reviewed before delivery.

4. **Delivery and Change Tracking**: All datasets are delivered with structured change logs documenting every addition, deletion, and indicator change since the previous delivery. Datasets follow semantic versioning (MAJOR.MINOR.PATCH).

Our target false-positive rate is below 3%, audited on a random 5% sample of each delivered dataset. Results are documented and used to retrain classification models quarterly.

## See also
- Full procedures: [[data_quality]]
- Pipeline details: [[webmap_pipeline]]
- Classification models: [[classification_approach]]
