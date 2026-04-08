/**
 * POST /api/ingest — Upload a document to add to the knowledge base
 * Accepts multipart form data with a "file" field and optional "category" field.
 */

import { NextRequest } from "next/server";
import { ingestDocument } from "@/lib/wiki";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const category = (formData.get("category") as string) || "uploads";

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await ingestDocument(buffer, file.name, category);

    return Response.json({
      success: true,
      filename: file.name,
      pagesCreated: result.pagesCreated,
      pagesUpdated: result.pagesUpdated,
      errors: result.errors,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
