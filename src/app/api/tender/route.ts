/**
 * POST /api/tender — Upload a tender PDF and generate a draft response
 * Streams progress updates via Server-Sent Events, then sends the final result.
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
    const fileName = file.name;

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const send = (event: string, data: unknown) => {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
          );
        };

        try {
          const result = await generateDraft(buffer, fileName, (step, detail) => {
            send("progress", { step, detail });
          });

          send("complete", {
            success: true,
            tenderId: result.tenderId,
            analysis: result.analysis,
            version: result.version,
            sectionDetails: result.sectionDetails,
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Unknown error";
          send("error", { error: message });
        }

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
