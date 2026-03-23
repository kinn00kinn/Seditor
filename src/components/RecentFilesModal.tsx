import React from "react";
import { Modal } from "./ui/Modal";
import { fileNameFromPath } from "../utils/document";

interface RecentFilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  recentFiles: string[];
  onOpen: (path: string) => void;
}

export const RecentFilesModal: React.FC<RecentFilesModalProps> = ({
  isOpen,
  onClose,
  recentFiles,
  onOpen,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Recent Files">
      {recentFiles.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          最近開いたファイルはありません。
        </p>
      ) : (
        <div className="space-y-2">
          {recentFiles.map((path) => (
            <button
              key={path}
              type="button"
              className="w-full rounded-none border px-3 py-2 text-left transition-colors"
              style={{
                borderColor: "var(--background-modifier-border)",
                color: "var(--text-normal)",
              }}
              onClick={() => {
                onOpen(path);
                onClose();
              }}
            >
              <div className="text-sm font-medium">{fileNameFromPath(path)}</div>
              <div className="truncate text-xs" style={{ color: "var(--text-faint)" }}>
                {path}
              </div>
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
};
