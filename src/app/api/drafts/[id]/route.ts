/**
 * GET  /api/drafts/[id] — Read a specific draft (latest version or specific version)
 * PUT  /api/drafts/[id] — Save an edited draft as a new version
 */

import { NextRequest } from "next/server";
import { readDraft, readDraftAnalysis, saveDraft, listDrafts } from "@/lib/storage";

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

  // Find current version number
  const allDrafts = await listDrafts();
  const thisDraft = allDrafts.find((d) => d.id === id);
  const latestVersion = thisDraft
    ? thisDraft.versions[thisDraft.versions.length - 1]
    : 1;

  return Response.json({
    id,
    draft,
    version: version ? parseInt(version) : latestVersion,
    analysis: analysisRaw ? JSON.parse(analysisRaw) : null,
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { content } = (await request.json()) as { content: string };
    if (!content || typeof content !== "string") {
      return Response.json({ error: "content is required" }, { status: 400 });
    }

    // Find the next version number
    const allDrafts = await listDrafts();
    const thisDraft = allDrafts.find((d) => d.id === id);
    const nextVersion = thisDraft
      ? Math.max(...thisDraft.versions) + 1
      : 1;

    await saveDraft(id, content, nextVersion);

    return Response.json({ success: true, version: nextVersion });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
