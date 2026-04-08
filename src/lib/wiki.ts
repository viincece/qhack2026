/**
 * Wiki operations: ingest, query, update.
 * Orchestrates storage + LLM calls.
 */

import * as storage from "./storage";
import * as llm from "./llm";
import { parseDocument } from "./parser";
import matter from "gray-matter";

// ── Read a wiki page with parsed frontmatter ────────────

export interface WikiPage {
  path: string;
  title: string;
  category: string;
  tags: string[];
  content: string;       // full markdown including frontmatter
  bodyContent: string;   // markdown body without frontmatter
  sourceFiles: string[];
  lastUpdated: string;
}

export async function getWikiPage(pagePath: string): Promise<WikiPage | null> {
  const raw = await storage.readWikiPage(pagePath);
  if (!raw) return null;
  return parseWikiPage(pagePath, raw);
}

function parseWikiPage(pagePath: string, raw: string): WikiPage {
  const { data, content } = matter(raw);
  return {
    path: pagePath,
    title: (data.title as string) || pagePath,
    category: (data.category as string) || "unknown",
    tags: (data.tags as string[]) || [],
    content: raw,
    bodyContent: content,
    sourceFiles: (data.source_files as string[]) || [],
    lastUpdated: (data.last_updated as string) || "unknown",
  };
}

// ── List all wiki pages with metadata ───────────────────

export async function listAllPages(): Promise<WikiPage[]> {
  const paths = await storage.listWikiPages();
  const pages: WikiPage[] = [];
  for (const p of paths) {
    const raw = await storage.readWikiPage(p);
    if (raw) {
      pages.push(parseWikiPage(p, raw));
    }
  }
  return pages;
}

// ── List pages by category ──────────────────────────────

export async function listPagesByCategory(): Promise<Record<string, WikiPage[]>> {
  const all = await listAllPages();
  const grouped: Record<string, WikiPage[]> = {};
  for (const page of all) {
    const cat = page.path.split("/")[0] || "root";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(page);
  }
  return grouped;
}

// ── Get wiki index content ──────────────────────────────

export async function getWikiIndex(): Promise<string> {
  return await storage.readWikiIndex();
}

// ── Get schema content ──────────────────────────────────

export async function getSchema(): Promise<string> {
  const raw = await storage.readWikiPage("../schema.md");
  // fallback: read from knowledge-base root
  if (raw) return raw;
  try {
    const fs = await import("fs/promises");
    const path = await import("path");
    return await fs.readFile(
      path.join(process.cwd(), "knowledge-base", "schema.md"),
      "utf-8"
    );
  } catch {
    return "No schema found.";
  }
}

// ── Ingest a new document into the wiki ─────────────────

export interface IngestResult {
  pagesCreated: string[];
  pagesUpdated: string[];
  errors: string[];
}

export async function ingestDocument(
  buffer: Buffer,
  filename: string,
  category: string = "uploads"
): Promise<IngestResult> {
  const result: IngestResult = {
    pagesCreated: [],
    pagesUpdated: [],
    errors: [],
  };

  try {
    // 1. Save raw document
    await storage.saveRawDocument(filename, buffer, category);

    // 2. Parse document to text
    const text = await parseDocument(buffer, filename);

    // 3. Get current index and schema
    const existingIndex = await storage.readWikiIndex();
    const schema = await getSchema();

    // 4. Ask LLM to generate wiki pages
    const pageUpdates = await llm.generateWikiPages(
      text,
      filename,
      existingIndex,
      schema
    );

    // 5. Write wiki pages
    for (const update of pageUpdates) {
      try {
        await storage.writeWikiPage(update.path, update.content);
        if (update.action === "create") {
          result.pagesCreated.push(update.path);
        } else {
          result.pagesUpdated.push(update.path);
        }
      } catch (err) {
        result.errors.push(`Failed to write ${update.path}: ${err}`);
      }
    }

    // 6. Update index
    if (pageUpdates.length > 0) {
      const newPages = pageUpdates.map((p) => {
        const parsed = matter(p.content);
        return { path: p.path, title: (parsed.data.title as string) || p.path };
      });
      const updatedIndex = await llm.generateUpdatedIndex(
        existingIndex,
        newPages
      );
      await storage.writeWikiPage("index.md", updatedIndex);
    }

    // 7. Log the ingest
    const date = new Date().toISOString().split("T")[0];
    const logEntry = `| ${date} | ${filename} | ingested | Created: ${result.pagesCreated.length}, Updated: ${result.pagesUpdated.length} |`;
    await storage.appendToLog(logEntry);

  } catch (err) {
    result.errors.push(`Ingest failed: ${err}`);
  }

  return result;
}

// ── Retrieve relevant content for a tender section ──────

export async function retrieveForSection(
  sectionRequirement: string,
  contentType: string
): Promise<string> {
  const index = await storage.readWikiIndex();

  // Ask LLM which pages are relevant
  const pagePaths = await llm.findRelevantPages(
    sectionRequirement,
    contentType,
    index
  );

  // Read those pages and concatenate their content
  const contents: string[] = [];
  for (const p of pagePaths) {
    const raw = await storage.readWikiPage(p);
    if (raw) {
      contents.push(`--- Source: ${p} ---\n${raw}`);
    }
  }

  return contents.join("\n\n");
}
