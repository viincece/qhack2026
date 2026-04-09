# TENDERIZER

**AI-powered tender response drafting agent for EU institutional procurement.**

Built by [Meridian Intelligence GmbH](https://github.com/viincece) at Q-Hack 2026.

---

## What it does

Tenderizer takes a tender PDF, analyzes its requirements, retrieves relevant company knowledge, and generates a complete, structured draft response — ready for review and export. The entire pipeline runs in under 2 minutes.

### Key Features

- **Tender Analysis** — Upload a PDF and the AI extracts sections, requirements, evaluation criteria, and metadata
- **Fit Check** — Automatically scores how well a tender matches the company's expertise (0-100). Poor-fit tenders are flagged before wasting drafting resources
- **Knowledge Base** — Structured wiki built from uploaded company documents (CVs, project sheets, certifications). The AI auto-categorizes and cross-references everything
- **Single-Pass Drafting** — Generates the complete response in one LLM call using all retrieved knowledge + ranked past tender references for style consistency
- **Tendi Bot** — Chat sidebar with SSE streaming for iterative editing. Supports @-mentions to pull specific knowledge base files into context
- **Export** — Download as `.md` or `.docx` with professional formatting (headers, footers, page numbers)
- **Draft Versioning** — Every edit creates a new version on disk

---

## Architecture

```
Upload PDF ──> Analyze ──> Retrieve KB ──> Generate ──> Post-Process ──> View & Edit
                 │                             │              │
                 │                        Past tender    Deterministic
              Fit check               style references   table repair
```

| Layer | Details |
|---|---|
| **Frontend** | Next.js 16, React 19, Clay Design System |
| **AI Engine** | Claude Opus 4 (Anthropic SDK), SSE streaming |
| **Knowledge Base** | Markdown wiki with YAML frontmatter, similarity-ranked references |
| **Export** | `docx` package with dynamic imports, markdown downloads |
| **Storage** | Filesystem-based (drafts, wiki, raw documents) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/)

### Setup

```bash
# Clone the repository
git clone https://github.com/viincece/qhack2026.git
cd qhack2026

# Install dependencies
npm install

# Add your API key
echo "ANTHROPIC_API_KEY=your-key-here" > .env.local

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the app.

### Usage

1. **Upload company documents** via the Knowledge Base upload page — CVs, project references, certifications
2. **Upload a tender PDF** via "New Tender" — the AI analyzes it and checks fit
3. **Review the generated draft** — use Preview/Edit mode, fix any `[NEEDS INPUT]` gaps
4. **Iterate with Tendi Bot** — ask the chat assistant to refine specific sections
5. **Export** — download as `.md` or `.docx`

---

## Project Structure

```
src/
  app/
    api/
      analyze/        POST — tender analysis + draft generation (SSE)
      chat/           POST — Tendi Bot streaming chat
      drafts/         GET/PUT — draft CRUD
      docx/           POST — markdown-to-DOCX conversion
      knowledge/      GET/POST — knowledge base management
    tender/[id]/      Draft viewer/editor page
    knowledge/        Knowledge base browser + upload
    architecture/     System architecture diagram
    pricing/          SaaS pricing tiers
    roadmap/          Product roadmap
  components/
    Sidebar.tsx       Collapsible navigation
    ChatSidebar.tsx   Tendi Bot chat panel
  lib/
    llm.ts            All Claude API calls (analyze, draft, retrieve, ingest)
    drafter.ts        Draft generation pipeline orchestrator
    wiki.ts           Knowledge base retrieval
    storage.ts        Filesystem storage layer
    parser.ts         PDF/DOCX document parsing

knowledge-base/
  wiki/               Structured markdown pages with YAML frontmatter
  references/         Past tender responses (style templates)
  raw/                Uploaded source documents
  drafts/             Generated draft versions
  schema.md           Wiki structure and naming conventions
```

---

## Tech Stack

| Technology | Purpose |
|---|---|
| [Next.js 16](https://nextjs.org/) | App framework (App Router, Server Actions) |
| [React 19](https://react.dev/) | UI rendering |
| [Claude Opus 4](https://docs.anthropic.com/) | Tender analysis, drafting, knowledge ingestion |
| [Anthropic SDK](https://www.npmjs.com/package/@anthropic-ai/sdk) | API client with streaming |
| [docx](https://www.npmjs.com/package/docx) | Word document generation |
| [pdf-parse](https://www.npmjs.com/package/pdf-parse) | PDF text extraction |
| [react-markdown](https://www.npmjs.com/package/react-markdown) | Markdown preview rendering |
| [gray-matter](https://www.npmjs.com/package/gray-matter) | YAML frontmatter parsing |

---

## License

Built for Q-Hack 2026. All rights reserved by Meridian Intelligence GmbH.
