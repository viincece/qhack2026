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
      <div className="flex items-center gap-2 text-[var(--muted)]">
        <div className="animate-spin h-5 w-5 border-2 border-[var(--primary)] border-t-transparent rounded-full" />
        Loading draft...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
        {error || "Draft not found"}
      </div>
    );
  }

  const gapCount = (data.draft.match(/\[NEEDS INPUT:/g) || []).length;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">
          {data.analysis?.title || id.replace(/_/g, " ")}
        </h1>
        {data.analysis && (
          <div className="flex flex-wrap gap-3 text-sm text-[var(--muted)]">
            <span>Ref: {data.analysis.reference}</span>
            <span>&middot;</span>
            <span>Client: {data.analysis.client}</span>
            <span>&middot;</span>
            <span>Value: {data.analysis.estimatedValue}</span>
            <span>&middot;</span>
            <span>Deadline: {data.analysis.deadline}</span>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-4 mb-4 p-3 bg-white border border-[var(--border)] rounded-lg">
        <div className="flex items-center gap-2 text-sm">
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              gapCount > 0 ? "bg-[var(--warning)]" : "bg-[var(--success)]"
            }`}
          />
          {gapCount > 0 ? (
            <span className="text-[var(--warning)]">
              {gapCount} section{gapCount > 1 ? "s" : ""} need human input
            </span>
          ) : (
            <span className="text-[var(--success)]">
              All sections have content
            </span>
          )}
        </div>
        <button
          onClick={() => setShowAnalysis(!showAnalysis)}
          className="text-sm text-[var(--primary)] hover:underline ml-auto"
        >
          {showAnalysis ? "Hide" : "Show"} tender analysis
        </button>
      </div>

      {/* Tender Analysis (collapsible) */}
      {showAnalysis && data.analysis && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold mb-2">Tender Analysis</h3>
          <p className="text-sm mb-3">{data.analysis.summary}</p>
          <div className="space-y-2">
            {data.analysis.sections.map((s) => (
              <div
                key={s.id}
                className="text-sm p-2 bg-white rounded border border-blue-100"
              >
                <div className="font-medium">{s.title}</div>
                <div className="text-[var(--muted)] text-xs">
                  Type: {s.contentType} &middot; {s.requirement.slice(0, 120)}
                  ...
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Draft Content */}
      <div className="bg-white border border-[var(--border)] rounded-lg p-6">
        <div className="prose max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {data.draft}
          </ReactMarkdown>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex gap-3">
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
          className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm hover:bg-[var(--primary-hover)] transition-colors"
        >
          Download as Markdown
        </button>
        <button
          onClick={() => navigator.clipboard.writeText(data.draft)}
          className="px-4 py-2 bg-white border border-[var(--border)] rounded-lg text-sm hover:border-[var(--primary)] transition-colors"
        >
          Copy to Clipboard
        </button>
      </div>
    </div>
  );
}
