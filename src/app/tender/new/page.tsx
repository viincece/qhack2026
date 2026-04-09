"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ProgressStep {
  id: string;
  label: string;
  status: "pending" | "active" | "done";
  detail?: string;
}

const PIPELINE_STEPS: { id: string; label: string }[] = [
  { id: "parsing", label: "Parsing document" },
  { id: "analyzing", label: "Analyzing tender structure" },
  { id: "retrieving", label: "Retrieving knowledge base content" },
  { id: "drafting", label: "Generating complete draft" },
  { id: "postprocessing", label: "Post-processing & saving" },
];

export default function NewTender() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState<ProgressStep[]>([]);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError("");

    // Initialize all steps as pending
    setSteps(PIPELINE_STEPS.map((s) => ({ ...s, status: "pending" })));

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/tender", {
        method: "POST",
        body: formData,
      });

      if (!res.ok && !res.body) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate draft");
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        let currentEvent = "";
        for (const line of lines) {
          if (line.startsWith("event: ")) {
            currentEvent = line.slice(7);
          } else if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6));

            if (currentEvent === "progress") {
              handleProgress(data.step, data.detail);
            } else if (currentEvent === "complete") {
              // Mark all steps done
              setSteps((prev) =>
                prev.map((s) => ({ ...s, status: "done" as const }))
              );
              setTimeout(() => router.push(`/tender/${data.tenderId}`), 600);
            } else if (currentEvent === "error") {
              throw new Error(data.error);
            }
            currentEvent = "";
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setLoading(false);
      setSteps([]);
    }
  };

  const handleProgress = (step: string, detail?: string) => {
    // Map backend step IDs to our pipeline step IDs
    const stepMapping: Record<string, string> = {
      parsing: "parsing",
      analyzing: "analyzing",
      analyzing_done: "analyzing",
      retrieving: "retrieving",
      retrieving_section: "retrieving",
      team: "retrieving",
      drafting: "drafting",
      postprocessing: "postprocessing",
      done: "postprocessing",
    };

    const mappedId = stepMapping[step];
    if (!mappedId) return;

    setSteps((prev) => {
      const targetIndex = prev.findIndex((s) => s.id === mappedId);
      if (targetIndex === -1) return prev;

      return prev.map((s, i) => {
        if (i < targetIndex) {
          return { ...s, status: "done" };
        } else if (i === targetIndex) {
          return {
            ...s,
            status: step === "done" ? "done" : "active",
            detail: detail || s.detail,
          };
        }
        return { ...s, status: "pending" };
      });
    });
  };

  return (
    <div style={{ maxWidth: 640 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div
          className="label-uppercase"
          style={{ color: "var(--matcha-600)", marginBottom: 8 }}
        >
          New Tender
        </div>
        <h1
          className="heading-section"
          style={{ fontSize: "2.75rem", marginBottom: 12 }}
        >
          Upload Tender
        </h1>
        <p className="text-body" style={{ color: "var(--warm-charcoal)" }}>
          Upload a tender document (PDF) and the agent will analyze its structure,
          retrieve relevant content from the knowledge base, and generate a
          structured first draft.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 20 }}
      >
        {/* File upload */}
        <div
          className={`upload-zone ${file ? "has-file" : ""}`}
          onClick={() => document.getElementById("tender-file")?.click()}
        >
          <input
            type="file"
            accept=".pdf,.txt,.md"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            style={{ display: "none" }}
            id="tender-file"
            disabled={loading}
          />
          {file ? (
            <div>
              <div
                className="heading-feature"
                style={{
                  fontSize: "1.25rem",
                  color: "var(--matcha-600)",
                  marginBottom: 4,
                }}
              >
                {file.name}
              </div>
              <div className="text-caption" style={{ color: "var(--warm-silver)" }}>
                {(file.size / 1024).toFixed(0)} KB &middot; Click to change
              </div>
            </div>
          ) : (
            <div>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: "var(--oat-light)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  fontSize: 24,
                  color: "var(--warm-charcoal)",
                }}
              >
                +
              </div>
              <div className="heading-feature" style={{ marginBottom: 4 }}>
                Click to select a tender document
              </div>
              <div className="text-caption" style={{ color: "var(--warm-silver)" }}>
                Supports PDF, TXT, MD
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!file || loading}
          className="btn-primary"
          style={{ width: "100%", padding: "14px 20px", fontSize: 18 }}
        >
          {loading ? (
            <>
              <span className="clay-spinner" style={{ width: 18, height: 18 }} />
              Generating Draft...
            </>
          ) : (
            "Analyze & Generate Draft"
          )}
        </button>
      </form>

      {/* Pipeline Progress */}
      {steps.length > 0 && (
        <div
          className="clay-card"
          style={{ marginTop: 24, padding: "24px 28px" }}
        >
          <div
            className="label-uppercase"
            style={{ color: "var(--ube-800)", marginBottom: 16 }}
          >
            Generation Pipeline
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 0,
            }}
          >
            {steps.map((step, i) => (
              <div key={step.id}>
                {/* Step row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 14,
                    padding: "10px 0",
                  }}
                >
                  {/* Icon */}
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 10,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      background:
                        step.status === "done"
                          ? "var(--matcha-600)"
                          : step.status === "active"
                            ? "var(--ube-800)"
                            : "var(--oat-light)",
                      transition: "background 0.3s ease",
                    }}
                  >
                    {step.status === "done" ? (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 7.5L5.5 10L11 4" />
                      </svg>
                    ) : step.status === "active" ? (
                      <span
                        className="clay-spinner"
                        style={{
                          width: 14,
                          height: 14,
                          borderColor: "rgba(255,255,255,0.3)",
                          borderTopColor: "white",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          background: "var(--oat-border)",
                        }}
                      />
                    )}
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      className="heading-feature"
                      style={{
                        fontSize: "0.9rem",
                        color:
                          step.status === "done"
                            ? "var(--matcha-600)"
                            : step.status === "active"
                              ? "var(--clay-black)"
                              : "var(--warm-silver)",
                        transition: "color 0.3s ease",
                      }}
                    >
                      {step.label}
                    </div>
                    {step.detail && step.status !== "pending" && (
                      <div
                        className="text-caption"
                        style={{
                          color: "var(--warm-silver)",
                          marginTop: 2,
                        }}
                      >
                        {step.detail}
                      </div>
                    )}
                  </div>
                </div>

                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div
                    style={{
                      width: 2,
                      height: 8,
                      marginLeft: 13,
                      background:
                        step.status === "done"
                          ? "var(--matcha-300)"
                          : "var(--oat-light)",
                      borderRadius: 1,
                      transition: "background 0.3s ease",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          className="clay-card-sm"
          style={{
            marginTop: 24,
            padding: "16px 24px",
            background: "rgba(252, 121, 129, 0.08)",
            borderColor: "var(--pomegranate-400)",
          }}
        >
          <span className="text-body-standard" style={{ color: "#b5303a" }}>
            <strong>Error:</strong> {error}
          </span>
        </div>
      )}

      {/* Help text */}
      {!loading && steps.length === 0 && (
        <div
          className="clay-card-dashed"
          style={{ marginTop: 40, padding: "24px 28px" }}
        >
          <h3 className="heading-feature" style={{ marginBottom: 16 }}>
            What happens when you upload:
          </h3>
          <ol
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {[
              "The tender document is parsed and analyzed by the AI agent",
              "Required response sections are identified",
              "For each section, relevant content is retrieved from the knowledge base",
              "A structured first draft is generated, with gaps clearly marked",
              "You can review, edit, and refine the draft",
            ].map((step, i) => (
              <li
                key={i}
                style={{ display: "flex", alignItems: "flex-start", gap: 12 }}
              >
                <span
                  className="text-mono"
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    width: 24,
                    height: 24,
                    borderRadius: 8,
                    background: "var(--oat-light)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    color: "var(--warm-charcoal)",
                  }}
                >
                  {i + 1}
                </span>
                <span
                  className="text-body-standard"
                  style={{ color: "var(--warm-charcoal)" }}
                >
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
