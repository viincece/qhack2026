import type { Metadata } from "next";
import { listDrafts } from "@/lib/storage";
import Sidebar from "@/components/Sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tenderizer — Meridian Intelligence",
  description: "AI-powered tender response drafting agent",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let drafts: { id: string; versions: number[]; updatedAt: string }[] = [];
  try {
    drafts = await listDrafts();
  } catch {
    // Sidebar still renders, just no drafts
  }

  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300..700;1,9..40,300..700&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ background: "var(--warm-cream)", margin: 0, display: "flex" }}>
        <Sidebar drafts={drafts} />

        {/* Main content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
          <main style={{ flex: 1, padding: 32 }}>
            {children}
          </main>
          <footer className="clay-footer" style={{ margin: "0 24px 24px" }}>
            <span className="text-caption" style={{ color: "var(--warm-silver)" }}>
              Tenderizer Prototype — Meridian Intelligence GmbH — Q-Hack 2026
            </span>
          </footer>
        </div>
      </body>
    </html>
  );
}
