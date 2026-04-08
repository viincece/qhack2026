---
title: "NLP Classification Approach"
category: methodology
tags: [nlp, machine-learning, classification, transformers, entity-resolution]
source_files: [cv_marcus_weber.md, webmap_methodology.pdf, capabilities_overview.pdf]
last_updated: 2026-04-08
---

# NLP Classification Approach

## Overview
Meridian's NLP classification pipeline is the core engine for determining which organisations are relevant to a given market scope. Designed and maintained by [[marcus_weber]] under [[thomas_vogel]]'s technical oversight.

## Architecture
- **Multi-label text classifiers** for organisational scope determination
- Currently deployed domain classifiers: cybersecurity, data economy, AI/ML, fintech, industrial deep tech
- Fine-tuned sentence-BERT models (replaced spaCy rule-based pipelines in 2022, 60% latency reduction)
- Cross-lingual entity matching module for deduplication across 23 EU language variants (2023)

## Model Performance (Internal Benchmarks)

| Classifier | Task | Precision | Recall | F1 |
|---|---|---|---|---|
| Cybersecurity relevance | Binary, 27-language | 0.89 | 0.84 | 0.87 |
| Data economy involvement | Multi-label, EN+DE | 0.91 | 0.86 | 0.88 |
| AI product/service signal | Binary, EN+DE | 0.88 | 0.82 | 0.85 |
| FinTech / DORA ICT provider | Multi-class, EN | 0.87 | 0.83 | 0.85 |

*Evaluation on stratified 20% hold-out sets, not seen during training.*

## Entity Resolution
- Hybrid blocking + embedding-based deduplication system processing 10M+ records
- Reduced duplicate-organisation rate from ~12% to under 1.5% across EU-wide datasets
- Cross-lingual: operates reliably across 23 EU language variants

## New Domain Classifier Development
- Typical time-to-deployment for a new domain classifier: 3–4 weeks
- Process: scope definition → training data annotation → model training → hold-out evaluation → deployment
- Quarterly retraining cycles for production classifiers

## Technical Stack
- Python, PyTorch, Transformers (Hugging Face), sentence-transformers
- spaCy, scikit-learn, NLTK
- PostgreSQL, Elasticsearch, Apache Airflow, Docker
- AWS (SageMaker, S3, Lambda)
- Evaluation: MLflow, Weights & Biases

## Relevance for Future Tenders
- Demonstrates in-house ML capability — not dependent on third-party classification services
- Quantified model performance provides credible precision/recall commitments
- Fast domain adaptation (3–4 weeks) is a strong selling point for new market scopes
- See also: [[webmap_pipeline]], [[data_quality]], [[marcus_weber]]
