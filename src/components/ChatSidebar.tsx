"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import MentionAutocomplete, { MentionItem } from "./MentionAutocomplete";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  displayContent?: string;
}

interface ChatSidebarProps {
  currentDraft: string;
  tenderTitle?: string;
  onDraftUpdate: (newDraft: string) => void;
  onClose: () => void;
  onEditingStateChange?: (isEditing: boolean) => void;
}

/* ── Explanation tag extraction ──────────────────────── */

function extractExplanation(text: string): string {
  const completeMatch = text.match(/<explanation>([\s\S]*?)<\/explanation>/);
  if (completeMatch) return completeMatch[1].trim();
  const partialMatch = text.match(/<explanation>([\s\S]*)$/);
  if (partialMatch) return partialMatch[1].trim();
  return "";
}

function parseAssistantMessage(fullText: string): {
  displayText: string;
  updatedDraft: string | null;
} {
  const draftMatch = fullText.match(/<updated_draft>([\s\S]*?)<\/updated_draft>/);
  const explanationMatch = fullText.match(/<explanation>([\s\S]*?)<\/explanation>/);
  const updatedDraft = draftMatch ? draftMatch[1].trim() : null;
  const displayText = explanationMatch
    ? explanationMatch[1].trim()
    : fullText
        .replace(/<updated_draft>[\s\S]*?<\/updated_draft>/, "")
        .replace(/<\/?explanation>/g, "")
        .trim();
  return { displayText: displayText || "Draft updated.", updatedDraft };
}

/* ── Render @mentions as styled tags ─────────────────── */

function renderWithMentions(text: string): React.ReactNode {
  const parts = text.split(/(@[\w-]+\/[\w-]+)/g);
  return parts.map((part, i) =>
    part.startsWith("@") ? (
      <span key={i} className="mention-tag">
        {part}
      </span>
    ) : (
      part
    )
  );
}

/* ── @-mention trigger detection ─────────────────────── */

function getMentionContext(
  text: string,
  cursorPos: number
): { active: boolean; filter: string; startPos: number } {
  // Scan backward from cursor to find @ preceded by start-of-string or whitespace
  let i = cursorPos - 1;
  while (i >= 0 && text[i] !== "@" && text[i] !== " " && text[i] !== "\n") {
    i--;
  }
  if (i >= 0 && text[i] === "@" && (i === 0 || /[\s]/.test(text[i - 1]))) {
    const filter = text.slice(i + 1, cursorPos);
    return { active: true, filter, startPos: i };
  }
  return { active: false, filter: "", startPos: 0 };
}

/* ── Component ───────────────────────────────────────── */

export default function ChatSidebar({
  currentDraft,
  tenderTitle,
  onDraftUpdate,
  onClose,
  onEditingStateChange,
}: ChatSidebarProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isWritingDraft, setIsWritingDraft] = useState(false);
  const [draftApplied, setDraftApplied] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // @-mention state
  const [mentionPages, setMentionPages] = useState<MentionItem[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState("");
  const [mentionIndex, setMentionIndex] = useState(0);
  const [mentionStartPos, setMentionStartPos] = useState(0);

  // Fetch available wiki pages for autocomplete on mount
  useEffect(() => {
    fetch("/api/wiki/mentions")
      .then((res) => res.json())
      .then((data: MentionItem[]) => setMentionPages(data))
      .catch(() => {});
  }, []);

  const filteredMentions = useMemo(() => {
    if (!mentionFilter) return mentionPages;
    const lower = mentionFilter.toLowerCase();
    return mentionPages.filter(
      (p) =>
        p.title.toLowerCase().includes(lower) ||
        p.path.toLowerCase().includes(lower) ||
        p.category.toLowerCase().includes(lower)
    );
  }, [mentionPages, mentionFilter]);

  // Reset selection index when filter changes
  useEffect(() => {
    setMentionIndex(0);
  }, [mentionFilter]);

  const scrollToBottom = useCallback(() => {
    const container = messagesContainerRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (draftApplied) {
      const timer = setTimeout(() => setDraftApplied(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [draftApplied]);

  /* ── Input handling with @-mention detection ─────── */

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      const cursorPos = e.target.selectionStart;
      setInput(value);

      const ctx = getMentionContext(value, cursorPos);
      if (ctx.active) {
        setShowMentions(true);
        setMentionFilter(ctx.filter);
        setMentionStartPos(ctx.startPos);
      } else {
        setShowMentions(false);
      }
    },
    []
  );

  const handleMentionSelect = useCallback(
    (item: MentionItem) => {
      const before = input.slice(0, mentionStartPos);
      const after = input.slice(
        mentionStartPos + 1 + mentionFilter.length // +1 for the @
      );
      const newInput = `${before}@${item.path} ${after}`;
      setInput(newInput);
      setShowMentions(false);

      // Restore cursor position after the inserted mention
      const newCursorPos = before.length + 1 + item.path.length + 1;
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.setSelectionRange(newCursorPos, newCursorPos);
      });
    },
    [input, mentionStartPos, mentionFilter]
  );

  /* ── Resolve @mentions to file content before sending ── */

  const resolveMentions = async (
    text: string
  ): Promise<Array<{ path: string; title: string; content: string }>> => {
    const mentionRegex = /@([\w-]+\/[\w-]+)/g;
    const matches = [...text.matchAll(mentionRegex)];
    if (matches.length === 0) return [];

    const files: Array<{ path: string; title: string; content: string }> = [];
    const seen = new Set<string>();

    for (const match of matches) {
      const path = match[1];
      if (seen.has(path)) continue;
      seen.add(path);

      // Verify it's a known page
      const page = mentionPages.find((p) => p.path === path);
      if (!page) continue;

      try {
        const res = await fetch(`/api/wiki?path=${encodeURIComponent(path)}`);
        if (!res.ok) continue;
        const data = await res.json();
        files.push({
          path: page.path,
          title: page.title,
          content: data.bodyContent || data.content || "",
        });
      } catch {
        // Skip unresolvable mentions
      }
    }

    return files;
  };

  /* ── Send message ───────────────────────────────────── */

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    setShowMentions(false);

    // Resolve @mentions before sending
    const referencedFiles = await resolveMentions(text);

    const userMessage: ChatMessage = { role: "user", content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsStreaming(true);
    setIsWritingDraft(false);
    setDraftApplied(false);
    onEditingStateChange?.(true);

    const assistantMessage: ChatMessage = { role: "assistant", content: "" };
    setMessages([...newMessages, assistantMessage]);

    let cleanedDraftFromServer: string | null = null;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          currentDraft,
          tenderTitle,
          referencedFiles:
            referencedFiles.length > 0 ? referencedFiles : undefined,
        }),
      });

      if (!res.body) throw new Error("No response stream");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        let currentEvent = "";
        for (const line of lines) {
          if (line.startsWith("event: ")) {
            currentEvent = line.slice(7);
          } else if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6));

            if (currentEvent === "error") {
              throw new Error(data.error);
            } else if (currentEvent === "draft_update") {
              cleanedDraftFromServer = data.draft;
              currentEvent = "";
              continue;
            } else if (currentEvent === "done") {
              // Stream finished
            } else if (data.text) {
              fullText += data.text;
              const isDraftPhase =
                fullText.includes("<updated_draft>") &&
                !fullText.includes("</updated_draft>");
              setIsWritingDraft(isDraftPhase);

              const liveDisplay = extractExplanation(fullText);
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: fullText,
                  displayContent: liveDisplay || undefined,
                };
                return updated;
              });
            }
            currentEvent = "";
          }
        }
      }

      const { displayText, updatedDraft } = parseAssistantMessage(fullText);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: fullText,
          displayContent: displayText,
        };
        return updated;
      });

      setIsWritingDraft(false);

      if (cleanedDraftFromServer) {
        onDraftUpdate(cleanedDraftFromServer);
        setDraftApplied(true);
      } else if (updatedDraft) {
        onDraftUpdate(updatedDraft);
        setDraftApplied(true);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: `Error: ${errorMsg}`,
        };
        return updated;
      });
      setIsWritingDraft(false);
    }

    setIsStreaming(false);
    onEditingStateChange?.(false);
  };

  /* ── Keyboard handling ──────────────────────────────── */

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showMentions && filteredMentions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setMentionIndex((prev) =>
          prev < filteredMentions.length - 1 ? prev + 1 : 0
        );
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setMentionIndex((prev) =>
          prev > 0 ? prev - 1 : filteredMentions.length - 1
        );
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        handleMentionSelect(filteredMentions[mentionIndex]);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setShowMentions(false);
        return;
      }
    }

    // Default: Enter sends message
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  /* ── Render ─────────────────────────────────────────── */

  return (
    <div className="chat-sidebar">
      {/* Header */}
      <div className="chat-header">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 10,
              background: "var(--ube-900)",
              color: "var(--clay-white)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            AI
          </div>
          <span className="heading-feature" style={{ fontSize: "0.9rem" }}>
            Tendi Bot
          </span>
        </div>
        <button onClick={onClose} className="chat-close-btn" title="Close chat">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="4" y1="4" x2="12" y2="12" />
            <line x1="12" y1="4" x2="4" y2="12" />
          </svg>
        </button>
      </div>

      {/* Status banner */}
      {(isStreaming || draftApplied) && (
        <div
          className={`chat-status-banner ${draftApplied ? "chat-status-success" : isWritingDraft ? "chat-status-editing" : "chat-status-thinking"}`}
        >
          {draftApplied ? (
            <>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7.5L5.5 10L11 4" />
              </svg>
              <span>Draft updated</span>
            </>
          ) : isWritingDraft ? (
            <>
              <span className="clay-spinner" style={{ width: 12, height: 12 }} />
              <span>Editing draft...</span>
            </>
          ) : (
            <>
              <span className="clay-spinner" style={{ width: 12, height: 12 }} />
              <span>Thinking...</span>
            </>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="chat-messages" ref={messagesContainerRef}>
        {messages.length === 0 && (
          <div className="chat-empty">
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                background: "var(--oat-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px",
                fontSize: 20,
                color: "var(--warm-charcoal)",
              }}
            >
              AI
            </div>
            <div className="text-body-standard" style={{ color: "var(--warm-charcoal)", marginBottom: 8 }}>
              Ask me to edit the draft
            </div>
            <div className="text-caption" style={{ color: "var(--warm-silver)" }}>
              Type <span className="mention-tag" style={{ fontSize: 11 }}>@</span> to reference knowledge base files
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`chat-message ${msg.role === "user" ? "chat-message-user" : "chat-message-assistant"}`}
          >
            <div className="chat-message-bubble">
              {msg.role === "user" ? (
                renderWithMentions(msg.content)
              ) : (
                msg.displayContent || msg.content || (
                  <span style={{ color: "var(--warm-silver)" }}>
                    <span className="clay-spinner" style={{ width: 12, height: 12, marginRight: 6 }} />
                    Thinking...
                  </span>
                )
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input area with mention autocomplete */}
      <div className="chat-input-area" style={{ position: "relative" }}>
        {/* Mention autocomplete dropdown (opens upward) */}
        <MentionAutocomplete
          items={filteredMentions}
          selectedIndex={mentionIndex}
          onSelect={handleMentionSelect}
          visible={showMentions}
        />

        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={
              isStreaming
                ? "Waiting for response..."
                : "Ask to edit... type @ for KB files"
            }
            disabled={isStreaming}
            className="chat-input"
            rows={2}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isStreaming}
            className="chat-send-btn"
            title="Send message"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2L7 9" />
              <path d="M14 2L9.5 14L7 9L2 6.5L14 2Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
