import Link from "next/link";
import { listDrafts } from "@/lib/storage";
import { listPagesByCategory } from "@/lib/wiki";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const drafts = await listDrafts();
  const wikiPages = await listPagesByCategory();
  const totalPages = Object.values(wikiPages).flat().length;
  const categories = Object.keys(wikiPages).length;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
      <p className="text-[var(--muted)] mb-8">
        AI-powered tender response drafting for Meridian Intelligence GmbH
      </p>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link
          href="/tender/new"
          className="bg-[var(--primary)] text-white rounded-lg p-5 hover:bg-[var(--primary-hover)] transition-colors"
        >
          <div className="font-semibold text-lg mb-1">New Tender</div>
          <div className="text-sm opacity-90">
            Upload a tender PDF and generate a draft response
          </div>
        </Link>
        <Link
          href="/knowledge"
          className="bg-white border border-[var(--border)] rounded-lg p-5 hover:border-[var(--primary)] transition-colors"
        >
          <div className="font-semibold text-lg mb-1">Knowledge Base</div>
          <div className="text-sm text-[var(--muted)]">
            Browse {totalPages} wiki pages across {categories} categories
          </div>
        </Link>
        <Link
          href="/knowledge/upload"
          className="bg-white border border-[var(--border)] rounded-lg p-5 hover:border-[var(--primary)] transition-colors"
        >
          <div className="font-semibold text-lg mb-1">Upload Document</div>
          <div className="text-sm text-[var(--muted)]">
            Add a CV, past tender, or methodology doc to the KB
          </div>
        </Link>
      </div>

      {/* Recent Drafts */}
      <div className="bg-white border border-[var(--border)] rounded-lg p-5">
        <h2 className="font-semibold text-lg mb-3">Recent Drafts</h2>
        {drafts.length === 0 ? (
          <p className="text-[var(--muted)] text-sm">
            No drafts yet. Upload a tender to generate your first draft.
          </p>
        ) : (
          <div className="space-y-2">
            {drafts.map((d) => (
              <Link
                key={d.id}
                href={`/tender/${d.id}`}
                className="flex items-center justify-between p-3 rounded hover:bg-[var(--background)] transition-colors"
              >
                <div>
                  <div className="font-medium">{d.id.replace(/_/g, " ")}</div>
                  <div className="text-xs text-[var(--muted)]">
                    Version {d.versions[d.versions.length - 1]} &middot;{" "}
                    {new Date(d.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                <span className="text-xs bg-[var(--background)] px-2 py-1 rounded">
                  View &rarr;
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Knowledge Base Summary */}
      <div className="mt-6 bg-white border border-[var(--border)] rounded-lg p-5">
        <h2 className="font-semibold text-lg mb-3">Knowledge Base Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(wikiPages).map(([cat, pages]) => (
            <div
              key={cat}
              className="text-center p-3 bg-[var(--background)] rounded"
            >
              <div className="text-2xl font-bold text-[var(--primary)]">
                {pages.length}
              </div>
              <div className="text-xs text-[var(--muted)] capitalize">{cat}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
