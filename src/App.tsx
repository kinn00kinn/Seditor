// src/App.tsx
import { useEffect, useRef, useState } from "react";
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
import SettingsPanel from "./components/SettingsPanel";
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
  };

  // --- Editor Setup ---
  useEffect(() => {
    if (mode === "preview") return;
    if (!editorRef.current) return;

    const state = EditorState.create({
      doc: docContent,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        lineWrapEnabled ? EditorView.lineWrapping : [],
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
    if (editorRef.current) {
      editorRef.current.classList.toggle("overflow-fold", overflowFoldEnabled);
    }
    view.focus();
    return () => view.destroy();
  }, [mode, lineWrapEnabled, overflowFoldEnabled]);

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
          <button onClick={() => setShowSettings(true)} title="Settings">
            <FaCog />
          </button>
          {showSettings && (
            <SettingsPanel onClose={() => setShowSettings(false)} />
          )}
          <button onClick={() => moveLine("up")} title="Move line up">
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
              <path d="M12 8l-6 6h12z" fill="currentColor" />
            </svg>
          </button>
          <button onClick={() => moveLine("down")} title="Move line down">
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
              <path d="M12 16l6-6H6z" fill="currentColor" />
            </svg>
          </button>
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
