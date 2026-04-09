/**
 * POST /api/chat — Streaming chat endpoint for AI-assisted draft editing.
 * Accepts { messages, currentDraft, tenderTitle } and streams Claude responses via SSE.
 * After streaming completes, emits a `draft_update` event with the post-processed draft.
 */

import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { postProcessDraft } from "@/lib/drafter";

function getClient(): Anthropic {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY is not set");
  return new Anthropic({ apiKey: key });
}

const MODEL = "claude-opus-4-20250514";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ReferencedFile {
  path: string;
  title: string;
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const { messages, currentDraft, tenderTitle, referencedFiles } =
      (await request.json()) as {
        messages: ChatMessage[];
        currentDraft: string;
        tenderTitle?: string;
        referencedFiles?: ReferencedFile[];
      };

    if (!messages || !currentDraft) {
      return Response.json(
        { error: "messages and currentDraft are required" },
        { status: 400 }
      );
    }

    const client = getClient();

    // Limit conversation history to last 20 messages to stay within context
    const recentMessages = messages.slice(-20);

    // Build reference context from @-mentioned files
    let referenceContext = "";
    if (referencedFiles && referencedFiles.length > 0) {
      referenceContext =
        `\n\nThe user has referenced the following knowledge base files. Use this information to inform your edits:\n\n` +
        referencedFiles
          .map(
            (f) =>
              `<reference path="${f.path}" title="${f.title}">\n${f.content}\n</reference>`
          )
          .join("\n\n");
    }

    const systemPrompt = `You are Tendi Bot, an AI assistant helping edit a tender response draft for Meridian Intelligence GmbH.${tenderTitle ? ` The tender is: "${tenderTitle}".` : ""}

The current draft is:

<current_draft>
${currentDraft}
</current_draft>
${referenceContext}

RESPONSE FORMAT — you MUST follow this EXACTLY:

1. When the user asks you to modify the draft, structure your response as:

<explanation>
Your 1-3 sentence explanation of what you changed.
</explanation>

<updated_draft>
The COMPLETE updated draft with your changes applied.
</updated_draft>

2. When the user asks a question that does NOT require draft changes:

<explanation>
Your conversational answer.
</explanation>

3. NEVER output any text outside of these XML tags. No preamble before <explanation>, no text between the closing </explanation> and <updated_draft>, no text after </updated_draft>.

EDITING RULES:
- Always preserve the overall structure and formatting of the draft when making changes.
- Only change what the user asks for — don't rewrite sections they didn't mention.
- Keep the same markdown formatting style (headings, tables, bullet points).
- If you're unsure what the user wants, ask for clarification instead of guessing.

MERIDIAN STYLE RULES (must be maintained in all edits):
- Executive Summary: exactly 2 paragraphs — first states what Meridian proposes, second states the concrete deliverable with numbers.
- Every sentence must carry a fact, number, or specific commitment.
- Use tables for structured information (deliverables, timelines, team, pricing, classification schemes).
- Team section: table ONLY (Name | Role | Days), no prose.
- Price section: table ONLY, always ends with TOTAL (excl. VAT) row.
- NO transition sentences, concluding paragraphs, or marketing language.
- Heading hierarchy: # title, ## sections, ### subsections, #### sub-subsections.
- Use "Meridian" (not "we" or "our team") when referring to the company in technical descriptions.

CRITICAL — MARKDOWN TABLE FORMATTING:
Tables MUST be valid markdown. Every table must follow this exact pattern:
- A header row: | Col1 | Col2 | Col3 |
- A separator row immediately after: |---|---|---|
- Data rows: | val1 | val2 | val3 |
- There must be a blank line before and after every table.
- NEVER merge the separator row with the header row or omit it.
- NEVER break a table row across multiple lines — each row must be a single line.
- Work package header rows that span all columns must still have the correct number of pipe separators with empty cells.
- Copy the EXACT table structure from the current draft for any table you are not specifically asked to change.`;

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let accumulatedText = "";

        try {
          const response = client.messages.stream({
            model: MODEL,
            max_tokens: 8192,
            system: systemPrompt,
            messages: recentMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          });

          for await (const event of response) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              accumulatedText += event.delta.text;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
              );
            }
          }

          // If the response contains an updated draft, post-process and send it
          const draftMatch = accumulatedText.match(
            /<updated_draft>([\s\S]*?)<\/updated_draft>/
          );
          if (draftMatch) {
            const cleanedDraft = postProcessDraft(draftMatch[1].trim());
            controller.enqueue(
              encoder.encode(
                `event: draft_update\ndata: ${JSON.stringify({ draft: cleanedDraft })}\n\n`
              )
            );
          }

          controller.enqueue(encoder.encode(`event: done\ndata: {}\n\n`));
        } catch (err) {
          const message = err instanceof Error ? err.message : "Unknown error";
          controller.enqueue(
            encoder.encode(
              `event: error\ndata: ${JSON.stringify({ error: message })}\n\n`
            )
          );
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
