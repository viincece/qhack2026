/**
 * Storage abstraction layer.
 * Currently: local filesystem.
 * Future: swap to Supabase by implementing the same interface.
 */

import fs from "fs/promises";
import path from "path";

const KB_ROOT = path.join(process.cwd(), "knowledge-base");
const WIKI_DIR = path.join(KB_ROOT, "wiki");
const RAW_DIR = path.join(KB_ROOT, "raw");
const DRAFTS_DIR = path.join(KB_ROOT, "drafts");

// Ensure directories exist
async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

// ── Wiki Pages ──────────────────────────────────────────

export async function readWikiPage(pagePath: string): Promise<string | null> {
  try {
    const full = path.join(WIKI_DIR, pagePath.endsWith(".md") ? pagePath : pagePath + ".md");
    return await fs.readFile(full, "utf-8");
  } catch {
    return null;
  }
}

export async function writeWikiPage(pagePath: string, content: string): Promise<void> {
  const full = path.join(WIKI_DIR, pagePath.endsWith(".md") ? pagePath : pagePath + ".md");
  await ensureDir(path.dirname(full));
  await fs.writeFile(full, content, "utf-8");
}

export async function listWikiPages(prefix?: string): Promise<string[]> {
  const dir = prefix ? path.join(WIKI_DIR, prefix) : WIKI_DIR;
  try {
    return await walkDir(dir, WIKI_DIR);
  } catch {
    return [];
  }
}

async function walkDir(dir: string, root: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkDir(full, root)));
    } else if (entry.name.endsWith(".md")) {
      files.push(path.relative(root, full).replace(/\\/g, "/"));
    }
  }
  return files.sort();
}

// ── Raw Documents ───────────────────────────────────────

export async function saveRawDocument(
  filename: string,
  buffer: Buffer,
  category: string = "uploads"
): Promise<string> {
  const dir = path.join(RAW_DIR, category);
  await ensureDir(dir);
  const filePath = path.join(dir, filename);
  await fs.writeFile(filePath, buffer);
  return path.relative(KB_ROOT, filePath).replace(/\\/g, "/");
}

export async function readRawDocument(filePath: string): Promise<Buffer> {
  const full = path.join(KB_ROOT, filePath);
  return await fs.readFile(full);
}

export async function listRawDocuments(): Promise<string[]> {
  try {
    return await walkDirAll(RAW_DIR, KB_ROOT);
  } catch {
    return [];
  }
}

async function walkDirAll(dir: string, root: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    if (entry.name.startsWith(".") || entry.name.startsWith("~$")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkDirAll(full, root)));
    } else {
      files.push(path.relative(root, full).replace(/\\/g, "/"));
    }
  }
  return files.sort();
}

// ── Drafts ──────────────────────────────────────────────

export async function saveDraft(
  tenderId: string,
  content: string,
  version: number
): Promise<void> {
  const dir = path.join(DRAFTS_DIR, tenderId);
  await ensureDir(dir);
  await fs.writeFile(path.join(dir, `draft_v${version}.md`), content, "utf-8");
}

export async function saveDraftAnalysis(
  tenderId: string,
  analysis: string
): Promise<void> {
  const dir = path.join(DRAFTS_DIR, tenderId);
  await ensureDir(dir);
  await fs.writeFile(path.join(dir, "analysis.json"), analysis, "utf-8");
}

export async function readDraft(
  tenderId: string,
  version?: number
): Promise<string | null> {
  try {
    const dir = path.join(DRAFTS_DIR, tenderId);
    if (version) {
      return await fs.readFile(path.join(dir, `draft_v${version}.md`), "utf-8");
    }
    // Find latest version
    const files = await fs.readdir(dir);
    const drafts = files
      .filter((f) => f.startsWith("draft_v") && f.endsWith(".md"))
      .sort();
    if (drafts.length === 0) return null;
    return await fs.readFile(path.join(dir, drafts[drafts.length - 1]), "utf-8");
  } catch {
    return null;
  }
}

export async function readDraftAnalysis(tenderId: string): Promise<string | null> {
  try {
    return await fs.readFile(
      path.join(DRAFTS_DIR, tenderId, "analysis.json"),
      "utf-8"
    );
  } catch {
    return null;
  }
}

export async function listDrafts(): Promise<
  Array<{ id: string; versions: number[]; updatedAt: string }>
> {
  try {
    const entries = await fs.readdir(DRAFTS_DIR, { withFileTypes: true });
    const drafts = [];
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const dir = path.join(DRAFTS_DIR, entry.name);
      const files = await fs.readdir(dir);
      const versions = files
        .filter((f) => f.startsWith("draft_v") && f.endsWith(".md"))
        .map((f) => parseInt(f.replace("draft_v", "").replace(".md", "")))
        .sort();
      if (versions.length === 0) continue;
      const stat = await fs.stat(
        path.join(dir, `draft_v${versions[versions.length - 1]}.md`)
      );
      drafts.push({
        id: entry.name,
        versions,
        updatedAt: stat.mtime.toISOString(),
      });
    }
    return drafts.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  } catch {
    return [];
  }
}

// ── Wiki Index & Log ────────────────────────────────────

export async function readWikiIndex(): Promise<string> {
  return (await readWikiPage("index.md")) || "# Empty Index";
}

export async function appendToLog(entry: string): Promise<void> {
  const logPath = path.join(WIKI_DIR, "log.md");
  try {
    const existing = await fs.readFile(logPath, "utf-8");
    await fs.writeFile(logPath, existing + "\n" + entry, "utf-8");
  } catch {
    await fs.writeFile(logPath, "# Wiki Change Log\n\n" + entry, "utf-8");
  }
}
