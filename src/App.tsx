import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EditorView } from "@codemirror/view";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaArrowDown,
  FaArrowUp,
  FaCode,
  FaCog,
  FaEye,
  FaFolderOpen,
  FaHistory,
  FaPrint,
  FaQuestionCircle,
  FaRedo,
  FaRegSave,
  FaSave,
} from "react-icons/fa";
import { Editor } from "./components/editor/Editor";
import { Layout } from "./components/layout/Layout";
import { Preview } from "./components/preview/Preview";
import { RecentFilesModal } from "./components/RecentFilesModal";
import { SettingsPanel } from "./components/SettingsPanel";
import { StatusBar } from "./components/StatusBar";
import { HelpModal } from "./components/HelpModal";
import { Button } from "./components/ui/Button";
import { Toolbar, ToolbarDivider, ToolbarGroup } from "./components/ui/Toolbar";
import { useFileHandler } from "./hooks/useFileHandler";
import { useShortcuts } from "./hooks/useShortcuts";
import { moveLine } from "./utils/editorUtils";
import { buildDocumentStats, fileNameFromPath } from "./utils/document";
import "./App.css";

function App() {
  const viewRef = useRef<EditorView | null>(null);
  const {
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
  } = useFileHandler();

  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showRecentFiles, setShowRecentFiles] = useState(false);
  const [lineWrapEnabled, setLineWrapEnabled] = useState(
    localStorage.getItem("seditor:lineWrap") === "true"
  );
  const [overflowFoldEnabled, setOverflowFoldEnabled] = useState(
    localStorage.getItem("seditor:overflowFold") === "true"
  );
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(
    localStorage.getItem("seditor:autoSave") === "true"
  );

  const handleEditorInit = useCallback((view: EditorView) => {
    viewRef.current = view;
  }, []);

  const getCurrentContent = useCallback(() => {
    return viewRef.current ? viewRef.current.state.doc.toString() : docContent;
  }, [docContent]);

  const performToggle = useCallback(() => {
    setDocContent(getCurrentContent());
    setMode((previous) => (previous === "edit" ? "preview" : "edit"));
  }, [getCurrentContent, setDocContent]);

  const performSave = useCallback(async () => {
    await saveFile(getCurrentContent());
  }, [getCurrentContent, saveFile]);

  const performSaveAs = useCallback(async () => {
    await saveAsFile(getCurrentContent());
  }, [getCurrentContent, saveAsFile]);

  const performOpen = useCallback(async () => {
    const content = await openFile();
    if (content !== null) {
      setMode("edit");
    }
  }, [openFile]);

  const performReload = useCallback(async () => {
    const content = await reloadFromDisk();
    if (content !== null) {
      setMode("edit");
    }
  }, [reloadFromDisk]);

  const handleOpenRecentFile = useCallback(
    async (path: string) => {
      const content = await openSpecificFile(path);
      if (content !== null) {
        setMode("edit");
      }
    },
    [openSpecificFile]
  );

  const handleMoveLine = useCallback((dir: "up" | "down") => {
    if (!viewRef.current) {
      return;
    }

    moveLine(viewRef.current, dir);
  }, []);

  const shortcutActions = useMemo(
    () => ({
      save: performSave,
      saveAs: performSaveAs,
      open: performOpen,
      toggleMode: performToggle,
      print: () => window.print(),
    }),
    [performOpen, performSave, performSaveAs, performToggle]
  );

  const stats = useMemo(() => buildDocumentStats(docContent), [docContent]);

  useShortcuts(shortcutActions);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent).detail as
        | { lineWrap?: boolean; overflowFold?: boolean; autoSave?: boolean }
        | undefined;

      if (detail?.lineWrap !== undefined) {
        setLineWrapEnabled(Boolean(detail.lineWrap));
      }

      if (detail?.overflowFold !== undefined) {
        setOverflowFoldEnabled(Boolean(detail.overflowFold));
      }

      if (detail?.autoSave !== undefined) {
        setAutoSaveEnabled(Boolean(detail.autoSave));
      }
    };

    window.addEventListener("seditor:settingsChanged", handler as EventListener);
    return () =>
      window.removeEventListener(
        "seditor:settingsChanged",
        handler as EventListener
      );
  }, []);

  return (
    <>
      <Layout
        header={
          <Toolbar>
            <ToolbarGroup>
              <Button
                onClick={performOpen}
                tooltip="Open (Ctrl+O)"
                icon={<FaFolderOpen />}
              />
              <Button
                onClick={() => setShowRecentFiles(true)}
                tooltip="Recent files"
                icon={<FaHistory />}
              />
              <Button
                onClick={performReload}
                tooltip="Reload from disk"
                icon={<FaRedo />}
                disabled={!currentPath}
              />
              <Button
                onClick={performSave}
                tooltip="Save (Ctrl+S)"
                icon={<FaSave />}
                className={isDirty ? "!text-red-600" : ""}
              />
              <Button
                onClick={performSaveAs}
                tooltip="Save As (Ctrl+Shift+S)"
                icon={<FaRegSave />}
              />
              <div
                className="ml-2 select-none text-sm font-medium"
                style={{ color: "var(--text-muted)" }}
              >
                {fileNameFromPath(currentPath)}
                {isDirty && (
                  <span className="ml-1" style={{ color: "var(--accent)" }}>
                    ●
                  </span>
                )}
              </div>
            </ToolbarGroup>

            <ToolbarGroup>
              <Button
                onClick={() => handleMoveLine("up")}
                tooltip="Move line up"
                icon={<FaArrowUp />}
                disabled={mode !== "edit"}
              />
              <Button
                onClick={() => handleMoveLine("down")}
                tooltip="Move line down"
                icon={<FaArrowDown />}
                disabled={mode !== "edit"}
              />
              <ToolbarDivider />
              <Button
                onClick={() => setShowSettings(true)}
                tooltip="Settings"
                icon={<FaCog />}
              />
              <Button
                onClick={() => setShowHelp(true)}
                tooltip="Help & Manual"
                icon={<FaQuestionCircle />}
              />
              <Button
                onClick={() => window.print()}
                tooltip="Print (Ctrl+P)"
                icon={<FaPrint />}
              />
              <ToolbarDivider />
              <Button
                onClick={performToggle}
                tooltip="Toggle Mode (Ctrl+E)"
                variant={mode === "preview" ? "primary" : "ghost"}
                className="w-28"
              >
                {mode === "edit" ? (
                  <>
                    <FaEye className="mr-2" /> Preview
                  </>
                ) : (
                  <>
                    <FaCode className="mr-2" /> Editor
                  </>
                )}
              </Button>
            </ToolbarGroup>
          </Toolbar>
        }
      >
        <div className="flex h-full w-full flex-col">
          <AnimatePresence mode="wait" initial={false}>
            {mode === "edit" ? (
              <motion.div
                key="edit"
                className="h-full w-full"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Editor
                  content={docContent}
                  onChange={(value) => {
                    setDocContent(value);
                    setIsDirty(true);
                  }}
                  lineWrap={lineWrapEnabled}
                  overflowFold={overflowFoldEnabled}
                  onViewInit={handleEditorInit}
                />
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                className="h-full w-full overflow-auto"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <Preview content={docContent} />
              </motion.div>
            )}
          </AnimatePresence>
          <StatusBar
            currentPath={currentPath}
            isDirty={isDirty}
            mode={mode}
            autoSaveEnabled={autoSaveEnabled}
            stats={stats}
          />
        </div>
      </Layout>

      <RecentFilesModal
        isOpen={showRecentFiles}
        onClose={() => setShowRecentFiles(false)}
        recentFiles={recentFiles}
        onOpen={handleOpenRecentFile}
      />
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </>
  );
}

export default App;
