import React, { useEffect, useState } from "react";

const STYLE_ID = "seditor-user-style";

function applyStyle(fontFamily: string, fontSize: number, customCss: string) {
  let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  const css = `
    .markdown-body, .editor-wrapper {
      font-family: ${fontFamily};
      font-size: ${fontSize}px;
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

export const SettingsPanel: React.FC<{ onClose: () => void }> = ({
  onClose,
}) => {
  const [fontFamily, setFontFamily] = useState<string>(
    localStorage.getItem("seditor:fontFamily") ||
      "'Segoe UI', system-ui, sans-serif"
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
    // notify app about settings change
    window.dispatchEvent(
      new CustomEvent("seditor:settingsChanged", {
        detail: { lineWrap, overflowFold },
      })
    );
  };

  const handleReset = () => {
    localStorage.removeItem("seditor:fontFamily");
    localStorage.removeItem("seditor:fontSize");
    localStorage.removeItem("seditor:customCss");
    localStorage.removeItem("seditor:lineWrap");
    localStorage.removeItem("seditor:overflowFold");
    setFontFamily("'Segoe UI', system-ui, sans-serif");
    setFontSize(16);
    setCustomCss("");
    setLineWrap(false);
    setOverflowFold(false);
    applyStyle("'Segoe UI', system-ui, sans-serif", 16, "");
  };

  return (
    <div className="settings-backdrop" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <h3>Settings</h3>
        <label>
          Font family
          <input
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
          />
        </label>
        <label>
          Font size (px)
          <input
            type="number"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value) || 16)}
          />
        </label>
        <label>
          Custom CSS
          <textarea
            value={customCss}
            onChange={(e) => setCustomCss(e.target.value)}
            rows={6}
          />
        </label>
        <label>
          <input
            type="checkbox"
            checked={lineWrap}
            onChange={(e) => setLineWrap(e.target.checked)}
          />{" "}
          Enable line wrap
        </label>
        <label>
          <input
            type="checkbox"
            checked={overflowFold}
            onChange={(e) => setOverflowFold(e.target.checked)}
          />{" "}
          Enable overflow fold (clip long lines)
        </label>
        <div className="settings-actions">
          <button onClick={handleApply}>Apply</button>
          <button onClick={handleReset}>Reset</button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
