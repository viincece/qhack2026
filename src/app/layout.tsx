import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tender Agent — Meridian Intelligence",
  description: "AI-powered tender response drafting agent",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {/* Navigation */}
        <nav className="bg-white border-b border-[var(--border)] px-6 py-3 flex items-center gap-8">
          <Link href="/" className="font-bold text-lg text-[var(--primary)]">
            Tender Agent
          </Link>
          <div className="flex gap-6 text-sm">
            <Link
              href="/tender/new"
              className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              New Tender
            </Link>
            <Link
              href="/knowledge"
              className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              Knowledge Base
            </Link>
            <Link
              href="/knowledge/upload"
              className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              Upload Document
            </Link>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6 max-w-6xl mx-auto w-full">{children}</main>

        {/* Footer */}
        <footer className="border-t border-[var(--border)] px-6 py-3 text-center text-xs text-[var(--muted)]">
          Tender Agent Prototype — Meridian Intelligence GmbH — Q-Hack 2026
        </footer>
      </body>
    </html>
  );
}
