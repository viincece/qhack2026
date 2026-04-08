/**
 * GET /api/drafts/[id] — Read a specific draft (latest version or specific version)
 * GET /api/drafts/[id]?version=2
 */

import { NextRequest } from "next/server";
import { readDraft, readDraftAnalysis } from "@/lib/storage";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const version = request.nextUrl.searchParams.get("version");

  const draft = await readDraft(id, version ? parseInt(version) : undefined);
  const analysisRaw = await readDraftAnalysis(id);

  if (!draft) {
    return Response.json({ error: "Draft not found" }, { status: 404 });
  }

  return Response.json({
    id,
    draft,
    analysis: analysisRaw ? JSON.parse(analysisRaw) : null,
  });
}
