"use client";

import Link from "next/link";

const pipeline = [
  { icon: "📄", label: "Upload", sub: "PDF parsing via pdf-parse", color: "var(--blueberry-800)" },
  { icon: "🔍", label: "Analyze", sub: "Extract sections & requirements", color: "var(--ube-800)" },
  { icon: "📚", label: "Retrieve", sub: "Wiki pages per section", color: "var(--slushie-800)" },
  { icon: "✍️", label: "Generate", sub: "Single-pass with style references", color: "var(--matcha-800)" },
  { icon: "🔧", label: "Post-Process", sub: "Deterministic table repair & cleanup", color: "var(--lemon-800)" },
  { icon: "👁️", label: "View & Edit", sub: "Preview / Edit toggle + Tendi Bot", color: "var(--dark-charcoal)" },
];

const pillars = [
  {
    title: "Knowledge Base",
    color: "var(--matcha-600)",
    bg: "var(--matcha-800)",
    items: [
      { key: "Wiki", val: "Structured MD with YAML frontmatter" },
      { key: "Categories", val: "Company, Team, Projects, Boilerplate" },
      { key: "Ingestion", val: "Upload docs \u2192 Claude \u2192 auto-structured pages" },
      { key: "References", val: "3 past tenders, similarity-ranked" },
    ],
  },
  {
    title: "AI Engine",
    color: "var(--ube-300)",
    bg: "var(--ube-800)",
    items: [
      { key: "Model", val: "Claude Opus 4 (Anthropic)" },
      { key: "Analysis", val: "Section extraction & requirement mapping" },
      { key: "Generation", val: "Single-pass with all references" },
      { key: "Post-process", val: "Deterministic table repair & cleanup" },
    ],
  },
  {
    title: "Interactive Layer",
    color: "var(--lemon-400)",
    bg: "var(--lemon-800)",
    items: [
      { key: "Tendi Bot", val: "Chat sidebar with SSE streaming" },
      { key: "@-Mentions", val: "Reference KB files in chat" },
      { key: "Versioning", val: "Filesystem drafts (v1, v2, v3\u2026)" },
      { key: "Export", val: ".md  \u00b7  .docx  \u00b7  clipboard" },
    ],
  },
];

export default function ArchitecturePage() {
  return (
    <div className="arch-page">
      <style>{`
        .arch-page {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: var(--warm-cream);
          font-family: var(--font-body);
          color: var(--clay-black);
          overflow-y: auto;
          padding: 48px 32px 40px;
        }
        .arch-inner {
          max-width: 980px;
          margin: 0 auto;
        }
        .arch-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: var(--warm-silver);
          text-decoration: none;
          margin-bottom: 24px;
        }
        .arch-back:hover { color: var(--dark-charcoal); }
        .arch-header {
          text-align: center;
          margin-bottom: 48px;
        }
        .arch-title {
          font-size: 40px;
          font-weight: 900;
          letter-spacing: 4px;
          color: var(--dark-charcoal);
          margin: 0 0 4px;
        }
        .arch-subtitle {
          font-size: 16px;
          color: var(--warm-charcoal);
          margin: 0 0 10px;
        }
        .arch-tech-badges {
          display: flex;
          justify-content: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .arch-badge {
          font-size: 11px;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: 20px;
          background: var(--oat-light);
          color: var(--warm-charcoal);
          border: 1px solid var(--oat-border);
        }

        /* ── Section Labels ── */
        .arch-section-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 3px;
          color: var(--warm-silver);
          margin-bottom: 16px;
        }

        /* ── Pipeline ── */
        .arch-pipeline {
          display: flex;
          align-items: stretch;
          gap: 0;
          margin-bottom: 48px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .arch-step-wrap {
          display: flex;
          align-items: center;
        }
        .arch-step {
          width: 140px;
          background: var(--clay-white);
          border: 1px solid var(--oat-border);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: var(--clay-shadow);
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s;
        }
        .arch-step:hover {
          transform: translateY(-4px) rotateZ(-1deg);
          box-shadow: var(--hard-shadow);
        }
        .arch-step-accent {
          height: 4px;
          width: 100%;
        }
        .arch-step-body {
          padding: 16px 10px 18px;
          text-align: center;
        }
        .arch-step-icon {
          font-size: 28px;
          margin-bottom: 8px;
        }
        .arch-step-label {
          font-size: 14px;
          font-weight: 700;
          color: var(--dark-charcoal);
          margin-bottom: 4px;
        }
        .arch-step-sub {
          font-size: 11px;
          color: var(--warm-silver);
          line-height: 1.4;
        }
        .arch-arrow {
          font-size: 18px;
          color: var(--oat-border);
          margin: 0 8px;
          flex-shrink: 0;
          font-weight: 700;
        }

        /* ── Pillars ── */
        .arch-pillars {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }
        .arch-pillar {
          border-radius: 20px;
          overflow: hidden;
          box-shadow: var(--clay-shadow);
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s;
        }
        .arch-pillar:hover {
          transform: translateY(-4px) rotateZ(-0.5deg);
          box-shadow: var(--hard-shadow);
        }
        .arch-pillar-head {
          padding: 18px 22px;
          color: white;
        }
        .arch-pillar-head h3 {
          margin: 0;
          font-size: 17px;
          font-weight: 700;
        }
        .arch-pillar-body {
          background: var(--clay-white);
          padding: 18px 22px 22px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .arch-pillar-item-key {
          font-size: 12px;
          font-weight: 700;
          color: var(--dark-charcoal);
        }
        .arch-pillar-item-val {
          font-size: 12px;
          color: var(--warm-charcoal);
        }

        /* ── Footer ── */
        .arch-footer {
          text-align: center;
          font-size: 12px;
          color: var(--warm-silver);
          padding-top: 16px;
          border-top: 1px solid var(--oat-border);
        }
      `}</style>

      <div className="arch-inner">
        <Link href="/" className="arch-back">&larr; Back to Dashboard</Link>

        <div className="arch-header">
          <h1 className="arch-title">TENDERIZER</h1>
          <p className="arch-subtitle">System Architecture</p>
          <div className="arch-tech-badges">
            {["Next.js 16", "React 19", "Claude Opus 4", "TypeScript", "SSE Streaming"].map(t => (
              <span key={t} className="arch-badge">{t}</span>
            ))}
          </div>
        </div>

        {/* Pipeline */}
        <div className="arch-section-label">GENERATION PIPELINE</div>
        <div className="arch-pipeline">
          {pipeline.map((step, i) => (
            <div key={step.label} className="arch-step-wrap">
              <div className="arch-step">
                <div className="arch-step-accent" style={{ background: step.color }} />
                <div className="arch-step-body">
                  <div className="arch-step-icon">{step.icon}</div>
                  <div className="arch-step-label">{step.label}</div>
                  <div className="arch-step-sub">{step.sub}</div>
                </div>
              </div>
              {i < pipeline.length - 1 && <span className="arch-arrow">&rarr;</span>}
            </div>
          ))}
        </div>

        {/* Pillars */}
        <div className="arch-section-label">SUPPORTING SYSTEMS</div>
        <div className="arch-pillars">
          {pillars.map((p) => (
            <div key={p.title} className="arch-pillar">
              <div className="arch-pillar-head" style={{ background: p.bg }}>
                <h3>{p.title}</h3>
              </div>
              <div className="arch-pillar-body">
                {p.items.map((item) => (
                  <div key={item.key}>
                    <div className="arch-pillar-item-key">{item.key}</div>
                    <div className="arch-pillar-item-val">{item.val}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="arch-footer">
          Meridian Intelligence GmbH &middot; Q-Hack 2026
        </div>
      </div>
    </div>
  );
}
