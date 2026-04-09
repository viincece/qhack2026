"use client";

import Link from "next/link";

const features = [
  {
    status: "In Development",
    statusColor: "var(--ube-800)",
    title: "Bulk Document Upload",
    description:
      "Upload entire folders of company documents at once — CVs, project sheets, certifications, and boilerplate. Tenderizer processes them in parallel and auto-structures every file into the knowledge base.",
    details: [
      "Drag-and-drop folder upload",
      "Parallel processing with progress tracking",
      "Automatic categorisation (team, projects, boilerplate)",
      "Duplicate & conflict detection",
    ],
    quarter: "Q3 2026",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="var(--ube-800)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="6" width="16" height="20" rx="2" />
        <rect x="12" y="4" width="16" height="20" rx="2" fill="var(--warm-cream)" />
        <path d="M16 14v6M13 17h6" />
      </svg>
    ),
  },
  {
    status: "Planned",
    statusColor: "var(--slushie-800)",
    title: "Tender Crawling & Discovery",
    description:
      "Automatically crawl public procurement portals (TED, SAM.gov, national platforms) to find tenders that match Meridian's profile. Get notified before deadlines — never miss a fitting opportunity.",
    details: [
      "Monitors TED, SAM.gov, and national portals",
      "AI-powered fit scoring against company profile",
      "Email & Slack notifications for high-fit tenders",
      "Deadline tracking with calendar integration",
    ],
    quarter: "Q4 2026",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="var(--slushie-800)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="14" cy="14" r="8" />
        <line x1="20" y1="20" x2="28" y2="28" />
        <path d="M11 14h6M14 11v6" />
      </svg>
    ),
  },
  {
    status: "Planned",
    statusColor: "var(--matcha-800)",
    title: "CRM Integration",
    description:
      "Connect Tenderizer to your CRM (HubSpot, Salesforce, Pipedrive) to sync tender opportunities, track bid status, and auto-log drafted responses against client records.",
    details: [
      "Two-way sync with HubSpot, Salesforce & Pipedrive",
      "Auto-create deals from uploaded tenders",
      "Bid status tracking (draft → submitted → won/lost)",
      "Revenue pipeline reporting",
    ],
    quarter: "Q1 2027",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="var(--matcha-800)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="16" cy="10" r="4" />
        <path d="M8 26c0-4.4 3.6-8 8-8s8 3.6 8 8" />
        <path d="M24 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    status: "Exploring",
    statusColor: "var(--lemon-800)",
    title: "Knowledge Base as Company Wiki",
    description:
      "Expand the knowledge base beyond tender support into a general-purpose company information hub. Teams can search, browse, and contribute to a living wiki that powers every department.",
    details: [
      "Full-text search across all company knowledge",
      "Role-based access & editing permissions",
      "Department-level views (HR, Sales, Delivery)",
      "Slack bot for instant knowledge retrieval",
    ],
    quarter: "Q1 2027",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="var(--lemon-800)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="26" height="24" rx="3" />
        <path d="M3 12h26M12 12v16" />
        <circle cx="7.5" cy="8" r="1" fill="var(--lemon-800)" />
        <circle cx="11" cy="8" r="1" fill="var(--lemon-800)" />
      </svg>
    ),
  },
];

export default function RoadmapPage() {
  return (
    <div className="roadmap-page">
      <style>{`
        .roadmap-page {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: var(--warm-cream);
          font-family: var(--font-body);
          color: var(--clay-black);
          overflow-y: auto;
          padding: 48px 32px 40px;
        }
        .roadmap-inner {
          max-width: 820px;
          margin: 0 auto;
        }
        .roadmap-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: var(--warm-silver);
          text-decoration: none;
          margin-bottom: 24px;
        }
        .roadmap-back:hover { color: var(--dark-charcoal); }

        .roadmap-header {
          text-align: center;
          margin-bottom: 48px;
        }
        .roadmap-title {
          font-size: 40px;
          font-weight: 900;
          letter-spacing: 2px;
          color: var(--dark-charcoal);
          margin: 0 0 8px;
        }
        .roadmap-subtitle {
          font-size: 17px;
          color: var(--warm-charcoal);
          margin: 0;
          max-width: 520px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.5;
        }

        /* ── Timeline ── */
        .roadmap-timeline {
          position: relative;
          padding-left: 36px;
        }
        .roadmap-timeline::before {
          content: '';
          position: absolute;
          left: 15px;
          top: 8px;
          bottom: 8px;
          width: 2px;
          background: var(--oat-border);
          border-radius: 1px;
        }

        .roadmap-item {
          position: relative;
          margin-bottom: 32px;
        }
        .roadmap-dot {
          position: absolute;
          left: -36px;
          top: 24px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2.5px solid var(--oat-border);
          background: var(--warm-cream);
          z-index: 1;
        }
        .roadmap-dot.active {
          border-color: var(--ube-800);
          background: var(--ube-800);
          box-shadow: 0 0 0 4px rgba(67, 8, 159, 0.12);
        }

        .roadmap-card {
          background: var(--clay-white);
          border: 1px solid var(--oat-border);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: var(--clay-shadow);
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s;
        }
        .roadmap-card:hover {
          transform: translateY(-3px) rotateZ(-0.3deg);
          box-shadow: var(--hard-shadow);
        }

        .roadmap-card-inner {
          padding: 28px 28px 24px;
        }
        .roadmap-card-top {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 14px;
        }
        .roadmap-icon {
          flex-shrink: 0;
          width: 52px;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--oat-light);
          border-radius: 14px;
          border: 1px solid var(--oat-border);
        }
        .roadmap-card-meta {
          flex: 1;
        }
        .roadmap-card-title {
          font-size: 19px;
          font-weight: 800;
          color: var(--dark-charcoal);
          margin: 0 0 6px;
        }
        .roadmap-badges {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .roadmap-status {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.5px;
          padding: 3px 10px;
          border-radius: 20px;
          color: white;
        }
        .roadmap-quarter {
          font-size: 11px;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 20px;
          background: var(--oat-light);
          color: var(--warm-charcoal);
          border: 1px solid var(--oat-border);
        }

        .roadmap-desc {
          font-size: 14px;
          color: var(--warm-charcoal);
          line-height: 1.6;
          margin-bottom: 16px;
        }

        .roadmap-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
        .roadmap-detail {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 13px;
          color: var(--warm-charcoal);
        }
        .roadmap-detail-check {
          color: var(--matcha-600);
          font-weight: 700;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .roadmap-footer {
          text-align: center;
          font-size: 12px;
          color: var(--warm-silver);
          padding-top: 16px;
          border-top: 1px solid var(--oat-border);
          margin-top: 16px;
        }

        @media (max-width: 640px) {
          .roadmap-details {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="roadmap-inner">
        <Link href="/" className="roadmap-back">&larr; Back to Dashboard</Link>

        <div className="roadmap-header">
          <h1 className="roadmap-title">Roadmap</h1>
          <p className="roadmap-subtitle">
            What&rsquo;s next for Tenderizer. We ship based on user feedback &mdash; vote on what matters most to you.
          </p>
        </div>

        <div className="roadmap-timeline">
          {features.map((f, i) => (
            <div key={f.title} className="roadmap-item">
              <div className={`roadmap-dot ${i === 0 ? "active" : ""}`} />
              <div className="roadmap-card">
                <div className="roadmap-card-inner">
                  <div className="roadmap-card-top">
                    <div className="roadmap-icon">{f.icon}</div>
                    <div className="roadmap-card-meta">
                      <h2 className="roadmap-card-title">{f.title}</h2>
                      <div className="roadmap-badges">
                        <span className="roadmap-status" style={{ background: f.statusColor }}>
                          {f.status}
                        </span>
                        <span className="roadmap-quarter">{f.quarter}</span>
                      </div>
                    </div>
                  </div>
                  <p className="roadmap-desc">{f.description}</p>
                  <div className="roadmap-details">
                    {f.details.map((d) => (
                      <div key={d} className="roadmap-detail">
                        <span className="roadmap-detail-check">&#10003;</span>
                        <span>{d}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="roadmap-footer">
          Meridian Intelligence GmbH &middot; Q-Hack 2026
        </div>
      </div>
    </div>
  );
}
