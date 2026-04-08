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
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-1">Upload New Tender</h1>
      <p className="text-[var(--muted)] mb-6">
        Upload a tender document (PDF) and the agent will analyze its structure,
        retrieve relevant content from the knowledge base, and generate a
        structured first draft.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* File upload area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            file
              ? "border-[var(--primary)] bg-blue-50"
              : "border-[var(--border)] hover:border-[var(--muted)]"
          }`}
        >
          <input
            type="file"
            accept=".pdf,.txt,.md"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
            id="tender-file"
            disabled={loading}
          />
          <label htmlFor="tender-file" className="cursor-pointer">
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
                <div className="font-medium">Click to select a tender document</div>
                <div className="text-sm text-[var(--muted)] mt-1">
                  Supports PDF, TXT, MD
                </div>
              </div>
            )}
          </label>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={!file || loading}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            !file || loading
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]"
          }`}
        >
          {loading ? "Generating Draft..." : "Analyze & Generate Draft"}
        </button>
      </form>

      {/* Status */}
      {status && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          <div className="flex items-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
            {status}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* What happens next */}
      <div className="mt-8 p-4 bg-[var(--background)] border border-[var(--border)] rounded-lg">
        <h3 className="font-semibold mb-2">What happens when you upload:</h3>
        <ol className="text-sm text-[var(--muted)] space-y-1 list-decimal list-inside">
          <li>The tender document is parsed and analyzed by the AI agent</li>
          <li>Required response sections are identified</li>
          <li>
            For each section, the agent retrieves relevant content from the
            knowledge base (company profile, past projects, CVs, methodology,
            etc.)
          </li>
          <li>
            A structured first draft is generated, with gaps clearly marked
          </li>
          <li>You can review, edit, and refine the draft</li>
        </ol>
      </div>
    </div>
  );
}
