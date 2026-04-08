"use client";

import { useEffect, useState, use } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface DraftData {
  id: string;
  draft: string;
  analysis: {
    title: string;
    reference: string;
    client: string;
    deadline: string;
    estimatedValue: string;
    summary: string;
    sections: Array<{
      id: string;
      title: string;
      requirement: string;
      contentType: string;
    }>;
  } | null;
}

export default function TenderDraft({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [data, setData] = useState<DraftData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAnalysis, setShowAnalysis] = useState(false);

  useEffect(() => {
    fetch(`/api/drafts/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Draft not found");
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: 40,
          color: "var(--warm-silver)",
        }}
      >
        <span className="clay-spinner" />
        <span className="text-body-standard">Loading draft...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div
        className="clay-card-sm"
        style={{
          padding: "20px 24px",
          background: "rgba(252, 121, 129, 0.08)",
          borderColor: "var(--pomegranate-400)",
        }}
      >
        <span className="text-body-standard" style={{ color: "#b5303a" }}>
          {error || "Draft not found"}
        </span>
      </div>
    );
  }

  const gapCount = (data.draft.match(/\[NEEDS INPUT:/g) || []).length;

  return (
    <div style={{ maxWidth: 860 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div
          className="label-uppercase"
          style={{ color: "var(--warm-silver)", marginBottom: 8 }}
        >
          Draft Response
        </div>
        <h1
          className="heading-section"
          style={{ fontSize: "2.25rem", marginBottom: 8 }}
        >
          {data.analysis?.title || id.replace(/_/g, " ")}
        </h1>
        {data.analysis && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              color: "var(--warm-silver)",
            }}
          >
            <span
              className="text-caption"
              style={{
                padding: "4px 12px",
                background: "var(--oat-light)",
                borderRadius: 1584,
              }}
            >
              Ref: {data.analysis.reference}
            </span>
            <span
              className="text-caption"
              style={{
                padding: "4px 12px",
                background: "var(--oat-light)",
                borderRadius: 1584,
              }}
            >
              Client: {data.analysis.client}
            </span>
            <span
              className="text-caption"
              style={{
                padding: "4px 12px",
                background: "var(--oat-light)",
                borderRadius: 1584,
              }}
            >
              Value: {data.analysis.estimatedValue}
            </span>
            <span
              className="text-caption"
              style={{
                padding: "4px 12px",
                background: "var(--oat-light)",
                borderRadius: 1584,
              }}
            >
              Deadline: {data.analysis.deadline}
            </span>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div
        className="clay-card-sm"
        style={{
          padding: "12px 20px",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            className={`status-dot ${gapCount > 0 ? "status-dot-warning" : "status-dot-success"}`}
          />
          <span
            className="text-caption"
            style={{
              color: gapCount > 0 ? "var(--lemon-700)" : "var(--matcha-600)",
              fontWeight: 500,
            }}
          >
            {gapCount > 0
              ? `${gapCount} section${gapCount > 1 ? "s" : ""} need human input`
              : "All sections have content"}
          </span>
        </div>
        <button
          onClick={() => setShowAnalysis(!showAnalysis)}
          className="btn-pill"
          style={{ fontSize: 12 }}
        >
          {showAnalysis ? "Hide" : "Show"} analysis
        </button>
      </div>

      {/* Tender Analysis (collapsible) */}
      {showAnalysis && data.analysis && (
        <div
          className="clay-card"
          style={{
            marginBottom: 20,
            padding: "24px 28px",
            background: "rgba(67, 8, 159, 0.03)",
            borderColor: "var(--ube-300)",
          }}
        >
          <h3 className="heading-feature" style={{ marginBottom: 12, color: "var(--ube-800)" }}>
            Tender Analysis
          </h3>
          <p className="text-body-standard" style={{ color: "var(--warm-charcoal)", marginBottom: 16 }}>
            {data.analysis.summary}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.analysis.sections.map((s) => (
              <div
                key={s.id}
                className="clay-card-sm"
                style={{ padding: "12px 16px" }}
              >
                <div className="heading-feature" style={{ fontSize: "0.9rem", marginBottom: 4 }}>
                  {s.title}
                </div>
                <div className="text-small" style={{ color: "var(--warm-silver)" }}>
                  <span
                    className="text-mono"
                    style={{
                      fontSize: 10,
                      background: "var(--oat-light)",
                      padding: "2px 6px",
                      borderRadius: 4,
                      marginRight: 6,
                    }}
                  >
                    {s.contentType}
                  </span>
                  {s.requirement.slice(0, 120)}...
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Draft Content */}
      <div className="clay-card" style={{ padding: "32px 36px" }}>
        <div className="prose max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {data.draft}
          </ReactMarkdown>
        </div>
      </div>

      {/* Actions */}
      <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
        <button
          onClick={() => {
            const blob = new Blob([data.draft], { type: "text/markdown" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${id}_draft.md`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="btn-primary"
        >
          Download as Markdown
        </button>
        <button
          onClick={() => navigator.clipboard.writeText(data.draft)}
          className="btn-secondary"
        >
          Copy to Clipboard
        </button>
      </div>
    </div>
  );
}
