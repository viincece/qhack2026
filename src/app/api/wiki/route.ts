/**
 * GET /api/wiki — List all wiki pages grouped by category
 * GET /api/wiki?path=company/profile — Read a specific wiki page
 */

import { NextRequest } from "next/server";
import { listPagesByCategory, getWikiPage } from "@/lib/wiki";

export async function GET(request: NextRequest) {
  const pagePath = request.nextUrl.searchParams.get("path");

  if (pagePath) {
    // Read a specific page
    const page = await getWikiPage(pagePath);
    if (!page) {
      return Response.json({ error: "Page not found" }, { status: 404 });
    }
    return Response.json(page);
  }

  // List all pages grouped by category
  const grouped = await listPagesByCategory();
  return Response.json(grouped);
}
