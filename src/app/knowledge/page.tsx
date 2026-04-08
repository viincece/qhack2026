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

  const categoryLabels: Record<string, string> = {
    company: "Company",
    team: "Team",
    projects: "Projects",
    methodology: "Methodology",
    past_responses: "Past Responses",
    boilerplate: "Boilerplate",
  };

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
        <span className="text-body-standard">Loading knowledge base...</span>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1060 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 28,
        }}
      >
        <div>
          <div
            className="label-uppercase"
            style={{ color: "var(--ube-800)", marginBottom: 8 }}
          >
            Knowledge Graph
          </div>
          <h1
            className="heading-section"
            style={{ fontSize: "2.75rem", marginBottom: 4 }}
          >
            Knowledge Base
          </h1>
          <p
            className="text-body"
            style={{ color: "var(--warm-silver)", margin: 0 }}
          >
            Browse company wiki pages organized by category
          </p>
        </div>
        <Link
          href="/knowledge/upload"
          className="btn-primary"
          style={{
            textDecoration: "none",
            whiteSpace: "nowrap",
            padding: "10px 20px",
            fontSize: 14,
            borderRadius: 12,
          }}
        >
          + Add Document
        </Link>
      </div>

      <div style={{ display: "flex", gap: 24 }}>
        {/* Category browser */}
        <div
          className="clay-card"
          style={{
            width: 260,
            flexShrink: 0,
            padding: "20px 16px",
            alignSelf: "flex-start",
            position: "sticky",
            top: 32,
          }}
        >
          {Object.entries(pages).map(([cat, catPages]) => (
            <div key={cat} style={{ marginBottom: 20 }}>
              <div
                className="label-uppercase"
                style={{
                  color: "var(--warm-silver)",
                  marginBottom: 8,
                  padding: "0 8px",
                }}
              >
                {categoryLabels[cat] || cat}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {catPages
                  .filter(
                    (p) =>
                      !p.path.endsWith("index.md") &&
                      !p.path.endsWith("log.md")
                  )
                  .map((p) => (
                    <button
                      key={p.path}
                      onClick={() => loadPage(p.path)}
                      style={{
                        all: "unset",
                        display: "block",
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "8px 10px",
                        borderRadius: 10,
                        fontSize: 13.5,
                        fontWeight: selectedPage?.path === p.path ? 600 : 400,
                        color:
                          selectedPage?.path === p.path
                            ? "var(--ube-800)"
                            : "var(--warm-charcoal)",
                        background:
                          selectedPage?.path === p.path
                            ? "rgba(67, 8, 159, 0.08)"
                            : "transparent",
                        cursor: "pointer",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        transition: "background 0.15s, color 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        if (selectedPage?.path !== p.path) {
                          e.currentTarget.style.background = "var(--oat-light)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedPage?.path !== p.path) {
                          e.currentTarget.style.background = "transparent";
                        }
                      }}
                    >
                      {p.title}
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Page content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {pageLoading ? (
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
              <span className="text-body-standard">Loading page...</span>
            </div>
          ) : selectedPage ? (
            <div className="clay-card" style={{ padding: "28px 32px" }}>
              {/* Tags */}
              {selectedPage.tags.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    marginBottom: 16,
                    flexWrap: "wrap",
                  }}
                >
                  {selectedPage.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "4px 10px",
                        borderRadius: 1584,
                        background: "var(--badge-blue-bg)",
                        color: "var(--badge-blue-text)",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="prose max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {selectedPage.bodyContent}
                </ReactMarkdown>
              </div>
            </div>
          ) : (
            <div
              className="clay-card-dashed"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 320,
                color: "var(--warm-silver)",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 20,
                    background: "var(--oat-light)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                    fontSize: 28,
                  }}
                >
                  KB
                </div>
                <div className="text-body-standard" style={{ color: "var(--warm-silver)" }}>
                  Select a page from the sidebar to view its content
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
