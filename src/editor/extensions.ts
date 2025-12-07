// src/editor/extensions.ts
import {
  EditorView,
  Decoration,
  DecorationSet,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
} from "@codemirror/view";
import { syntaxTree } from "@codemirror/language";
import { Range } from "@codemirror/state";

// --- 画像用ウィジェット ---
class ImageWidget extends WidgetType {
  constructor(readonly url: string, readonly alt: string) {
    super();
  }

  eq(other: ImageWidget) {
    return other.url === this.url && other.alt === this.alt;
  }

  toDOM() {
    const img = document.createElement("img");
    img.src = this.url;
    img.alt = this.alt;
    img.className = "cm-img-widget";
    return img;
  }
}

// --- 修正点: 隠し文字用ウィジェット (HiddenWidget) ---
// 以前のコードでエラーが出ていた部分を、正規のWidgetTypeクラスとして定義します
class HiddenWidget extends WidgetType {
  toDOM() {
    // 表示上は何もないスパン要素を返す（テキストをこれで置換することで消す）
    const span = document.createElement("span");
    return span;
  }

  ignoreEvent() {
    return false;
  }
}

// --- Live Preview Plugin ---
export const livePreviewPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    constructor(view: EditorView) {
      this.decorations = this.compute(view);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged || update.selectionSet) {
        this.decorations = this.compute(update.view);
      }
    }

    compute(view: EditorView): DecorationSet {
      const widgets: Range<Decoration>[] = [];
      const { state } = view;
      const selection = state.selection.main;

      for (const { from, to } of view.visibleRanges) {
        syntaxTree(state).iterate({
          from,
          to,
          enter: (node) => {
            const type = node.name;
            // 対象: Image, HeaderMark(#), StrongEmphasis(**), Emphasis(*), 等
            // 必要であれば Link, LinkLabel なども追加可能
            if (
              ["Image", "HeaderMark", "StrongEmphasis", "Emphasis"].includes(
                type
              )
            ) {
              const line = state.doc.lineAt(node.from);
              // カーソルが行内にあるかどうか
              const isCursorOnLine =
                selection.head >= line.from && selection.head <= line.to;

              // カーソルがない行の場合のみ、記法を隠す処理を行う
              if (!isCursorOnLine) {
                if (type === "Image") {
                  const text = state.sliceDoc(node.from, node.to);
                  const match = text.match(/!\[(.*?)\]\((.*?)\)/);
                  if (match) {
                    widgets.push(
                      Decoration.replace({
                        widget: new ImageWidget(match[2], match[1]),
                      }).range(node.from, node.to)
                    );
                  }
                } else {
                  // 修正点: 無名クラスではなく、HiddenWidgetインスタンスを使用
                  widgets.push(
                    Decoration.replace({
                      widget: new HiddenWidget(),
                    }).range(node.from, node.to)
                  );
                }
              }
            }
          },
        });
      }
      return Decoration.set(widgets.sort((a, b) => a.from - b.from));
    }
  },
  { decorations: (v) => v.decorations }
);
