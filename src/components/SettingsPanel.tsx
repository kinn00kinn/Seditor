import React, { useEffect, useState } from "react";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";

const STYLE_ID = "seditor-user-style";

function applyStyle(fontFamily: string, fontSize: number, customCss: string) {
  let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  const css = `
    .prose, .cm-content {
      font-family: ${fontFamily} !important;
      font-size: ${fontSize}px !important;
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
  const [fontFamily, setFontFamily] = useState<string>(
    localStorage.getItem("seditor:fontFamily") ||
      "'Inter', system-ui, sans-serif"
  );
  const [fontSize, setFontSize] = useState<number>(
    Number(localStorage.getItem("seditor:fontSize")) || 16
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
    applyStyle(fontFamily, fontSize, customCss);
  }, []);

  const handleApply = () => {
    localStorage.setItem("seditor:fontFamily", fontFamily);
    localStorage.setItem("seditor:fontSize", String(fontSize));
    localStorage.setItem("seditor:lineWrap", String(lineWrap));
    localStorage.setItem("seditor:overflowFold", String(overflowFold));
    localStorage.setItem("seditor:customCss", customCss || "");
    applyStyle(fontFamily, fontSize, customCss);
    
    window.dispatchEvent(
      new CustomEvent("seditor:settingsChanged", {
        detail: { lineWrap, overflowFold },
      })
    );
    onClose();
  };

  const handleReset = () => {
    localStorage.removeItem("seditor:fontFamily");
    localStorage.removeItem("seditor:fontSize");
    localStorage.removeItem("seditor:customCss");
    localStorage.removeItem("seditor:lineWrap");
    localStorage.removeItem("seditor:overflowFold");
    setFontFamily("'Inter', system-ui, sans-serif");
    setFontSize(16);
    setCustomCss("");
    setLineWrap(false);
    setOverflowFold(false);
    applyStyle("'Inter', system-ui, sans-serif", 16, "");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Font Family
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Font Size (px)
          </label>
          <input
            type="number"
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value) || 16)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Custom CSS
          </label>
          <textarea
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            rows={4}
            value={customCss}
            onChange={(e) => setCustomCss(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="lineWrap"
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            checked={lineWrap}
            onChange={(e) => setLineWrap(e.target.checked)}
          />
          <label htmlFor="lineWrap" className="text-sm text-slate-700">
            Enable line wrap
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="overflowFold"
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            checked={overflowFold}
            onChange={(e) => setOverflowFold(e.target.checked)}
          />
          <label htmlFor="overflowFold" className="text-sm text-slate-700">
            Enable overflow fold (clip long lines)
          </label>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="ghost" onClick={handleReset}>
            Reset
          </Button>
          <Button variant="primary" onClick={handleApply}>
            Apply
          </Button>
        </div>
      </div>
    </Modal>
  );
};
