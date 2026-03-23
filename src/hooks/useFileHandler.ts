import { useCallback, useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { addRecentFile, normalizeRecentFiles } from "../utils/document";

const RECENT_FILES_KEY = "seditor:recentFiles";
const AUTOSAVE_KEY = "seditor:autoSave";

function readRecentFilesFromStorage(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_FILES_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? normalizeRecentFiles(parsed) : [];
  } catch {
    return [];
  }
}

export function useFileHandler() {
  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const [docContent, setDocContent] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [recentFiles, setRecentFiles] = useState<string[]>(() =>
    readRecentFilesFromStorage()
  );
  const lastSavedContentRef = useRef("");

  const handleError = useCallback((error: unknown) => {
    console.error(error);
    alert(`Error: ${String(error)}`);
  }, []);

  const pushRecentFile = useCallback((path: string) => {
    setRecentFiles((previous) => {
      const next = addRecentFile(previous, path);
      localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const syncLoadedDocument = useCallback(
    (path: string, content: string) => {
      setCurrentPath(path);
      setDocContent(content);
      setIsDirty(false);
      lastSavedContentRef.current = content;
      pushRecentFile(path);
    },
    [pushRecentFile]
  );

  const confirmDiscardIfNeeded = useCallback(() => {
    if (!isDirty) {
      return true;
    }

    return window.confirm(
      "保存していない変更があります。破棄して続行しますか？"
    );
  }, [isDirty]);

  const openSpecificFile = useCallback(
    async (path: string, options?: { skipDirtyCheck?: boolean }) => {
      if (!options?.skipDirtyCheck && !confirmDiscardIfNeeded()) {
        return null;
      }

      try {
        const content = await readTextFile(path);
        syncLoadedDocument(path, content);
        return content;
      } catch (error) {
        handleError(error);
        return null;
      }
    },
    [confirmDiscardIfNeeded, handleError, syncLoadedDocument]
  );

  useEffect(() => {
    const checkStartupFile = async () => {
      try {
        const filePath = await invoke<string | null>("get_startup_file");
        if (filePath) {
          await openSpecificFile(filePath, { skipDirtyCheck: true });
        }
      } catch (error) {
        console.error("Failed to load startup file:", error);
      }
    };

    void checkStartupFile();
  }, [openSpecificFile]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const openFile = useCallback(async () => {
    if (!confirmDiscardIfNeeded()) {
      return null;
    }

    try {
      const selected = await open({
        multiple: false,
        filters: [{ name: "Markdown", extensions: ["md", "markdown", "txt"] }],
      });

      if (typeof selected === "string") {
        return await openSpecificFile(selected, { skipDirtyCheck: true });
      }
    } catch (error) {
      handleError(error);
    }

    return null;
  }, [confirmDiscardIfNeeded, handleError, openSpecificFile]);

  const saveAsFile = useCallback(
    async (content: string) => {
      try {
        const path = await save({
          filters: [{ name: "Markdown", extensions: ["md"] }],
          defaultPath: currentPath || "untitled.md",
        });

        if (!path) {
          return false;
        }

        await writeTextFile(path, content);
        syncLoadedDocument(path, content);
        return true;
      } catch (error) {
        handleError(error);
        return false;
      }
    },
    [currentPath, handleError, syncLoadedDocument]
  );

  const saveFile = useCallback(
    async (content: string) => {
      if (!currentPath) {
        return saveAsFile(content);
      }

      try {
        await writeTextFile(currentPath, content);
        setDocContent(content);
        setIsDirty(false);
        lastSavedContentRef.current = content;
        pushRecentFile(currentPath);
        return true;
      } catch (error) {
        handleError(error);
        return false;
      }
    },
    [currentPath, handleError, pushRecentFile, saveAsFile]
  );

  const reloadFromDisk = useCallback(async () => {
    if (!currentPath) {
      return null;
    }

    if (!confirmDiscardIfNeeded()) {
      return null;
    }

    return openSpecificFile(currentPath, { skipDirtyCheck: true });
  }, [confirmDiscardIfNeeded, currentPath, openSpecificFile]);

  useEffect(() => {
    if (!currentPath || !isDirty) {
      return;
    }

    if (localStorage.getItem(AUTOSAVE_KEY) !== "true") {
      return;
    }

    const timer = window.setTimeout(() => {
      if (docContent !== lastSavedContentRef.current) {
        void saveFile(docContent);
      }
    }, 800);

    return () => window.clearTimeout(timer);
  }, [currentPath, docContent, isDirty, saveFile]);

  return {
    currentPath,
    docContent,
    setDocContent,
    isDirty,
    setIsDirty,
    recentFiles,
    openFile,
    openSpecificFile,
    reloadFromDisk,
    saveFile,
    saveAsFile,
  };
}
