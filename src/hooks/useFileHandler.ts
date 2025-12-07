// src/hooks/useFileHandler.ts
import { useState, useEffect } from "react";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { open, save } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core"; // Tauri v2

export function useFileHandler() {
  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const [docContent, setDocContent] = useState<string>("");
  const [isDirty, setIsDirty] = useState(false);

  // エラーハンドリング
  const handleError = (e: unknown) => {
    console.error(e);
    alert(`Error: ${String(e)}`);
  };

  // 起動時のファイル読み込み (Rust連携)
  useEffect(() => {
    const checkStartupFile = async () => {
      try {
        const filePath = await invoke<string | null>("get_startup_file");
        if (filePath) {
          console.log("Opening startup file:", filePath);
          const content = await readTextFile(filePath);
          setCurrentPath(filePath);
          setDocContent(content);
        }
      } catch (e) {
        console.error("Failed to load startup file:", e);
      }
    };
    checkStartupFile();
  }, []);

  const openFile = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{ name: "Markdown", extensions: ["md", "txt"] }],
      });
      if (typeof selected === "string") {
        const content = await readTextFile(selected);
        setCurrentPath(selected);
        setDocContent(content);
        setIsDirty(false);
        return content;
      }
    } catch (e) {
      handleError(e);
    }
    return null;
  };

  const saveFile = async (content: string) => {
    if (currentPath) {
      try {
        await writeTextFile(currentPath, content);
        setDocContent(content);
        setIsDirty(false);
        return true;
      } catch (e) {
        handleError(e);
        return false;
      }
    } else {
      return await saveAsFile(content);
    }
  };

  const saveAsFile = async (content: string) => {
    try {
      const path = await save({
        filters: [{ name: "Markdown", extensions: ["md"] }],
        defaultPath: currentPath || "untitled.md",
      });
      if (path) {
        await writeTextFile(path, content);
        setCurrentPath(path);
        setDocContent(content);
        setIsDirty(false);
        return true;
      }
    } catch (e) {
      handleError(e);
    }
    return false;
  };

  return {
    currentPath,
    docContent,
    setDocContent,
    isDirty,
    setIsDirty,
    openFile,
    saveFile,
    saveAsFile,
  };
}
