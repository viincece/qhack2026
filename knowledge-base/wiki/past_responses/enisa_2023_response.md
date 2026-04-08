---
title: "Past Response — ENISA 2023 Cybersecurity SME"
category: past_response
tags: [enisa, cybersecurity, sme, market-mapping, cra, tender-response, 2023]
source_files: [tender_response_ENISA_2023_cybersecurity_sme.pdf]
related_project: enisa_2023_cybersecurity
last_updated: 2026-04-08
---

# Past Response: ENISA/2023/OP/0008 — Cybersecurity SME Landscape in the EU

## Client
ENISA — EU Agency for Cybersecurity, Athens

## Executive Summary (as submitted)
Meridian proposes systematic, evidence-based mapping of the EU cybersecurity SME landscape across all 27 member states, combining large-scale web data analysis with structured verification. Identifies organisations invisible to commercial databases — niche product specialists, managed security service providers, technology integrators below standard registry visibility thresholds. Deliverable: structured, machine-readable dataset of 14,000+ verified SMEs with full indicator profiles, updated quarterly, covering supply chain linkages across 8 CRA-relevant product categories. Methodology aligned with ECSMAF.

## Problem Framing (reusable pattern)
- Core challenge is a **population problem**: standard commercial databases reliably cover large vendors but systematically miss the long tail of SMEs
- Niche players, integrators, and emerging providers are invisible to Gartner, IDC, etc.
- ENISA needs a comprehensive, evidence-based picture — not just "known players"
- Meridian's web-based approach identifies entities that self-report cybersecurity capabilities on their own websites, even if no commercial database lists them

## Methodology Proposed
- [[webmap_pipeline]] with cybersecurity-specific configuration
- 8 CRA-relevant product categories as classification dimensions
- Sector-by-sector scope definition mapped to NACE codes and CRA product taxonomy (led by [[sofia_chen]])
- Cybersecurity relevance classifier: binary, 27-language, F1 0.87
- Supply chain relationship extraction

## Team Proposed
- [[anna_becker]] — Project Director, quality assurance
- [[thomas_vogel]] — Technical lead, pipeline delivery
- [[sofia_chen]] — Scope definition, CRA taxonomy mapping
- [[marcus_weber]] — Classifier development and maintenance

## Key Deliverables Promised
- Entity dataset: 14,200+ verified cybersecurity-relevant SMEs across EU27
- Supply chain relationship map for 8 CRA product categories
- 4 quarterly monitoring updates
- Final report with policy recommendations

## Relevance for Future Tenders
- **Flagship project** — largest entity count, broadest geographic scope
- **Quarterly monitoring model** — demonstrates continuous delivery capability
- **ECSMAF alignment** — shows ability to align with agency-specific frameworks
- **Long-tail population problem** framing is reusable across many EU tenders
- Strong reference contact: Dr. Klaus Müller, Head of Unit Market Analysis, ENISA
