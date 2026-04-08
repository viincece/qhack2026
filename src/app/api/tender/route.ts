/**
 * POST /api/tender — Upload a tender PDF and generate a draft response
 * Accepts multipart form data with a "file" field.
 */

import { NextRequest } from "next/server";
import { generateDraft } from "@/lib/drafter";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await generateDraft(buffer, file.name);

    return Response.json({
      success: true,
      tenderId: result.tenderId,
      analysis: result.analysis,
      version: result.version,
      sectionDetails: result.sectionDetails,
      draft: result.draft,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
