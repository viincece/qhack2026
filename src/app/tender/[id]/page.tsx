"use client";

import {
  useEffect,
  useState,
  useCallback,
  use,
  Children,
  ReactNode,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ChatSidebar from "@/components/ChatSidebar";

interface DraftData {
  id: string;
  draft: string;
  version: number;
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

/* ── [NEEDS INPUT] highlighting ─────────────────────────── */

function highlightNeedsInput(text: string): ReactNode[] {
  const parts = text.split(/(\[NEEDS INPUT:[^\]]*\])/g);
  return parts.map((part, i) =>
    part.startsWith("[NEEDS INPUT:") ? (
      <span key={i} className="needs-input-marker">
        {part}
      </span>
    ) : (
      part
    )
  );
}

function processChildren(children: ReactNode): ReactNode {
  return Children.map(children, (child) => {
    if (typeof child === "string" && child.includes("[NEEDS INPUT:")) {
      return <>{highlightNeedsInput(child)}</>;
    }
    return child;
  });
}

const markdownComponents = {
  p: ({ children }: { children?: ReactNode }) => (
    <p>{processChildren(children)}</p>
  ),
  li: ({ children }: { children?: ReactNode }) => (
    <li>{processChildren(children)}</li>
  ),
  td: ({ children }: { children?: ReactNode }) => (
    <td>{processChildren(children)}</td>
  ),
  th: ({ children }: { children?: ReactNode }) => (
    <th>{processChildren(children)}</th>
  ),
};

/* ── Page Component ─────────────────────────────────────── */

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

  // Editor state
  const [editMode, setEditMode] = useState(false);
  const [editableContent, setEditableContent] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedVersion, setSavedVersion] = useState(1);

  // Chat sidebar state
  const [chatOpen, setChatOpen] = useState(false);
  const [aiEditing, setAiEditing] = useState(false);

  useEffect(() => {
    fetch(`/api/drafts/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Draft not found");
        return res.json();
      })
      .then((d: DraftData) => {
        setData(d);
        setEditableContent(d.draft);
        setSavedVersion(d.version);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  // Warn on unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/drafts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editableContent }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      setSavedVersion(result.version);
      setIsDirty(false);
      // Update the data object so preview reflects saved content
      setData((prev) =>
        prev ? { ...prev, draft: editableContent, version: result.version } : prev
      );
    } catch (err) {
      alert(
        "Save failed: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    }
    setIsSaving(false);
  }, [id, editableContent]);

  const handleDraftUpdate = useCallback((newDraft: string) => {
    setEditableContent(newDraft);
    setIsDirty(true);
  }, []);

  const handleEditorChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setEditableContent(e.target.value);
      setIsDirty(true);
    },
    []
  );

  /* ── Loading / Error ─────────────────────────────────── */

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

  const gapCount = (editableContent.match(/\[NEEDS INPUT:/g) || []).length;

  /* ── Render ──────────────────────────────────────────── */

  return (
    <div className="draft-layout">
      {/* Main content */}
      <div className="draft-main">
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

        {/* Toolbar */}
        <div
          className="clay-card-sm"
          style={{
            padding: "10px 16px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          {/* Left: status + version */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                className={`status-dot ${gapCount > 0 ? "status-dot-warning" : "status-dot-success"}`}
              />
              <span
                className="text-caption"
                style={{
                  color: gapCount > 0 ? "#c2410c" : "var(--matcha-600)",
                  fontWeight: 500,
                }}
              >
                {gapCount > 0
                  ? `${gapCount} gap${gapCount > 1 ? "s" : ""} need input`
                  : "Complete"}
              </span>
            </div>
            <span
              className="text-caption"
              style={{ color: "var(--warm-silver)" }}
            >
              v{savedVersion}
              {isDirty && (
                <span style={{ color: "#c2410c", marginLeft: 4 }}>
                  (unsaved)
                </span>
              )}
            </span>
          </div>

          {/* Right: actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => setShowAnalysis(!showAnalysis)}
              className="btn-pill"
              style={{ fontSize: 12 }}
            >
              {showAnalysis ? "Hide" : "Show"} analysis
            </button>

            {/* View toggle */}
            <div className="view-toggle">
              <button
                className={`view-toggle-btn ${!editMode ? "active" : ""}`}
                onClick={() => setEditMode(false)}
              >
                Preview
              </button>
              <button
                className={`view-toggle-btn ${editMode ? "active" : ""}`}
                onClick={() => setEditMode(true)}
              >
                Edit
              </button>
            </div>

            {/* Save */}
            {isDirty && (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="btn-primary"
                style={{ fontSize: 12, padding: "6px 14px" }}
              >
                {isSaving ? (
                  <>
                    <span
                      className="clay-spinner"
                      style={{ width: 12, height: 12 }}
                    />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </button>
            )}

            {/* Chat toggle */}
            <button
              onClick={() => setChatOpen(!chatOpen)}
              className={`btn-pill ${chatOpen ? "chat-toggle-active" : ""}`}
              style={{ fontSize: 12 }}
              title="Toggle AI assistant"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginRight: chatOpen ? 0 : 4 }}
              >
                <path d="M2 3h12a1 1 0 011 1v7a1 1 0 01-1 1H5l-3 3V4a1 1 0 011-1z" />
              </svg>
              {!chatOpen && "AI Chat"}
            </button>
          </div>
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
            <h3
              className="heading-feature"
              style={{ marginBottom: 12, color: "var(--ube-800)" }}
            >
              Tender Analysis
            </h3>
            <p
              className="text-body-standard"
              style={{ color: "var(--warm-charcoal)", marginBottom: 16 }}
            >
              {data.analysis.summary}
            </p>
            <div
              style={{ display: "flex", flexDirection: "column", gap: 8 }}
            >
              {data.analysis.sections.map((s) => (
                <div
                  key={s.id}
                  className="clay-card-sm"
                  style={{ padding: "12px 16px" }}
                >
                  <div
                    className="heading-feature"
                    style={{ fontSize: "0.9rem", marginBottom: 4 }}
                  >
                    {s.title}
                  </div>
                  <div
                    className="text-small"
                    style={{ color: "var(--warm-silver)" }}
                  >
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

        {/* Actions */}
        <div style={{ marginBottom: 16, display: "flex", gap: 12 }}>
          <button
            onClick={() => {
              const blob = new Blob([editableContent], {
                type: "text/markdown",
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `${id}_draft_v${savedVersion}.md`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="btn-primary"
          >
            Download as Markdown
          </button>
          <button
            onClick={() => navigator.clipboard.writeText(editableContent)}
            className="btn-secondary"
          >
            Copy to Clipboard
          </button>
        </div>

        {/* Draft Content — Preview or Edit */}
        <div style={{ position: "relative" }}>
          {/* AI editing overlay */}
          {aiEditing && (
            <div className="draft-editing-overlay">
              <span className="clay-spinner" style={{ width: 18, height: 18 }} />
              <span className="text-body-standard" style={{ fontWeight: 500 }}>
                AI is editing the draft...
              </span>
            </div>
          )}

          {editMode ? (
            <div className="clay-card" style={{ padding: "24px 28px" }}>
              <textarea
                className="draft-editor"
                value={editableContent}
                onChange={handleEditorChange}
                readOnly={aiEditing}
                spellCheck={false}
              />
            </div>
          ) : (
            <div
              className="clay-card"
              style={{
                padding: "32px 36px",
                transition: "opacity 0.2s",
                opacity: aiEditing ? 0.5 : 1,
              }}
            >
              <div className="prose max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={markdownComponents}
                >
                  {editableContent}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Sidebar */}
      {chatOpen && (
        <ChatSidebar
          currentDraft={editableContent}
          tenderTitle={data.analysis?.title}
          onDraftUpdate={handleDraftUpdate}
          onClose={() => setChatOpen(false)}
          onEditingStateChange={setAiEditing}
        />
      )}
    </div>
  );
}
