import React, { useEffect, useState } from "react";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";

const STYLE_ID = "seditor-user-style";

const DEFAULT_ACCENT = "#16a221";
const DEFAULT_FONT = "'Inter', system-ui, sans-serif";
const DEFAULT_FONT_SIZE = 16;

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

function applyTheme(accentColor: string, fontFamily: string, fontSize: number, customCss: string) {
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

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const [accentColor, setAccentColor] = useState<string>(
    localStorage.getItem("seditor:accentColor") || DEFAULT_ACCENT
  );
  const [fontFamily, setFontFamily] = useState<string>(
    localStorage.getItem("seditor:fontFamily") || DEFAULT_FONT
  );
  const [fontSize, setFontSize] = useState<number>(
    Number(localStorage.getItem("seditor:fontSize")) || DEFAULT_FONT_SIZE
  );
  const [customCss, setCustomCss] = useState<string>(
    localStorage.getItem("seditor:customCss") || ""
  );
  const [lineWrap, setLineWrap] = useState<boolean>(
    localStorage.getItem("seditor:lineWrap") === "true"
  );
  const [overflowFold, setOverflowFold] = useState<boolean>(
    localStorage.getItem("seditor:overflowFold") === "true"
  );

  useEffect(() => {
    applyTheme(accentColor, fontFamily, fontSize, customCss);
  }, []);

  const handleApply = () => {
    localStorage.setItem("seditor:accentColor", accentColor);
    localStorage.setItem("seditor:fontFamily", fontFamily);
    localStorage.setItem("seditor:fontSize", String(fontSize));
    localStorage.setItem("seditor:lineWrap", String(lineWrap));
    localStorage.setItem("seditor:overflowFold", String(overflowFold));
    localStorage.setItem("seditor:customCss", customCss || "");
    applyTheme(accentColor, fontFamily, fontSize, customCss);
    
    window.dispatchEvent(
      new CustomEvent("seditor:settingsChanged", {
        detail: { lineWrap, overflowFold },
      })
    );
    onClose();
  };

  const handleReset = () => {
    localStorage.removeItem("seditor:accentColor");
    localStorage.removeItem("seditor:fontFamily");
    localStorage.removeItem("seditor:fontSize");
    localStorage.removeItem("seditor:customCss");
    localStorage.removeItem("seditor:lineWrap");
    localStorage.removeItem("seditor:overflowFold");
    setAccentColor(DEFAULT_ACCENT);
    setFontFamily(DEFAULT_FONT);
    setFontSize(DEFAULT_FONT_SIZE);
    setCustomCss("");
    setLineWrap(false);
    setOverflowFold(false);
    applyTheme(DEFAULT_ACCENT, DEFAULT_FONT, DEFAULT_FONT_SIZE, "");
  };

  const inputStyle = {
    borderColor: 'var(--background-modifier-border)',
    backgroundColor: 'var(--bg-primary-alt)',
    color: 'var(--text-normal)',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings">
      <div className="space-y-4">
        {/* Accent Color */}
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
            Accent Color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              className="w-10 h-10 border-none cursor-pointer p-0"
              style={{ backgroundColor: 'transparent' }}
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
            />
            <input
              type="text"
              className="flex-1 px-3 py-2 border rounded-none focus:outline-none text-sm font-mono"
              style={inputStyle}
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
            />
            <div
              className="w-20 h-10 border"
              style={{ backgroundColor: accentColor, borderColor: 'var(--background-modifier-border)' }}
            />
          </div>
        </div>

        {/* Font Family */}
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
            Font Family
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded-none focus:outline-none"
            style={inputStyle}
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
          />
        </div>

        {/* Font Size */}
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
            Font Size (px)
          </label>
          <input
            type="number"
            className="w-full px-3 py-2 border rounded-none focus:outline-none"
            style={inputStyle}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value) || 16)}
          />
        </div>

        {/* Custom CSS */}
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
            Custom CSS
          </label>
          <textarea
            className="w-full px-3 py-2 border rounded-none focus:outline-none font-mono text-sm"
            style={inputStyle}
            rows={4}
            value={customCss}
            onChange={(e) => setCustomCss(e.target.value)}
          />
        </div>

        {/* Toggles */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="lineWrap"
            className="rounded-none"
            style={{ accentColor: accentColor }}
            checked={lineWrap}
            onChange={(e) => setLineWrap(e.target.checked)}
          />
          <label htmlFor="lineWrap" className="text-sm" style={{ color: 'var(--text-normal)' }}>
            行の折り返し
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="overflowFold"
            className="rounded-none"
            style={{ accentColor: accentColor }}
            checked={overflowFold}
            onChange={(e) => setOverflowFold(e.target.checked)}
          />
          <label htmlFor="overflowFold" className="text-sm" style={{ color: 'var(--text-normal)' }}>
            はみ出し折りたたみ（長い行をクリップ）
          </label>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="ghost" onClick={handleReset}>
            リセット
          </Button>
          <Button variant="primary" onClick={handleApply}>
            適用
          </Button>
        </div>
      </div>
    </Modal>
  );
};
