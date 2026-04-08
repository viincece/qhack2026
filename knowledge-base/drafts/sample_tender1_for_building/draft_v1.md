# Mapping and Continuous Monitoring of the European AI Ecosystem

## Technical Tender

**Contracting authority**
European Commission, DG CNECT — Communications Networks, Content and Technology

## Executive Summary

Meridian Intelligence GmbH proposes a systematic, evidence-based mapping and continuous monitoring of AI-relevant organizations across all 27 EU member states, utilizing our proprietary WebMap v4.1 pipeline to identify entities invisible to standard commercial databases. Our approach combines large-scale web data collection with NLP classification (F1: 0.85 for AI systems) to capture the full ecosystem including SMEs, research spinouts, and niche sector deployers subject to the AI Act. Deliverable: baseline dataset of 25,000+ verified AI-relevant entities with quarterly updates, sector deep-dives, and capacity building package.

Our methodology addresses the core challenge that AI-relevant organizations do not reliably self-identify in standard NACE classifications. Through evidence-based classification using website content, technical documentation, and procurement records, we will deliver comprehensive population coverage aligned with AI Act requirements, enabling effective implementation of conformity assessment and market surveillance across the European AI ecosystem.

**1. Understanding of the Objectives**

The AI Act's regulatory framework requires unprecedented visibility into Europe's AI ecosystem to enable effective implementation. The Commission faces a fundamental population identification problem: AI-relevant entities are not a self-identifying group in standard business registries. Standard approaches systematically undercount specialized SMEs, research spinouts developing narrow AI applications, and cross-border supply chains that fall within the AI Act's scope.

Meridian recognizes that existing commercial databases (Orbis, Crunchbase, industry associations) reliably capture large, established AI companies but miss the long tail of niche players who develop or deploy high-risk AI systems in critical sectors. NACE code classifications predate the AI Act's regulatory categories and cannot distinguish between organizations providing "digital solutions" and those specifically developing AI systems for biometric identification, critical infrastructure, or essential services.

The Commission requires a comprehensive, evidence-based understanding of who develops GPAI models, who integrates AI systems in regulated sectors, and how supply chains connect developers to deployers across member states. Our approach addresses this challenge through systematic evidence collection that identifies entities based on what they actually do rather than how they classify themselves.

**2. Proposed Methodology**

**2.1 Population Coverage Strategy**

Our methodology combines multiple identification pathways to achieve comprehensive coverage beyond commercial databases. We construct seed universes from Tier 1 sources (national business registries, VAT databases) and Tier 2 sources (procurement databases, patent filings, technical certification bodies) before applying web-based evidence collection.

Geographic coverage spans all EU-27 member states with country-specific crawling strategies addressing language variants and local business structures. We systematically target sectors defined in AI Act Annex III through NACE code pre-filtering combined with keyword-based expansion to capture entities in healthcare, employment, education, law enforcement, migration, and justice sectors.

**2.2 Evidence-Based Classification Framework**

| Evidence Type | Weight | AI Act Relevance | Example |
|---|---|---|
| Explicit AI product description | High | Direct scope | "Biometric identification system for access control" |
| GPAI model offering | High | Article 51-55 | "Foundation model API for natural language processing" |
| High-risk sector deployment | High | Annex III | "AI-powered recruitment screening tool" |
| Technical certifications | Medium | Conformity assessment | "CE marking for AI medical device" |
| Procurement records | Medium | Public sector deployment | "Supply of AI surveillance systems to municipal authority" |
| Job postings (AI roles) | Low | Capability signal | "Machine learning engineer for healthcare applications" |

Our classification system maps directly to AI Act definitions, distinguishing between AI system providers, deployers, GPAI model providers, and conformity assessment bodies. Multi-label classification enables entities to hold multiple roles within the AI value chain.

**2.3 Quality Assurance and False-Positive Rejection**

Every entity undergoes verification requiring at least one piece of hard evidence supporting AI Act relevance. Generic terms ("digital transformation," "innovation services") are insufficient without concrete AI system descriptions. Our target false-positive rate is <3%, audited on 5% random samples.

Automated validation rules ensure consistency: GPAI providers must demonstrate model development capabilities, high-risk AI deployers must operate in regulated sectors, and supply chain linkages require verifiable commercial relationships.

**3. Work Plan**

| Milestone | Deliverable | Description | Month |
|---|---|---|---|
| M1 | D1 - Inception Report | Methodology documentation and Commission approval | 2 |
| M2 | Entity identification complete | Full EU-27 crawling and classification | 4 |
| M3 | D2 - Baseline Dataset | 25,000+ verified AI entities with full profiles | 6 |
| M4 | D4.1 - Monitoring Report Q1 | First quarterly update with change tracking | 9 |
| M5 | D3.1 - Sector Deep-Dive 1 | Healthcare AI analysis | 9 |
| M6 | D5.1 - Annual Trend Report | Year 1 longitudinal analysis | 12 |
| M7 | D4.2 - Monitoring Report Q2 | Second quarterly update | 14 |
| M8 | D3.2 - Sector Deep-Dive 2 | Employment AI analysis | 14 |
| M9 | D4.3 - Monitoring Report Q3 | Third quarterly update | 18 |
| M10 | D3.3 - Sector Deep-Dive 3 | Biometrics analysis | 18 |
| M11 | D6 - Capacity Building Package | Training materials and workshops | 20 |
| M12 | D4.4 - Monitoring Report Q4 | Final quarterly update | 22 |
| M13 | D3.4 - Sector Deep-Dive 4 | Law enforcement AI analysis | 22 |
| M14 | D7 - Final Report | Comprehensive findings and recommendations | 24 |

Resource allocation: 65% effort in months 1-6 (baseline establishment), 35% in months 7-24 (continuous monitoring and analysis).

**4. Team Composition**

| Name | Role | Relevant Experience | Days Allocated |
|---|---|---|---|
| Dr. Anna Becker | Project Director | Managing Director, MIG. PhD Economics, 14 years EU institutional experience. Led ENISA cybersecurity ecosystem mapping (14,200+ entities) and DG GROW deep tech analysis. College of Europe background. | 45 days |
| Thomas Vogel | Technical Lead | Senior Data Engineer, WebMap pipeline architect. MSc Data Science TU Berlin. Processed 30M+ web pages across 25+ projects. Led data infrastructure for JRC Data Economy Monitoring Phase III (EUR 620k). | 110 days |
| Sofia Chen | Policy & Regulatory Lead | Research Lead Policy, 10 years EU digital policy. MA Sciences Po Paris. European Parliament GDPR trilogue support, BRUEGEL researcher. Led policy framework for EBA DORA analysis and JRC data economy indicators. | 95 days |
| Marcus Weber | NLP/Classification Lead | Data Scientist NLP/ML, MSc Computational Linguistics LMU Munich. Built domain classifiers achieving F1 0.85-0.88 (AI signal: 0.85, cybersecurity: 0.87). Fraunhofer IAIS background. | 125 days |

Total team allocation: 375 days across 24 months. Team coverage includes project management (Becker), technical infrastructure (Vogel), regulatory scoping (Chen), and machine learning (Weber). All team members have direct experience with EU institutional clients and large-scale organizational mapping.

**5. References**

**Reference 1: ENISA/2023/OP/0008 - Cybersecurity SME Landscape**
- Contracting Authority: ENISA (European Union Agency for Cybersecurity)
- Contract Value: EUR 480,000
- Period: 18 months (2023-2024)
- Deliverables: Mapped 14,200+ cybersecurity entities across EU-27, supply chain analysis across 8 CRA categories, quarterly monitoring updates
- Relevance: Demonstrates large-scale EU-wide organizational mapping, quarterly update delivery, and regulatory framework alignment (CRA)
- Contact: Dr. Klaus Müller, Head of Unit Market Analysis, k.mueller@enisa.europa.eu

**Reference 2: JRC/2024/OP/0019 - Data Economy Monitoring Tool Phase III**
- Contracting Authority: European Commission, Joint Research Centre
- Contract Value: EUR 620,000
- Period: 24 months (ongoing)
- Deliverables: Enhanced NLP pipeline, API delivery mechanism, Data Act/DGA aligned indicators, quarterly datasets
- Relevance: Demonstrates continuous monitoring capability, regulatory alignment methodology, and API-based data delivery
- Contact: Dr. Marie Leclerc, Senior Researcher Digital Economy, marie.leclerc@ec.europa.eu

**Reference 3: EBA/2024/OP/0003 - FinTech/DORA Market Analysis**
- Contracting Authority: European Banking Authority
- Contract Value: EUR 290,000
- Period: 12 months (completed)
- Deliverables: 6,400+ ICT provider entities, DORA-aligned typology, concentration analysis, policy brief
- Relevance: Demonstrates regulatory scoping capability (translating DORA requirements to operational criteria) and policy-oriented deliverables
- Contact: Robert Janssen, Policy Advisor Digital Finance, r.janssen@eba.europa.eu

**6. Quality Assurance**

Meridian applies documented quality procedures (MIG-QA-001 v3.2) across all deliverables. Our four-stage quality lifecycle ensures accuracy and reproducibility:

**Stage 1 - Ingestion and Deduplication**: Three-stage deduplication protocol (registration number matching, fuzzy name matching at Jaro-Winkler 0.92, domain-level matching) ensures each entity appears exactly once across EU-27.

**Stage 2 - Entity Verification**: Every AI-relevant entity undergoes manual verification requiring at least one piece of hard evidence (product description, procurement record, technical certification, patent filing). Generic AI keywords without concrete system descriptions are rejected.

**Stage 3 - Indicator Validation**: Automated consistency rules validate employee counts, revenue bands, NACE codes, and AI Act category assignments. Cross-validation against registry data where available.

**Stage 4 - Delivery Quality**: All datasets include structured change logs, semantic versioning, and data dictionaries. Monthly internal quality reviews track false-positive rates, coverage metrics, and classification accuracy.

**Commission Feedback Integration**: Dedicated feedback loops with 3-day response commitment for urgent issues, 10-day commitment for methodology adjustments. All feedback formally logged and addressed in subsequent deliverables.

**Target Metrics**: <3% false-positive rate (audited on 5% samples), 95% successful web domain validation, complete change tracking across quarterly updates.

**7. Pricing**

| Cost Category | Total (EUR) |
|---|---|
| **Staff Costs** | |
| Dr. Anna Becker (Project Director, 45 days) | 31,500 |
| Thomas Vogel (Technical Lead, 110 days) | 66,000 |
| Sofia Chen (Policy Lead, 95 days) | 57,000 |
| Marcus Weber (NLP Lead, 125 days) | 62,500 |
| **Subtotal Staff** | **217,000** |
| **Infrastructure and Technology** | |
| Web crawling infrastructure | 45,000 |
| Data storage and processing | 35,000 |
| NLP model training and deployment | 28,000 |
| **Subtotal Infrastructure** | **108,000** |
| **Travel and Workshops** | |
| Brussels workshops (capacity building) | 8,500 |
| Stakeholder consultation travel | 6,500 |
| **Subtotal Travel** | **15,000** |
| **Other Direct Costs** | |
| Data sources and licensing | 22,000 |
| Quality assurance and validation | 18,000 |
| **Subtotal Other** | **40,000** |
| **Management and Administration (8%)** | 30,400 |
| **TOTAL (excl. VAT)** | **410,400** |