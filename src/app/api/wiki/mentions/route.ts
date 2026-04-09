/**
 * GET /api/wiki/mentions — Lightweight list of wiki pages for @-mention autocomplete.
 * Returns only path, title, and category (no body content).
 */

import { listAllPages } from "@/lib/wiki";

export async function GET() {
  const pages = await listAllPages();

  const mentions = pages
    .filter(
      (p) => !p.path.endsWith("index.md") && !p.path.endsWith("log.md")
    )
    .map((p) => ({
      path: p.path.replace(/\.md$/, ""),
      title: p.title,
      category: p.path.split("/")[0] || "root",
    }))
    .sort((a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title));

  return Response.json(mentions);
}
