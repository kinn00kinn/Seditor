import { useEffect, useRef, useState } from "react";
import { EditorView } from "@codemirror/view";
import { useFileHandler } from "./hooks/useFileHandler";
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

  // --- Actions (Ref pattern for Global shortcuts) ---
  const actionsRef = useRef({
    save: async () => {},
    saveAs: async () => {},
    toggleMode: () => {},
    open: async () => {},
  });

  const performToggle = () => {
    if (viewRef.current) {
      setDocContent(viewRef.current.state.doc.toString());
    }
    setMode((prev) => (prev === "edit" ? "preview" : "edit"));
  };

  const performSave = async () => {
    const content = viewRef.current
      ? viewRef.current.state.doc.toString()
      : docContent;
    await saveFile(content);
  };

  const performSaveAs = async () => {
    const content = viewRef.current
      ? viewRef.current.state.doc.toString()
      : docContent;
    await saveAsFile(content);
  };

  const performOpen = async () => {
    const content = await openFile();
    if (content !== null && viewRef.current) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: content,
        },
      });
    }
  };

  useEffect(() => {
    actionsRef.current = {
      save: performSave,
      saveAs: performSaveAs,
      toggleMode: performToggle,
      open: performOpen,
    };
  }, [docContent, currentPath, mode]);

  useEffect(() => {
    const handler = (e: any) => {
      if (e?.detail?.lineWrap !== undefined)
        setLineWrapEnabled(Boolean(e.detail.lineWrap));
      if (e?.detail?.overflowFold !== undefined)
        setOverflowFoldEnabled(Boolean(e.detail.overflowFold));
    };
    window.addEventListener(
      "seditor:settingsChanged",
      handler as EventListener
    );
    return () =>
      window.removeEventListener(
        "seditor:settingsChanged",
        handler as EventListener
      );
  }, []);

  // --- Global Shortcut (Capture Phase) ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase();
        if (key === "e") {
          e.preventDefault();
          e.stopPropagation();
          actionsRef.current.toggleMode();
        } else if (key === "s") {
          e.preventDefault();
          if (e.shiftKey) actionsRef.current.saveAs();
          else actionsRef.current.save();
        } else if (key === "o") {
          e.preventDefault();
          actionsRef.current.open();
        } else if (key === "p") {
          e.preventDefault();
          window.print();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () =>
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, []);

  // Move selected lines up/down
  const moveLine = (dir: "up" | "down") => {
    const view = viewRef.current;
    if (!view) return;
    const state = view.state;
    const { from, to } = state.selection.main;
    const lineFrom = state.doc.lineAt(from);
    const lineTo = state.doc.lineAt(to === from ? to : to - 1);
    const start = lineFrom.from;
    const end = lineTo.to;
    const selectedText = state.doc.sliceString(start, end);

    if (dir === "up") {
      if (start === 0) return;
      const prevLine = state.doc.lineAt(start - 1);
      const before = state.doc.sliceString(prevLine.from, prevLine.to);
      view.dispatch({
        changes: [
          {
            from: prevLine.from,
            to: end,
            insert: selectedText + "\n" + before,
          },
        ],
        selection: {
          anchor: prevLine.from,
          head: prevLine.from + selectedText.length,
        },
      });
    } else {
      if (end === state.doc.length) return;
      const nextLine = state.doc.lineAt(end + 1);
      const after = state.doc.sliceString(nextLine.from, nextLine.to);
      view.dispatch({
        changes: [
          { from: start, to: nextLine.to, insert: after + "\n" + selectedText },
        ],
        selection: {
          anchor: start + after.length + 1,
          head: start + after.length + 1 + selectedText.length,
        },
      });
    }
    view.focus();
  };

  const handleEditorInit = (view: EditorView) => {
    viewRef.current = view;
  };

  return (
    <Layout
      header={
        <Toolbar>
          <ToolbarGroup>
            <Button
              onClick={() => actionsRef.current.open()}
              tooltip="Open (Ctrl+O)"
              icon={<FaFolderOpen />}
            />
            <Button
              onClick={() => actionsRef.current.save()}
              tooltip="Save (Ctrl+S)"
              icon={<FaSave />}
              className={isDirty ? "text-red-500" : ""}
            />
            <div className="text-sm font-medium text-slate-600 ml-2">
              {currentPath ? currentPath.split(/[\\/]/).pop() : "Untitled"}
              {isDirty && "*"}
            </div>
          </ToolbarGroup>
          <ToolbarGroup>
            <Button
              onClick={() => setShowSettings(true)}
              tooltip="Settings"
              icon={<FaCog />}
            />
            <SettingsPanel
              isOpen={showSettings}
              onClose={() => setShowSettings(false)}
            />
            <ToolbarDivider />
            <Button
              onClick={() => moveLine("up")}
              tooltip="Move line up"
              icon={<FaArrowUp />}
            />
            <Button
              onClick={() => moveLine("down")}
              tooltip="Move line down"
              icon={<FaArrowDown />}
            />
            <Button
              onClick={() => window.print()}
              tooltip="Print (Ctrl+P)"
              icon={<FaPrint />}
            />
            <ToolbarDivider />
            <Button
              onClick={() => actionsRef.current.toggleMode()}
              tooltip="Toggle Mode (Ctrl+E)"
              variant="ghost"
              active={mode === "preview"}
            >
              {mode === "edit" ? (
                <>
                  <FaCode className="mr-1" /> Source
                </>
              ) : (
                <>
                  <FaEye className="mr-1" /> Preview
                </>
              )}
            </Button>
          </ToolbarGroup>
        </Toolbar>
      }
    >
      {mode === "edit" ? (
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
      ) : (
        <Preview content={docContent} />
      )}
    </Layout>
  );
}

export default App;
