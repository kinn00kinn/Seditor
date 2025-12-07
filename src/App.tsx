// src/App.tsx
import  { useEffect, useRef, useState } from "react";
import { EditorState } from "@codemirror/state";
import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLineGutter,
} from "@codemirror/view";
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from "@codemirror/commands";
import { searchKeymap, openSearchPanel } from "@codemirror/search";
import { markdown } from "@codemirror/lang-markdown";
import {
  syntaxHighlighting,
  defaultHighlightStyle,
} from "@codemirror/language";

import { useFileHandler } from "./hooks/useFileHandler";
import { MarkdownPreview } from "./components/MarkdownPreview";
import { FaFolderOpen, FaSave, FaCode, FaEye, FaPrint } from "react-icons/fa";
import "./App.css";

const editorTheme = EditorView.theme({
  "&": { height: "100%", fontSize: "16px" },
  ".cm-scroller": { fontFamily: "'Consolas', 'Monaco', monospace" },
  ".cm-content": { maxWidth: "100%", paddingBottom: "300px" },
});

function App() {
  const editorRef = useRef<HTMLDivElement>(null);
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

  // --- Editor Setup ---
  useEffect(() => {
    if (mode === "preview") return;
    if (!editorRef.current) return;

    const state = EditorState.create({
      doc: docContent,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        history(),
        markdown(),
        editorTheme,
        syntaxHighlighting(defaultHighlightStyle),
        keymap.of([
          indentWithTab,
          {
            key: "Mod-f",
            run: () => {
              openSearchPanel(viewRef.current!);
              return true;
            },
            preventDefault: true,
          },
          ...searchKeymap,
          ...defaultKeymap,
          ...historyKeymap,
        ]),
        EditorView.updateListener.of((u) => {
          if (u.docChanged) setIsDirty(true);
        }),
      ],
    });

    const view = new EditorView({ state, parent: editorRef.current });
    viewRef.current = view;
    view.focus();
    return () => view.destroy();
  }, [mode]);

  return (
    <div className="app-container">
      <div className="toolbar">
        <div className="toolbar-group">
          <button
            onClick={() => actionsRef.current.open()}
            title="Open (Ctrl+O)"
          >
            <FaFolderOpen />
          </button>
          <button
            onClick={() => actionsRef.current.save()}
            title="Save (Ctrl+S)"
            className={isDirty ? "dirty" : ""}
          >
            <FaSave />
          </button>
          <span className="file-name">
            {currentPath ? currentPath.split(/[\\/]/).pop() : "Untitled"}
            {isDirty && "*"}
          </span>
        </div>
        <div className="toolbar-group">
          <button onClick={() => window.print()} title="Print (Ctrl+P)">
            <FaPrint />
          </button>
          <div className="divider" />
          <button
            onClick={() => actionsRef.current.toggleMode()}
            className="mode-btn"
            title="Toggle Mode (Ctrl+E)"
          >
            {mode === "edit" ? (
              <>
                <FaCode /> Source
              </>
            ) : (
              <>
                <FaEye /> Preview
              </>
            )}
          </button>
        </div>
      </div>
      <div className="main-area">
        {mode === "edit" ? (
          <div ref={editorRef} className="editor-wrapper" />
        ) : (
          <div className="preview-wrapper">
            <MarkdownPreview content={docContent} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
