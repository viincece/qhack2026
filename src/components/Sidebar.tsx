"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  drafts: { id: string; versions: number[]; updatedAt: string }[];
}

export default function Sidebar({ drafts }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className={`sidebar ${collapsed ? "sidebar-collapsed" : ""}`}>
      {/* Top: Logo + toggle */}
      <div className="sidebar-header">
        {!collapsed && (
          <Link href="/" className="sidebar-logo">
            TENDERIZER
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="sidebar-toggle"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {collapsed ? (
              <>
                <line x1="4" y1="5" x2="14" y2="5" />
                <line x1="4" y1="9" x2="14" y2="9" />
                <line x1="4" y1="13" x2="14" y2="13" />
              </>
            ) : (
              <>
                <line x1="4" y1="5" x2="14" y2="5" />
                <line x1="4" y1="9" x2="10" y2="9" />
                <line x1="4" y1="13" x2="14" y2="13" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Primary action */}
      <div className="sidebar-section">
        <Link
          href="/tender/new"
          className={`sidebar-item sidebar-item-primary ${isActive("/tender/new") ? "active" : ""}`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="8" y1="3" x2="8" y2="13" />
            <line x1="3" y1="8" x2="13" y2="8" />
          </svg>
          {!collapsed && <span>New Tender</span>}
        </Link>
      </div>

      <div className="sidebar-divider" />

      {/* Navigation */}
      <div className="sidebar-section">
        <Link
          href="/knowledge"
          className={`sidebar-item ${isActive("/knowledge") && !isActive("/knowledge/upload") ? "active" : ""}`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="2" width="12" height="12" rx="2" />
            <path d="M2 6h12M6 6v8" />
          </svg>
          {!collapsed && <span>Knowledge Base</span>}
        </Link>
        <Link
          href="/knowledge/upload"
          className={`sidebar-item ${isActive("/knowledge/upload") ? "active" : ""}`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8 10V3M5 5.5L8 3l3 2.5" />
            <path d="M3 10v2a1 1 0 001 1h8a1 1 0 001-1v-2" />
          </svg>
          {!collapsed && <span>Upload Document</span>}
        </Link>
      </div>

      <div className="sidebar-divider" />

      {/* Recent Drafts */}
      <div className="sidebar-drafts">
        {!collapsed && <div className="sidebar-section-label">Recent Drafts</div>}
        <div className="sidebar-section">
          {drafts.length === 0 ? (
            !collapsed && (
              <div className="sidebar-empty">No drafts yet</div>
            )
          ) : (
            drafts.map((d) => (
              <Link
                key={d.id}
                href={`/tender/${d.id}`}
                className={`sidebar-draft ${isActive(`/tender/${d.id}`) ? "active" : ""}`}
                title={d.id.replace(/_/g, " ")}
              >
                <span className="sidebar-draft-dot" />
                {!collapsed && (
                  <span className="sidebar-draft-label">
                    {d.id.replace(/_/g, " ")}
                  </span>
                )}
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Subpage links */}
      {!collapsed && (
        <div className="sidebar-section" style={{ marginTop: "auto", paddingTop: 8 }}>
          <Link href="/architecture" className="sidebar-item">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="7" width="4" height="7" rx="1" />
              <rect x="6" y="3" width="4" height="11" rx="1" />
              <rect x="11" y="1" width="4" height="13" rx="1" />
            </svg>
            <span>Architecture</span>
          </Link>
          <Link href="/pricing" className="sidebar-item">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="8" r="6.5" />
              <path d="M9.5 5.5C9.5 5.5 9 4.5 8 4.5S6 5.5 6.5 6.5 9 7.5 9.5 8.5 9 11.5 8 11.5 6.5 10.5 6.5 10.5" />
              <line x1="8" y1="3" x2="8" y2="4.5" />
              <line x1="8" y1="11.5" x2="8" y2="13" />
            </svg>
            <span>Pricing</span>
          </Link>
        </div>
      )}

      {/* Bottom */}
      <div className="sidebar-footer">
        <div className="sidebar-avatar">MI</div>
        {!collapsed && (
          <div>
            <div className="sidebar-footer-name">Meridian Intelligence</div>
            <div className="sidebar-footer-sub">Q-Hack 2026</div>
          </div>
        )}
      </div>
    </aside>
  );
}
