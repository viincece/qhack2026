/**
 * GET /api/drafts — List all generated drafts
 */

import { listDrafts } from "@/lib/storage";

export async function GET() {
  const drafts = await listDrafts();
  return Response.json(drafts);
}
