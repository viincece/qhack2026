import Link from "next/link";
import { listDrafts } from "@/lib/storage";
import { listPagesByCategory } from "@/lib/wiki";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const drafts = await listDrafts();
  const wikiPages = await listPagesByCategory();
  const totalPages = Object.values(wikiPages).flat().length;

  return (
    <div style={{ maxWidth: 960 }}>
      {/* Welcome */}
      <div style={{ marginBottom: 40 }}>
        <div
          className="label-uppercase"
          style={{ color: "var(--warm-silver)", marginBottom: 8 }}
        >
          Dashboard
        </div>
        <h1
          className="heading-section"
          style={{ fontSize: "2.75rem", marginBottom: 8 }}
        >
          Welcome back
        </h1>
        <p className="text-body" style={{ color: "var(--warm-silver)", maxWidth: 560 }}>
          Upload a tender, browse the knowledge base, or continue a draft.
        </p>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5" style={{ marginBottom: 40 }}>
        {/* New Tender */}
        <Link href="/tender/new" className="no-underline">
          <div className="clay-card clay-card-hover overflow-hidden" style={{ padding: 0 }}>
            <div
              style={{
                background: "var(--matcha-800)",
                padding: "24px 24px 20px",
                color: "var(--clay-white)",
              }}
            >
              <div className="label-uppercase" style={{ color: "var(--matcha-300)", marginBottom: 8 }}>
                Start Here
              </div>
              <div className="heading-card" style={{ fontSize: "1.5rem" }}>
                New Tender
              </div>
            </div>
            <div style={{ padding: "16px 24px 20px" }}>
              <p className="text-body-standard" style={{ color: "var(--warm-charcoal)", margin: 0 }}>
                Upload a tender PDF and generate a draft response
              </p>
            </div>
          </div>
        </Link>

        {/* Knowledge Base */}
        <Link href="/knowledge" className="no-underline">
          <div className="clay-card clay-card-hover overflow-hidden" style={{ padding: 0 }}>
            <div
              style={{
                background: "var(--ube-900)",
                padding: "24px 24px 20px",
                color: "var(--clay-white)",
              }}
            >
              <div className="label-uppercase" style={{ color: "var(--ube-300)", marginBottom: 8 }}>
                Browse
              </div>
              <div className="heading-card" style={{ fontSize: "1.5rem" }}>
                Knowledge Base
              </div>
            </div>
            <div style={{ padding: "16px 24px 20px" }}>
              <p className="text-body-standard" style={{ color: "var(--warm-charcoal)", margin: 0 }}>
                {totalPages} wiki page{totalPages !== 1 ? "s" : ""} across {Object.keys(wikiPages).length} categories
              </p>
            </div>
          </div>
        </Link>

        {/* Upload */}
        <Link href="/knowledge/upload" className="no-underline">
          <div className="clay-card clay-card-hover overflow-hidden" style={{ padding: 0 }}>
            <div
              style={{
                background: "var(--lemon-500)",
                padding: "24px 24px 20px",
                color: "var(--clay-black)",
              }}
            >
              <div className="label-uppercase" style={{ color: "var(--lemon-800)", marginBottom: 8 }}>
                Update KB
              </div>
              <div className="heading-card" style={{ fontSize: "1.5rem" }}>
                Upload Document
              </div>
            </div>
            <div style={{ padding: "16px 24px 20px" }}>
              <p className="text-body-standard" style={{ color: "var(--warm-charcoal)", margin: 0 }}>
                Add a CV, past tender, or methodology doc
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Drafts */}
      <div className="clay-card" style={{ padding: "28px 32px", marginBottom: 24 }}>
        <h2 className="heading-card" style={{ fontSize: "1.5rem", marginBottom: 20 }}>
          Recent Drafts
        </h2>
        {drafts.length === 0 ? (
          <div
            className="clay-card-dashed"
            style={{ padding: "32px", textAlign: "center" }}
          >
            <p className="text-body-standard" style={{ color: "var(--warm-silver)", margin: 0 }}>
              No drafts yet. Upload a tender to generate your first draft.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {drafts.map((d) => (
              <Link key={d.id} href={`/tender/${d.id}`} className="no-underline">
                <div
                  className="clay-card-sm"
                  style={{
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    cursor: "pointer",
                  }}
                >
                  <div>
                    <div className="heading-feature" style={{ fontSize: "1rem", marginBottom: 4 }}>
                      {d.id.replace(/_/g, " ")}
                    </div>
                    <div className="text-small" style={{ color: "var(--warm-silver)" }}>
                      Version {d.versions[d.versions.length - 1]} &middot;{" "}
                      {new Date(d.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <span className="btn-pill">View &rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Knowledge Base Overview */}
      <div className="clay-card" style={{ padding: "28px 32px" }}>
        <h2 className="heading-card" style={{ fontSize: "1.5rem", marginBottom: 20 }}>
          Knowledge Base
        </h2>
        {Object.keys(wikiPages).length === 0 ? (
          <div
            className="clay-card-dashed"
            style={{ padding: "24px", textAlign: "center" }}
          >
            <p className="text-body-standard" style={{ color: "var(--warm-silver)", margin: 0 }}>
              Knowledge base is empty.{" "}
              <Link href="/knowledge/upload" style={{ color: "var(--ube-800)", fontWeight: 600 }}>
                Upload documents
              </Link>{" "}
              to build it.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(wikiPages).map(([cat, pages]) => (
              <Link key={cat} href="/knowledge" className="no-underline">
                <div
                  style={{
                    textAlign: "center",
                    padding: 20,
                    borderRadius: 16,
                    border: "1px dashed var(--oat-border)",
                    background: "var(--warm-cream)",
                    transition: "border-color 0.2s ease",
                  }}
                >
                  <div
                    className="heading-card"
                    style={{
                      fontSize: "2rem",
                      color: "var(--ube-800)",
                      marginBottom: 4,
                    }}
                  >
                    {pages.length}
                  </div>
                  <div className="label-uppercase" style={{ color: "var(--warm-silver)", textTransform: "capitalize" }}>
                    {cat}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
