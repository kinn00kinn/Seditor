import React, { useEffect, useRef } from "react";
import { EditorState, Compartment } from "@codemirror/state";
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
  foldGutter,
  foldKeymap,
} from "@codemirror/language";

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  lineWrap: boolean;
  overflowFold: boolean;
  onViewInit?: (view: EditorView) => void;
}

const editorTheme = EditorView.theme({
  "&": {
    height: "100%",
    fontSize: "15px",
    backgroundColor: "transparent",
  },
  ".cm-scroller": {
    fontFamily:
      '"JetBrains Mono", "Fira Code", "Source Code Pro", Consolas, monospace',
    lineHeight: "1.6",
  },
  ".cm-content": {
    maxWidth: "800px", // Limit width for readability
    margin: "0 auto",
    padding: "40px 24px 300px", // More breathing room
  },
  ".cm-gutters": {
    backgroundColor: "transparent",
    borderRight: "none",
    color: "#94a3b8", // slate-400
    paddingRight: "16px",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "transparent",
    color: "#0f172a", // slate-900
  },
  ".cm-lineNumbers .cm-gutterElement": {
    paddingLeft: "12px",
    cursor: "default",
  },
  "&.cm-focused": { outline: "none" },
  ".cm-activeLine": {
    backgroundColor: "rgba(241, 245, 249, 0.5)", // slate-100 with opacity
  },
  ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
    backgroundColor: "rgba(203, 213, 225, 0.6) !important", // slate-300
  },
  ".cm-cursor": {
    borderLeftColor: "#0f172a", // slate-900
    borderLeftWidth: "2px",
  },
});

export const Editor: React.FC<EditorProps> = ({
  content,
  onChange,
  lineWrap,
  overflowFold,
  onViewInit,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  const lineWrappingComp = useRef(new Compartment());

  useEffect(() => {
    if (!containerRef.current) return;

    const state = EditorState.create({
      doc: content,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        foldGutter(),
        lineWrappingComp.current.of(lineWrap ? EditorView.lineWrapping : []),
        history(),
        markdown(),
        editorTheme,
        syntaxHighlighting(defaultHighlightStyle),
        keymap.of([
          indentWithTab,
          ...foldKeymap,
          {
            key: "Mod-f",
            run: () => {
              if (viewRef.current) openSearchPanel(viewRef.current);
              return true;
            },
            preventDefault: true,
          },
          ...searchKeymap,
          ...defaultKeymap,
          ...historyKeymap,
        ]),
        EditorView.updateListener.of((u) => {
          if (u.docChanged) {
            onChange(u.state.doc.toString());
          }
        }),
      ],
    });

    const view = new EditorView({ state, parent: containerRef.current });
    viewRef.current = view;
    
    if (onViewInit) onViewInit(view);

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []); // Run once on mount

  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.dispatch({
        effects: lineWrappingComp.current.reconfigure(
          lineWrap ? EditorView.lineWrapping : []
        ),
      });
    }
  }, [lineWrap]);

  useEffect(() => {
    if (containerRef.current) {
        if (overflowFold) containerRef.current.classList.add("overflow-fold");
        else containerRef.current.classList.remove("overflow-fold");
    }
  }, [overflowFold]);

  return (
    <div 
      ref={containerRef} 
      className={`h-full w-full text-left ${overflowFold ? "overflow-fold" : ""}`} 
    />
  );
};
