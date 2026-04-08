"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";

interface WikiPage {
  path: string;
  title: string;
  category: string;
  tags: string[];
  bodyContent: string;
}

export default function KnowledgeBase() {
  const [pages, setPages] = useState<Record<string, WikiPage[]>>({});
  const [selectedPage, setSelectedPage] = useState<WikiPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);

  useEffect(() => {
    fetch("/api/wiki")
      .then((res) => res.json())
      .then(setPages)
      .finally(() => setLoading(false));
  }, []);

  const loadPage = async (path: string) => {
    setPageLoading(true);
    try {
      const res = await fetch(`/api/wiki?path=${encodeURIComponent(path)}`);
      const page = await res.json();
      setSelectedPage(page);
    } catch {
      setSelectedPage(null);
    }
    setPageLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-[var(--muted)]">
        <div className="animate-spin h-5 w-5 border-2 border-[var(--primary)] border-t-transparent rounded-full" />
        Loading knowledge base...
      </div>
    );
  }

  const categoryLabels: Record<string, string> = {
    company: "Company",
    team: "Team",
    projects: "Projects",
    methodology: "Methodology",
    past_responses: "Past Responses",
    boilerplate: "Boilerplate",
  };

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <div className="w-64 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Knowledge Base</h1>
          <Link
            href="/knowledge/upload"
            className="text-xs bg-[var(--primary)] text-white px-2 py-1 rounded hover:bg-[var(--primary-hover)]"
          >
            + Add
          </Link>
        </div>

        <div className="space-y-4">
          {Object.entries(pages).map(([cat, catPages]) => (
            <div key={cat}>
              <h3 className="text-xs font-semibold uppercase text-[var(--muted)] mb-1">
                {categoryLabels[cat] || cat}
              </h3>
              <div className="space-y-0.5">
                {catPages
                  .filter((p) => !p.path.endsWith("index.md") && !p.path.endsWith("log.md"))
                  .map((p) => (
                    <button
                      key={p.path}
                      onClick={() => loadPage(p.path)}
                      className={`w-full text-left text-sm px-2 py-1.5 rounded transition-colors truncate ${
                        selectedPage?.path === p.path
                          ? "bg-[var(--primary)] text-white"
                          : "hover:bg-[var(--background)]"
                      }`}
                    >
                      {p.title}
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {pageLoading ? (
          <div className="flex items-center gap-2 text-[var(--muted)]">
            <div className="animate-spin h-5 w-5 border-2 border-[var(--primary)] border-t-transparent rounded-full" />
            Loading page...
          </div>
        ) : selectedPage ? (
          <div className="bg-white border border-[var(--border)] rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              {selectedPage.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="prose max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {selectedPage.bodyContent}
              </ReactMarkdown>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-[var(--muted)] bg-white border border-[var(--border)] rounded-lg">
            Select a page from the sidebar to view its content
          </div>
        )}
      </div>
    </div>
  );
}
