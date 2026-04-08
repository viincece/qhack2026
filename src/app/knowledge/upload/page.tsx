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
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-1">Upload to Knowledge Base</h1>
      <p className="text-[var(--muted)] mb-6">
        Add a new document to the knowledge base. The AI agent will read it,
        extract key information, and create or update wiki pages automatically.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category selector */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Document Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm bg-white"
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
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            file
              ? "border-[var(--primary)] bg-blue-50"
              : "border-[var(--border)] hover:border-[var(--muted)]"
          }`}
        >
          <input
            type="file"
            accept=".pdf,.txt,.md,.xlsx,.xls,.docx"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
            id="kb-file"
            disabled={loading}
          />
          <label htmlFor="kb-file" className="cursor-pointer">
            {file ? (
              <div>
                <div className="text-lg font-medium text-[var(--primary)]">
                  {file.name}
                </div>
                <div className="text-sm text-[var(--muted)] mt-1">
                  {(file.size / 1024).toFixed(0)} KB &middot; Click to change
                </div>
              </div>
            ) : (
              <div>
                <div className="text-4xl mb-2">+</div>
                <div className="font-medium">Click to select a document</div>
                <div className="text-sm text-[var(--muted)] mt-1">
                  Supports PDF, DOCX, XLSX, TXT, MD
                </div>
              </div>
            )}
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!file || loading}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            !file || loading
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]"
          }`}
        >
          {loading
            ? "Processing document (this may take 20-30 seconds)..."
            : "Upload & Process"}
        </button>
      </form>

      {/* Result */}
      {result && (
        <div
          className={`mt-6 p-4 rounded-lg border ${
            result.success
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          {result.success ? (
            <div>
              <div className="font-semibold text-green-800 mb-2">
                Document processed successfully!
              </div>
              {result.pagesCreated && result.pagesCreated.length > 0 && (
                <div className="text-sm text-green-700 mb-1">
                  <strong>Pages created:</strong>{" "}
                  {result.pagesCreated.join(", ")}
                </div>
              )}
              {result.pagesUpdated && result.pagesUpdated.length > 0 && (
                <div className="text-sm text-green-700 mb-1">
                  <strong>Pages updated:</strong>{" "}
                  {result.pagesUpdated.join(", ")}
                </div>
              )}
              {result.errors && result.errors.length > 0 && (
                <div className="text-sm text-yellow-700 mt-2">
                  <strong>Warnings:</strong> {result.errors.join("; ")}
                </div>
              )}
            </div>
          ) : (
            <div className="text-red-800">
              <strong>Error:</strong> {result.error || "Processing failed"}
            </div>
          )}
        </div>
      )}

      {/* Help text */}
      <div className="mt-8 p-4 bg-[var(--background)] border border-[var(--border)] rounded-lg">
        <h3 className="font-semibold mb-2">How the knowledge base update works:</h3>
        <ol className="text-sm text-[var(--muted)] space-y-1 list-decimal list-inside">
          <li>Your document is saved as an immutable raw source</li>
          <li>The AI agent reads and analyzes the document content</li>
          <li>
            New wiki pages are created or existing ones are updated with the new
            information
          </li>
          <li>Cross-references between pages are maintained automatically</li>
          <li>The wiki index is updated to include any new pages</li>
        </ol>
      </div>
    </div>
  );
}
