const STYLE_ID = "seditor-user-style";

export const DEFAULT_ACCENT = "#16a221";
export const DEFAULT_FONT = "'Inter', system-ui, sans-serif";
export const DEFAULT_FONT_SIZE = 16;

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

function darkenHex(hex: string, amount: number): string {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - amount);
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - amount);
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - amount);
  return `rgb(${r}, ${g}, ${b})`;
}

export function applyTheme(
  accentColor: string,
  fontFamily: string,
  fontSize: number,
  customCss: string
) {
  let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  const rgb = hexToRgb(accentColor);
  const darker = darkenHex(accentColor, 25);

  const css = `
    :root {
      --accent: ${accentColor};
      --accent-light: rgba(${rgb}, 0.15);
      --accent-hover: ${darker};
      --interactive-accent: ${accentColor};
      --text-accent: ${accentColor};
      --code-tag: ${accentColor};
    }
    .prose, .cm-content {
      font-family: ${fontFamily} !important;
      font-size: ${fontSize}px !important;
    }
    .cm-selectionBackground, .cm-focused .cm-selectionBackground {
      background-color: rgba(${rgb}, 0.15) !important;
    }
    ${customCss || ""}
  `;

  if (!el) {
    el = document.createElement("style");
    el.id = STYLE_ID;
    document.head.appendChild(el);
  }

  el.innerHTML = css;
}

export function applyPersistedTheme() {
  const accentColor = localStorage.getItem("seditor:accentColor") || DEFAULT_ACCENT;
  const fontFamily = localStorage.getItem("seditor:fontFamily") || DEFAULT_FONT;
  const fontSize =
    Number(localStorage.getItem("seditor:fontSize")) || DEFAULT_FONT_SIZE;
  const customCss = localStorage.getItem("seditor:customCss") || "";

  applyTheme(accentColor, fontFamily, fontSize, customCss);
}
