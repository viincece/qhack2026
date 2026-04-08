/**
 * Document parsing: PDF, Excel, Markdown, Text → plain text
 */

export async function parseDocument(
  buffer: Buffer,
  filename: string
): Promise<string> {
  const ext = filename.toLowerCase().split(".").pop();

  switch (ext) {
    case "pdf":
      return parsePDF(buffer);
    case "xlsx":
    case "xls":
      return parseExcel(buffer);
    case "md":
    case "txt":
      return buffer.toString("utf-8");
    case "docx":
      return parseDocx(buffer);
    default:
      return buffer.toString("utf-8");
  }
}

async function parsePDF(buffer: Buffer): Promise<string> {
  // pdf-parse v1 uses a default export
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse");
  const data = await pdfParse(buffer);
  return data.text;
}

async function parseExcel(buffer: Buffer): Promise<string> {
  const XLSX = await import("xlsx");
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const lines: string[] = [];

  for (const sheetName of workbook.SheetNames) {
    lines.push(`\n## Sheet: ${sheetName}\n`);
    const sheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { header: 1 });
    for (const row of json) {
      const values = Object.values(row as Record<string, unknown>).filter((v) => v != null);
      if (values.length > 0) {
        lines.push(values.join(" | "));
      }
    }
  }

  return lines.join("\n");
}

async function parseDocx(_buffer: Buffer): Promise<string> {
  // DOCX support is a nice-to-have; for now, ask users to upload PDF or text
  return "[DOCX parsing not yet supported. Please convert to PDF or paste as text.]";
}
