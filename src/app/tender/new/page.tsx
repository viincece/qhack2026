"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewTender() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError("");
    setStatus("Uploading tender document...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      setStatus("Analyzing tender structure (this may take 30-60 seconds)...");

      const res = await fetch("/api/tender", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate draft");
      }

      setStatus("Draft generated! Redirecting...");
      router.push(`/tender/${data.tenderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setLoading(false);
      setStatus("");
    }
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

      {/* Status */}
      {status && (
        <div
          className="clay-card-sm"
          style={{
            marginTop: 24,
            padding: "16px 24px",
            background: "rgba(67, 8, 159, 0.05)",
            borderColor: "var(--ube-300)",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span className="clay-spinner" style={{ width: 16, height: 16 }} />
          <span className="text-body-standard" style={{ color: "var(--ube-800)" }}>
            {status}
          </span>
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
    </div>
  );
}
