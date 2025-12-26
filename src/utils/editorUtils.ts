import { EditorView } from "@codemirror/view";

export const moveLine = (view: EditorView, dir: "up" | "down") => {
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
