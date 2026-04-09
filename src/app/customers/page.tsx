"use client";

import Link from "next/link";

const customers = [
  {
    type: "Management Consultancies",
    color: "var(--ube-800)",
    tagline: "Win more public-sector engagements with less overhead",
    description:
      "Mid-size consulting firms responding to 5-15 EU institutional tenders per quarter. Tenderizer eliminates the bottleneck of assembling CVs, past project references, and methodology sections from scratch every time.",
    pain: "Senior consultants spend 40+ hours per tender compiling the same information in different formats. Knowledge lives in personal drives and email threads.",
    solution: "A centralised knowledge base that auto-populates tender sections with verified company data — CVs, certifications, and past project outcomes always ready to deploy.",
    example: "A 30-person Berlin advisory firm reduced tender drafting time from 5 days to 4 hours, increasing their bid volume by 3x without hiring additional staff.",
    metrics: ["70% faster drafting", "3x more bids submitted", "Higher win rate through consistency"],
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="var(--ube-800)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="8" y="4" width="24" height="32" rx="3" />
        <line x1="14" y1="12" x2="26" y2="12" />
        <line x1="14" y1="18" x2="26" y2="18" />
        <line x1="14" y1="24" x2="22" y2="24" />
        <path d="M20 30l2 2 4-4" />
      </svg>
    ),
  },
  {
    type: "Research & Policy Institutes",
    color: "var(--slushie-800)",
    tagline: "Turn deep expertise into winning proposals",
    description:
      "Think tanks, university spin-offs, and policy research organisations that compete for EC framework contracts and Horizon Europe grants. Rich in knowledge, short on bid-writing capacity.",
    pain: "Researchers produce world-class analysis but struggle to package it into the rigid format procurement officers expect. Proposals read like academic papers instead of tender responses.",
    solution: "Tenderizer bridges the gap — it understands tender evaluation criteria and restructures your research outputs into compliant, scored-to-win response sections.",
    example: "A European policy institute with 12 researchers used Tenderizer to respond to a JRC data economy tender, scoring highest on methodology by leveraging their existing publications as knowledge base input.",
    metrics: ["Compliant formatting on first draft", "Evaluation criteria alignment", "Reuse of existing publications"],
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="var(--slushie-800)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="20" cy="14" r="8" />
        <path d="M14 22v6a6 6 0 0012 0v-6" />
        <line x1="20" y1="10" x2="20" y2="18" />
        <line x1="16" y1="14" x2="24" y2="14" />
      </svg>
    ),
  },
  {
    type: "IT & Digital Agencies",
    color: "var(--matcha-800)",
    tagline: "Scale your public-sector pipeline without scaling your team",
    description:
      "Digital transformation agencies, data engineering firms, and software houses bidding on government digitalisation contracts. Technical capability is strong, but tender-writing is a distraction from delivery.",
    pain: "Engineers and architects are pulled off billable client work to write tender responses. Technical excellence gets lost in translation when non-technical staff draft the proposal.",
    solution: "Tenderizer lets technical teams feed in architecture docs, case studies, and team profiles — then generates a tender response that speaks the procurement language while preserving technical accuracy.",
    example: "A 50-person digital agency in Munich automated their EU tender pipeline, freeing their CTO from 2 weeks of writing per quarter while improving technical section scores.",
    metrics: ["2 weeks/quarter saved for senior staff", "Technical accuracy preserved", "Consistent bid quality"],
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="var(--matcha-800)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="8" width="32" height="22" rx="3" />
        <line x1="4" y1="34" x2="36" y2="34" />
        <path d="M16 16l-4 4 4 4" />
        <path d="M24 16l4 4-4 4" />
      </svg>
    ),
  },
  {
    type: "Startups & Scale-ups",
    color: "var(--lemon-800)",
    tagline: "Compete with established players from day one",
    description:
      "Early-stage companies entering public procurement for the first time — often through innovation-focused tenders, SME set-asides, or Horizon Europe SME Instrument calls.",
    pain: "No tender history, no templates, no dedicated bid team. Every response is built from zero. Founders spend nights writing proposals instead of building product.",
    solution: "Tenderizer provides the structure and institutional knowledge that startups lack. Upload your pitch deck, product docs, and team bios — get a professionally formatted tender response that reads like it came from a seasoned bid team.",
    example: "A 6-person AI startup in Lisbon won their first ENISA cybersecurity tender using Tenderizer, competing against firms 10x their size with a response drafted in a single afternoon.",
    metrics: ["Zero-to-first-bid in one afternoon", "Professional formatting from day one", "Level playing field vs. incumbents"],
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="var(--lemon-800)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 4l4 12h12l-10 7 4 13-10-8-10 8 4-13-10-7h12z" />
      </svg>
    ),
  },
];

export default function CustomersPage() {
  return (
    <div className="customers-page">
      <style>{`
        .customers-page {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: var(--warm-cream);
          font-family: var(--font-body);
          color: var(--clay-black);
          overflow-y: auto;
          padding: 48px 32px 40px;
        }
        .customers-inner {
          max-width: 900px;
          margin: 0 auto;
        }
        .customers-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: var(--warm-silver);
          text-decoration: none;
          margin-bottom: 24px;
        }
        .customers-back:hover { color: var(--dark-charcoal); }

        .customers-header {
          text-align: center;
          margin-bottom: 48px;
        }
        .customers-title {
          font-size: 40px;
          font-weight: 900;
          letter-spacing: 2px;
          color: var(--dark-charcoal);
          margin: 0 0 8px;
        }
        .customers-subtitle {
          font-size: 17px;
          color: var(--warm-charcoal);
          margin: 0;
          max-width: 560px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.5;
        }

        /* ── Customer Cards ── */
        .customers-grid {
          display: flex;
          flex-direction: column;
          gap: 28px;
          margin-bottom: 48px;
        }

        .customer-card {
          background: var(--clay-white);
          border: 1px solid var(--oat-border);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: var(--clay-shadow);
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s;
        }
        .customer-card:hover {
          transform: translateY(-3px) rotateZ(-0.3deg);
          box-shadow: var(--hard-shadow);
        }

        .customer-card-head {
          padding: 28px 32px 20px;
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .customer-icon {
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
          flex-shrink: 0;
          border: 1px solid var(--oat-border);
        }
        .customer-meta {
          flex: 1;
        }
        .customer-type {
          font-size: 22px;
          font-weight: 800;
          color: var(--dark-charcoal);
          margin: 0 0 4px;
        }
        .customer-tagline {
          font-size: 14px;
          font-weight: 500;
          color: var(--warm-charcoal);
          font-style: italic;
        }

        .customer-card-body {
          padding: 0 32px 28px;
        }
        .customer-desc {
          font-size: 14px;
          color: var(--warm-charcoal);
          line-height: 1.6;
          margin-bottom: 20px;
        }

        .customer-columns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 20px;
        }
        .customer-block {
          padding: 16px 18px;
          border-radius: 14px;
          background: var(--oat-light);
          border: 1px solid var(--oat-border);
        }
        .customer-block-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          color: var(--warm-silver);
          margin-bottom: 6px;
        }
        .customer-block-text {
          font-size: 13px;
          color: var(--warm-charcoal);
          line-height: 1.5;
        }

        .customer-example {
          padding: 16px 18px;
          border-radius: 14px;
          border-left: 3px solid var(--oat-border);
          background: rgba(67, 8, 159, 0.02);
          margin-bottom: 16px;
        }
        .customer-example-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          color: var(--warm-silver);
          margin-bottom: 4px;
        }
        .customer-example-text {
          font-size: 13px;
          color: var(--warm-charcoal);
          line-height: 1.5;
          font-style: italic;
        }

        .customer-metrics {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .customer-metric {
          font-size: 12px;
          font-weight: 600;
          padding: 5px 14px;
          border-radius: 20px;
          color: white;
        }

        .customers-footer {
          text-align: center;
          font-size: 12px;
          color: var(--warm-silver);
          padding-top: 16px;
          border-top: 1px solid var(--oat-border);
        }

        @media (max-width: 640px) {
          .customer-columns {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="customers-inner">
        <Link href="/" className="customers-back">&larr; Back to Dashboard</Link>

        <div className="customers-header">
          <h1 className="customers-title">Customers</h1>
          <p className="customers-subtitle">
            Tenderizer is built for teams that compete in public procurement. Here&rsquo;s who benefits most.
          </p>
        </div>

        <div className="customers-grid">
          {customers.map((c) => (
            <div key={c.type} className="customer-card">
              <div className="customer-card-head">
                <div className="customer-icon" style={{ background: `${c.color}10` }}>
                  {c.icon}
                </div>
                <div className="customer-meta">
                  <h2 className="customer-type">{c.type}</h2>
                  <div className="customer-tagline">{c.tagline}</div>
                </div>
              </div>
              <div className="customer-card-body">
                <p className="customer-desc">{c.description}</p>
                <div className="customer-columns">
                  <div className="customer-block">
                    <div className="customer-block-label">THE PAIN</div>
                    <div className="customer-block-text">{c.pain}</div>
                  </div>
                  <div className="customer-block">
                    <div className="customer-block-label">THE SOLUTION</div>
                    <div className="customer-block-text">{c.solution}</div>
                  </div>
                </div>
                <div className="customer-example" style={{ borderLeftColor: c.color }}>
                  <div className="customer-example-label">USE CASE</div>
                  <div className="customer-example-text">{c.example}</div>
                </div>
                <div className="customer-metrics">
                  {c.metrics.map((m) => (
                    <span key={m} className="customer-metric" style={{ background: c.color }}>
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="customers-footer">
          Meridian Intelligence GmbH &middot; Q-Hack 2026
        </div>
      </div>
    </div>
  );
}
