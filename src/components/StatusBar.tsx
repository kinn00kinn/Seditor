import React from "react";
import { DocumentStats, fileNameFromPath } from "../utils/document";

interface StatusBarProps {
  currentPath: string | null;
  isDirty: boolean;
  mode: "edit" | "preview";
  autoSaveEnabled: boolean;
  stats: DocumentStats;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  currentPath,
  isDirty,
  mode,
  autoSaveEnabled,
  stats,
}) => {
  return (
    <footer
      className="flex items-center justify-between border-t px-4 py-2 text-xs"
      style={{
        borderTopColor: "var(--toolbar-border)",
        backgroundColor: "var(--toolbar-glass)",
        color: "var(--text-muted)",
      }}
    >
      <div className="flex items-center gap-3">
        <span>{fileNameFromPath(currentPath)}</span>
        <span>{isDirty ? "Unsaved" : "Saved"}</span>
        <span>{mode === "edit" ? "Editing" : "Preview"}</span>
      </div>
      <div className="flex items-center gap-3">
        <span>{autoSaveEnabled ? "Auto save on" : "Auto save off"}</span>
        <span>{stats.lines} lines</span>
        <span>{stats.words} words</span>
        <span>{stats.characters} chars</span>
      </div>
    </footer>
  );
};
