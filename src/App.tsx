import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { EditorView } from "@codemirror/view";
import { AnimatePresence, motion } from "framer-motion";
import { useFileHandler } from "./hooks/useFileHandler";
import { useShortcuts } from "./hooks/useShortcuts";
import { moveLine } from "./utils/editorUtils";
import { Layout } from "./components/layout/Layout";
import { Toolbar, ToolbarGroup, ToolbarDivider } from "./components/ui/Toolbar";
import { Button } from "./components/ui/Button";
import { Editor } from "./components/editor/Editor";
import { Preview } from "./components/preview/Preview";
import { SettingsPanel } from "./components/SettingsPanel";
import {
  FaFolderOpen,
  FaSave,
  FaCode,
  FaEye,
  FaPrint,
  FaCog,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";
import "./App.css";

function App() {
  const viewRef = useRef<EditorView | null>(null);

  const {
    currentPath,
    docContent,
    setDocContent,
    isDirty,
    setIsDirty,
    openFile,
    saveFile,
    saveAsFile,
  } = useFileHandler();

  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [showSettings, setShowSettings] = useState(false);
  const [lineWrapEnabled, setLineWrapEnabled] = useState<boolean>(
    localStorage.getItem("seditor:lineWrap") === "true"
  );
  const [overflowFoldEnabled, setOverflowFoldEnabled] = useState<boolean>(
    localStorage.getItem("seditor:overflowFold") === "true"
  );

  const handleEditorInit = useCallback((view: EditorView) => {
    viewRef.current = view;
  }, []);

  // --- Actions ---
  const performToggle = useCallback(() => {
    if (viewRef.current) {
      setDocContent(viewRef.current.state.doc.toString());
    }
    setMode((prev) => (prev === "edit" ? "preview" : "edit"));
  }, [setDocContent]);

  const performSave = useCallback(async () => {
    const content = viewRef.current
      ? viewRef.current.state.doc.toString()
      : docContent;
    await saveFile(content);
  }, [docContent, saveFile]);

  const performSaveAs = useCallback(async () => {
    const content = viewRef.current
      ? viewRef.current.state.doc.toString()
      : docContent;
    await saveAsFile(content);
  }, [docContent, saveAsFile]);

  const performOpen = useCallback(async () => {
    const content = await openFile();
    if (content !== null) {
      if (viewRef.current) {
        viewRef.current.dispatch({
          changes: {
            from: 0,
            to: viewRef.current.state.doc.length,
            insert: content,
          },
        });
      }
      setMode("edit"); // Switch to edit mode on open
    }
  }, [openFile]);

  const handleMoveLine = (dir: "up" | "down") => {
    if (viewRef.current) {
      moveLine(viewRef.current, dir);
    }
  };

  // --- Shortcuts ---
  const shortcutActions = useMemo(() => ({
    save: performSave,
    saveAs: performSaveAs,
    open: performOpen,
    toggleMode: performToggle,
    print: () => window.print(),
  }), [performSave, performSaveAs, performOpen, performToggle]);

  useShortcuts(shortcutActions);

  // --- Settings Listener ---
  useEffect(() => {
    const handler = (e: any) => {
      if (e?.detail?.lineWrap !== undefined)
        setLineWrapEnabled(Boolean(e.detail.lineWrap));
      if (e?.detail?.overflowFold !== undefined)
        setOverflowFoldEnabled(Boolean(e.detail.overflowFold));
    };
    window.addEventListener("seditor:settingsChanged", handler as EventListener);
    return () =>
      window.removeEventListener("seditor:settingsChanged", handler as EventListener);
  }, []);

  return (
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
              onClick={performSave}
              tooltip="Save (Ctrl+S)"
              icon={<FaSave />}
              className={isDirty ? "text-red-600 hover:text-red-700 hover:bg-red-50" : ""}
            />
            <div className="text-sm font-medium text-slate-500 ml-2 select-none">
              {currentPath ? currentPath.split(/[\\/]/).pop() : "Untitled"}
              {isDirty && <span className="text-amber-500 ml-1">•</span>}
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
          
          <SettingsPanel
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
          />
        </Toolbar>
      }
    >
      <AnimatePresence mode="wait" initial={false}>
        {mode === "edit" ? (
          <motion.div
            key="edit"
            className="w-full h-full"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Editor
              content={docContent}
              onChange={(val) => {
                setDocContent(val);
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
            className="w-full h-full overflow-auto"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
          >
            <Preview content={docContent} />
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}

export default App;
