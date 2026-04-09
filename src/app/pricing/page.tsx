"use client";

import Link from "next/link";

const tiers = [
  {
    name: "Starter",
    price: "249",
    period: "/ month",
    description: "For small consultancies responding to 2\u20134 tenders per month.",
    color: "var(--matcha-800)",
    colorLight: "var(--matcha-300)",
    features: [
      "5 tender drafts / month",
      "Knowledge base (up to 50 pages)",
      "PDF & DOCX export",
      "1 team seat",
      "Tendi Bot chat assistant",
      "Email support",
    ],
    cta: "Start Free Trial",
    highlighted: false,
  },
  {
    name: "Professional",
    price: "699",
    period: "/ month",
    description: "For growing firms that need consistent, high-volume tender output.",
    color: "var(--ube-900)",
    colorLight: "var(--ube-300)",
    features: [
      "25 tender drafts / month",
      "Unlimited knowledge base pages",
      "PDF & DOCX export",
      "5 team seats",
      "Tendi Bot with @-mentions",
      "Past tender style matching",
      "Draft versioning & history",
      "Priority support",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large organisations with compliance, SSO, and volume needs.",
    color: "var(--dark-charcoal)",
    colorLight: "var(--oat-light)",
    features: [
      "Unlimited tender drafts",
      "Unlimited knowledge base",
      "All export formats",
      "Unlimited team seats",
      "Custom AI model tuning",
      "SSO & role-based access",
      "API access & integrations",
      "Dedicated account manager",
      "On-premise deployment option",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div className="pricing-page">
      <style>{`
        .pricing-page {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: var(--warm-cream);
          font-family: var(--font-body);
          color: var(--clay-black);
          overflow-y: auto;
          padding: 48px 32px 40px;
        }
        .pricing-inner {
          max-width: 1060px;
          margin: 0 auto;
        }
        .pricing-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: var(--warm-silver);
          text-decoration: none;
          margin-bottom: 24px;
        }
        .pricing-back:hover { color: var(--dark-charcoal); }

        .pricing-header {
          text-align: center;
          margin-bottom: 48px;
        }
        .pricing-title {
          font-size: 40px;
          font-weight: 900;
          letter-spacing: 2px;
          color: var(--dark-charcoal);
          margin: 0 0 8px;
        }
        .pricing-subtitle {
          font-size: 17px;
          color: var(--warm-charcoal);
          margin: 0;
          max-width: 520px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.5;
        }

        /* ── Tier Grid ── */
        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
          gap: 24px;
          margin-bottom: 48px;
          align-items: start;
        }

        .pricing-card {
          background: var(--clay-white);
          border: 1px solid var(--oat-border);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: var(--clay-shadow);
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s;
          display: flex;
          flex-direction: column;
        }
        .pricing-card:hover {
          transform: translateY(-4px) rotateZ(-0.5deg);
          box-shadow: var(--hard-shadow);
        }
        .pricing-card.highlighted {
          border: 2px solid var(--ube-800);
          position: relative;
        }
        .pricing-popular {
          position: absolute;
          top: -1px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--ube-800);
          color: white;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.5px;
          padding: 5px 18px;
          border-radius: 0 0 12px 12px;
        }

        .pricing-card-head {
          padding: 32px 28px 20px;
          color: white;
          text-align: center;
        }
        .pricing-card-head h2 {
          margin: 0 0 6px;
          font-size: 22px;
          font-weight: 800;
          letter-spacing: 1px;
        }
        .pricing-card-desc {
          font-size: 13px;
          opacity: 0.85;
          line-height: 1.4;
        }

        .pricing-card-price {
          text-align: center;
          padding: 24px 28px 8px;
        }
        .pricing-amount {
          font-size: 48px;
          font-weight: 900;
          color: var(--dark-charcoal);
          line-height: 1;
        }
        .pricing-currency {
          font-size: 22px;
          font-weight: 700;
          vertical-align: top;
          color: var(--warm-charcoal);
        }
        .pricing-period {
          font-size: 15px;
          color: var(--warm-silver);
          margin-left: 2px;
        }

        .pricing-features {
          padding: 16px 28px 24px;
          flex: 1;
        }
        .pricing-feature {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 7px 0;
          font-size: 14px;
          color: var(--warm-charcoal);
          border-bottom: 1px solid var(--oat-light);
        }
        .pricing-feature:last-child {
          border-bottom: none;
        }
        .pricing-check {
          color: var(--matcha-600);
          font-weight: 700;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .pricing-card-cta {
          padding: 0 28px 28px;
        }
        .pricing-btn {
          display: block;
          width: 100%;
          padding: 14px;
          border: none;
          border-radius: 14px;
          font-family: var(--font-body);
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          text-align: center;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .pricing-btn:hover {
          transform: rotateZ(-2deg) translateY(-2px);
          box-shadow: var(--hard-shadow);
        }
        .pricing-btn-primary {
          background: var(--dark-charcoal);
          color: white;
        }
        .pricing-btn-outline {
          background: transparent;
          color: var(--dark-charcoal);
          border: 2px solid var(--oat-border);
        }
        .pricing-btn-outline:hover {
          background: var(--oat-light);
        }

        /* ── FAQ ── */
        .pricing-faq {
          max-width: 640px;
          margin: 0 auto 40px;
        }
        .pricing-faq h3 {
          text-align: center;
          font-size: 24px;
          font-weight: 800;
          margin: 0 0 24px;
          color: var(--dark-charcoal);
        }
        .pricing-faq-item {
          background: var(--clay-white);
          border: 1px solid var(--oat-border);
          border-radius: 16px;
          padding: 18px 22px;
          margin-bottom: 12px;
          box-shadow: var(--clay-shadow);
        }
        .pricing-faq-q {
          font-size: 14px;
          font-weight: 700;
          color: var(--dark-charcoal);
          margin-bottom: 6px;
        }
        .pricing-faq-a {
          font-size: 13px;
          color: var(--warm-charcoal);
          line-height: 1.5;
        }

        .pricing-footer {
          text-align: center;
          font-size: 12px;
          color: var(--warm-silver);
          padding-top: 16px;
          border-top: 1px solid var(--oat-border);
        }
      `}</style>

      <div className="pricing-inner">
        <Link href="/" className="pricing-back">&larr; Back to Dashboard</Link>

        <div className="pricing-header">
          <h1 className="pricing-title">Pricing</h1>
          <p className="pricing-subtitle">
            Draft winning tenders in minutes, not weeks. Choose the plan that fits your bid volume.
          </p>
        </div>

        <div className="pricing-grid">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`pricing-card ${tier.highlighted ? "highlighted" : ""}`}
            >
              {tier.highlighted && <div className="pricing-popular">MOST POPULAR</div>}
              <div className="pricing-card-head" style={{ background: tier.color }}>
                <h2>{tier.name}</h2>
                <div className="pricing-card-desc">{tier.description}</div>
              </div>
              <div className="pricing-card-price">
                {tier.price === "Custom" ? (
                  <span className="pricing-amount">Custom</span>
                ) : (
                  <>
                    <span className="pricing-currency">&euro;</span>
                    <span className="pricing-amount">{tier.price}</span>
                    <span className="pricing-period">{tier.period}</span>
                  </>
                )}
              </div>
              <div className="pricing-features">
                {tier.features.map((f) => (
                  <div key={f} className="pricing-feature">
                    <span className="pricing-check">&#10003;</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <div className="pricing-card-cta">
                <button
                  className={`pricing-btn ${tier.highlighted ? "pricing-btn-primary" : "pricing-btn-outline"}`}
                >
                  {tier.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="pricing-faq">
          <h3>Questions</h3>
          <div className="pricing-faq-item">
            <div className="pricing-faq-q">What counts as a tender draft?</div>
            <div className="pricing-faq-a">
              Each time you upload a tender PDF and generate a draft response, that counts as one draft.
              Editing an existing draft via Tendi Bot does not count as additional drafts.
            </div>
          </div>
          <div className="pricing-faq-item">
            <div className="pricing-faq-q">Can I try before I buy?</div>
            <div className="pricing-faq-a">
              Yes. All plans include a 14-day free trial with full access. No credit card required.
            </div>
          </div>
          <div className="pricing-faq-item">
            <div className="pricing-faq-q">How does the knowledge base work?</div>
            <div className="pricing-faq-a">
              Upload your company documents (CVs, past projects, certifications) and Tenderizer
              auto-structures them into a searchable wiki. The AI uses this to ground every claim in real data.
            </div>
          </div>
          <div className="pricing-faq-item">
            <div className="pricing-faq-q">What is past tender style matching?</div>
            <div className="pricing-faq-a">
              Upload your previous winning tender responses and Tenderizer will match the structure,
              tone, and formatting of new drafts to your established style.
            </div>
          </div>
        </div>

        <div className="pricing-footer">
          Meridian Intelligence GmbH &middot; Q-Hack 2026
        </div>
      </div>
    </div>
  );
}
