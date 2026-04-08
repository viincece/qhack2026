"use client";

import { useState } from "react";

export default function UploadDocument() {
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState("uploads");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    pagesCreated?: string[];
    pagesUpdated?: string[];
    errors?: string[];
    error?: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);

      const res = await fetch("/api/ingest", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }

    setLoading(false);
  };

  const categories = [
    { value: "company", label: "Company Document" },
    { value: "team_cvs", label: "Team CV" },
    { value: "past_tenders", label: "Past Tender Response" },
    { value: "methodology", label: "Methodology / Process" },
    { value: "uploads", label: "Other" },
  ];

  return (
    <div style={{ maxWidth: 640 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div
          className="label-uppercase"
          style={{ color: "var(--lemon-700)", marginBottom: 8 }}
        >
          Knowledge Base
        </div>
        <h1
          className="heading-section"
          style={{ fontSize: "2.75rem", marginBottom: 12 }}
        >
          Upload Document
        </h1>
        <p className="text-body" style={{ color: "var(--warm-charcoal)" }}>
          Add a new document to the knowledge base. The AI agent will read it,
          extract key information, and create or update wiki pages automatically.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 20 }}
      >
        {/* Category selector */}
        <div>
          <label
            className="label-uppercase"
            style={{
              display: "block",
              marginBottom: 8,
              color: "var(--warm-charcoal)",
            }}
          >
            Document Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="clay-select"
            disabled={loading}
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* File upload */}
        <div
          className={`upload-zone ${file ? "has-file" : ""}`}
          onClick={() => document.getElementById("kb-file")?.click()}
        >
          <input
            type="file"
            accept=".pdf,.txt,.md,.xlsx,.xls,.docx"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            style={{ display: "none" }}
            id="kb-file"
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
                Click to select a document
              </div>
              <div className="text-caption" style={{ color: "var(--warm-silver)" }}>
                Supports PDF, DOCX, XLSX, TXT, MD
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
              Processing document (this may take 20-30 seconds)...
            </>
          ) : (
            "Upload & Process"
          )}
        </button>
      </form>

      {/* Result */}
      {result && (
        <div
          className="clay-card-sm"
          style={{
            marginTop: 24,
            padding: "20px 24px",
            background: result.success
              ? "rgba(132, 231, 165, 0.08)"
              : "rgba(252, 121, 129, 0.08)",
            borderColor: result.success
              ? "var(--matcha-300)"
              : "var(--pomegranate-400)",
          }}
        >
          {result.success ? (
            <div>
              <div
                className="heading-feature"
                style={{ color: "var(--matcha-800)", marginBottom: 8 }}
              >
                Document processed successfully!
              </div>
              {result.pagesCreated && result.pagesCreated.length > 0 && (
                <div
                  className="text-body-standard"
                  style={{ color: "var(--matcha-600)", marginBottom: 4 }}
                >
                  <strong>Pages created:</strong>{" "}
                  {result.pagesCreated.join(", ")}
                </div>
              )}
              {result.pagesUpdated && result.pagesUpdated.length > 0 && (
                <div
                  className="text-body-standard"
                  style={{ color: "var(--matcha-600)", marginBottom: 4 }}
                >
                  <strong>Pages updated:</strong>{" "}
                  {result.pagesUpdated.join(", ")}
                </div>
              )}
              {result.errors && result.errors.length > 0 && (
                <div
                  className="text-body-standard"
                  style={{ color: "var(--lemon-700)", marginTop: 8 }}
                >
                  <strong>Warnings:</strong> {result.errors.join("; ")}
                </div>
              )}
            </div>
          ) : (
            <div className="text-body-standard" style={{ color: "#b5303a" }}>
              <strong>Error:</strong> {result.error || "Processing failed"}
            </div>
          )}
        </div>
      )}

      {/* Help text */}
      <div
        className="clay-card-dashed"
        style={{ marginTop: 40, padding: "24px 28px" }}
      >
        <h3 className="heading-feature" style={{ marginBottom: 16 }}>
          How the knowledge base update works:
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
            "Your document is saved as an immutable raw source",
            "The AI agent reads and analyzes the document content",
            "New wiki pages are created or existing ones are updated",
            "Cross-references between pages are maintained automatically",
            "The wiki index is updated to include any new pages",
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
