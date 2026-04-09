"use client";

import { useEffect, useRef } from "react";

export interface MentionItem {
  path: string;
  title: string;
  category: string;
}

interface MentionAutocompleteProps {
  items: MentionItem[];
  selectedIndex: number;
  onSelect: (item: MentionItem) => void;
  visible: boolean;
}

const categoryLabels: Record<string, string> = {
  company: "Company",
  team: "Team",
  projects: "Projects",
  methodology: "Methodology",
  past_responses: "Past Responses",
  boilerplate: "Boilerplate",
};

export default function MentionAutocomplete({
  items,
  selectedIndex,
  onSelect,
  visible,
}: MentionAutocompleteProps) {
  const selectedRef = useRef<HTMLDivElement>(null);

  // Scroll selected item into view
  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  if (!visible || items.length === 0) return null;

  // Group items by category
  const grouped: Record<string, MentionItem[]> = {};
  for (const item of items) {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  }

  let globalIndex = 0;

  return (
    <div className="mention-dropdown">
      {Object.entries(grouped).map(([cat, catItems]) => (
        <div key={cat}>
          <div className="mention-category-header">
            {categoryLabels[cat] || cat}
          </div>
          {catItems.map((item) => {
            const thisIndex = globalIndex++;
            const isSelected = thisIndex === selectedIndex;
            return (
              <div
                key={item.path}
                ref={isSelected ? selectedRef : null}
                className={`mention-item ${isSelected ? "selected" : ""}`}
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent textarea blur
                  onSelect(item);
                }}
              >
                <div className="mention-item-title">{item.title}</div>
                <div className="mention-item-path">{item.path}</div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
