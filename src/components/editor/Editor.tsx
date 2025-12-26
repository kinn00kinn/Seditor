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
} from "@codemirror/language";

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  lineWrap: boolean;
  overflowFold: boolean;
  onViewInit?: (view: EditorView) => void;
}

const editorTheme = EditorView.theme({
  "&": { height: "100%", fontSize: "16px" },
  ".cm-scroller": { fontFamily: "'Consolas', 'Monaco', monospace" },
  ".cm-content": { maxWidth: "100%", paddingBottom: "300px" },
  "&.cm-focused": { outline: "none" },
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
        lineWrappingComp.current.of(lineWrap ? EditorView.lineWrapping : []),
        history(),
        markdown(),
        editorTheme,
        syntaxHighlighting(defaultHighlightStyle),
        keymap.of([
          indentWithTab,
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
