/**
 * POST /api/docx
 * Converts a markdown draft to a .docx file.
 * Body: { content: string, filename?: string }
 * Returns: application/vnd.openxmlformats-officedocument.wordprocessingml.document
 *
 * The `docx` package is dynamically imported to avoid loading 6MB+ at dev startup.
 */

import { NextRequest, NextResponse } from "next/server";

// ── Markdown parser helpers ──────────────────────────

interface ParsedBlock {
  type: "heading" | "paragraph" | "table" | "bullet" | "blank";
  level?: number;
  text?: string;
  rows?: string[][];
  items?: string[];
}

function parseMarkdown(md: string): ParsedBlock[] {
  const lines = md.split("\n");
  const blocks: ParsedBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === "") { i++; continue; }

    const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      blocks.push({ type: "heading", level: headingMatch[1].length, text: headingMatch[2] });
      i++; continue;
    }

    const boldMatch = trimmed.match(/^\*\*(.+)\*\*$/);
    if (boldMatch && !trimmed.startsWith("|")) {
      blocks.push({ type: "paragraph", text: trimmed });
      i++; continue;
    }

    if (trimmed.startsWith("|")) {
      const tableRows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        const row = lines[i].trim();
        if (/^\|[\s\-:|]+\|$/.test(row)) { i++; continue; }
        const cells = row.split("|").slice(1, -1).map((c) => c.trim());
        tableRows.push(cells);
        i++;
      }
      if (tableRows.length > 0) blocks.push({ type: "table", rows: tableRows });
      continue;
    }

    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const items: string[] = [];
      while (i < lines.length && (lines[i].trim().startsWith("- ") || lines[i].trim().startsWith("* "))) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ""));
        i++;
      }
      blocks.push({ type: "bullet", items });
      continue;
    }

    let paraText = trimmed;
    i++;
    while (
      i < lines.length && lines[i].trim() !== "" &&
      !lines[i].trim().startsWith("#") && !lines[i].trim().startsWith("|") &&
      !lines[i].trim().startsWith("- ") && !lines[i].trim().startsWith("* ")
    ) {
      paraText += " " + lines[i].trim();
      i++;
    }
    blocks.push({ type: "paragraph", text: paraText });
  }

  return blocks;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function buildDocx(blocks: ParsedBlock[]): Promise<any> {
  const docx = await import("docx");
  const {
    Document, Paragraph, TextRun, Table, TableRow, TableCell,
    HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
    LevelFormat, Header, Footer, PageNumber,
  } = docx;

  // ── Inline formatting parser ──
  function parseInlineRuns(text: string) {
    const runs: InstanceType<typeof TextRun>[] = [];
    const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(\[NEEDS INPUT:[^\]]*\])/g;
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex)
        runs.push(new TextRun({ text: text.slice(lastIndex, match.index), font: "Arial", size: 22 }));
      if (match[1]) runs.push(new TextRun({ text: match[2], bold: true, font: "Arial", size: 22 }));
      else if (match[3]) runs.push(new TextRun({ text: match[4], italics: true, font: "Arial", size: 22 }));
      else if (match[5]) runs.push(new TextRun({ text: match[5], bold: true, color: "E07020", font: "Arial", size: 22 }));
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length)
      runs.push(new TextRun({ text: text.slice(lastIndex), font: "Arial", size: 22 }));
    if (runs.length === 0)
      runs.push(new TextRun({ text, font: "Arial", size: 22 }));
    return runs;
  }

  const children: (InstanceType<typeof Paragraph> | InstanceType<typeof Table>)[] = [];
  const border = { style: BorderStyle.SINGLE, size: 1, color: "BBBBBB" };
  const borders = { top: border, bottom: border, left: border, right: border };

  const headingMap: Record<number, (typeof HeadingLevel)[keyof typeof HeadingLevel]> = {
    1: HeadingLevel.HEADING_1, 2: HeadingLevel.HEADING_2,
    3: HeadingLevel.HEADING_3, 4: HeadingLevel.HEADING_4,
  };

  for (const block of blocks) {
    switch (block.type) {
      case "heading":
        children.push(new Paragraph({
          heading: headingMap[block.level || 2],
          children: [new TextRun({ text: block.text || "", font: "Arial" })],
        }));
        break;
      case "paragraph":
        children.push(new Paragraph({ spacing: { after: 120 }, children: parseInlineRuns(block.text || "") }));
        break;
      case "bullet":
        for (const item of block.items || []) {
          children.push(new Paragraph({
            numbering: { reference: "bullets", level: 0 },
            spacing: { after: 60 },
            children: parseInlineRuns(item),
          }));
        }
        break;
      case "table": {
        const rows = block.rows || [];
        if (rows.length === 0) break;
        const colCount = Math.max(...rows.map((r) => r.length));
        const tableWidth = 9026;
        const colWidth = Math.floor(tableWidth / colCount);
        const tableRows = rows.map((row, rowIdx) => {
          const cells = [];
          for (let c = 0; c < colCount; c++) {
            const cellText = row[c] || "";
            const isHeader = rowIdx === 0;
            cells.push(new TableCell({
              borders,
              width: { size: colWidth, type: WidthType.DXA },
              shading: isHeader ? { fill: "E8DDD0", type: ShadingType.CLEAR } : undefined,
              margins: { top: 60, bottom: 60, left: 100, right: 100 },
              children: [new Paragraph({
                children: [new TextRun({ text: cellText, bold: isHeader, font: "Arial", size: 20 })],
              })],
            }));
          }
          return new TableRow({ children: cells });
        });
        children.push(new Table({
          width: { size: tableWidth, type: WidthType.DXA },
          columnWidths: Array(colCount).fill(colWidth),
          rows: tableRows,
        }));
        children.push(new Paragraph({ spacing: { after: 120 }, children: [] }));
        break;
      }
    }
  }

  return new Document({
    styles: {
      default: { document: { run: { font: "Arial", size: 22 } } },
      paragraphStyles: [
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 36, bold: true, font: "Arial", color: "2C2C2C" },
          paragraph: { spacing: { before: 240, after: 200 }, outlineLevel: 0 } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 28, bold: true, font: "Arial", color: "2C2C2C" },
          paragraph: { spacing: { before: 200, after: 160 }, outlineLevel: 1 } },
        { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 24, bold: true, font: "Arial", color: "2C2C2C" },
          paragraph: { spacing: { before: 160, after: 120 }, outlineLevel: 2 } },
        { id: "Heading4", name: "Heading 4", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 22, bold: true, italics: true, font: "Arial", color: "2C2C2C" },
          paragraph: { spacing: { before: 120, after: 100 }, outlineLevel: 3 } },
      ],
    },
    numbering: {
      config: [{
        reference: "bullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      }],
    },
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: "Meridian Intelligence GmbH \u2014 Confidential", font: "Arial", size: 16, color: "999999", italics: true })],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "Page ", font: "Arial", size: 16, color: "999999" }),
              new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 16, color: "999999" }),
            ],
          })],
        }),
      },
      children,
    }],
  });
}

// ── Route handler ──────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { content, filename } = await req.json();
    if (!content) {
      return NextResponse.json({ error: "No content provided" }, { status: 400 });
    }

    const blocks = parseMarkdown(content);
    const doc = await buildDocx(blocks);
    const { Packer } = await import("docx");
    const buffer = await Packer.toBuffer(doc);

    const name = filename || "tender_draft.docx";
    const uint8 = new Uint8Array(buffer);
    return new NextResponse(uint8, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${name}"`,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
