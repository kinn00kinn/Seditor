import React, { useEffect, useState, useMemo, useRef } from "react";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import {
  applyTheme,
  DEFAULT_ACCENT,
  DEFAULT_FONT,
  DEFAULT_FONT_SIZE,
} from "../utils/theme";
const DEFAULT_AUTO_SAVE = false;
const DEFAULT_REMEMBER_RECENT_FILES = true;
const DEFAULT_RESTORE_LAST_SESSION = true;

// Fallback fonts in case Local Font Access API is unavailable
const FALLBACK_FONTS = [
  "Arial", "Calibri", "Cambria", "Consolas", "Courier New",
  "Georgia", "Impact", "Inter", "Meiryo", "Meiryo UI",
  "MS Gothic", "MS Mincho", "MS PGothic", "MS PMincho",
  "Noto Sans JP", "Noto Serif JP",
  "Segoe UI", "Tahoma", "Times New Roman", "Trebuchet MS",
  "Verdana", "Yu Gothic", "Yu Gothic UI", "Yu Mincho",
  "源ノ角ゴシック", "源ノ明朝",
  "JetBrains Mono", "Fira Code", "SFMono-Regular",
];

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
  const [autoSave, setAutoSave] = useState<boolean>(
    localStorage.getItem("seditor:autoSave") === "true"
  );
  const [rememberRecentFiles, setRememberRecentFiles] = useState<boolean>(
    localStorage.getItem("seditor:rememberRecentFiles") !== "false"
  );
  const [restoreLastSession, setRestoreLastSession] = useState<boolean>(
    localStorage.getItem("seditor:restoreLastSession") !== "false"
  );

  // Font picker state
  const [systemFonts, setSystemFonts] = useState<string[]>([]);
  const [fontSearch, setFontSearch] = useState("");
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const fontDropdownRef = useRef<HTMLDivElement>(null);
  const fontInputRef = useRef<HTMLInputElement>(null);

  // Load system fonts
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const loadFonts = async () => {
      try {
        // Local Font Access API (Chromium / Tauri WebView2)
        if ("queryLocalFonts" in window) {
          const fonts = await (window as any).queryLocalFonts();
          const familySet = new Set<string>();
          for (const font of fonts) {
            familySet.add(font.family);
          }
          const sorted = Array.from(familySet).sort((a, b) =>
            a.localeCompare(b, "ja")
          );
          setSystemFonts(sorted);
          return;
        }
      } catch {
        // Permission denied or API not available
      }
      // Fallback
      setSystemFonts(FALLBACK_FONTS);
    };
    loadFonts();
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handler = (e: MouseEvent) => {
      if (fontDropdownRef.current && !fontDropdownRef.current.contains(e.target as Node)) {
        setShowFontDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  const filteredFonts = useMemo(() => {
    if (!fontSearch) return systemFonts;
    const q = fontSearch.toLowerCase();
    return systemFonts.filter((f) => f.toLowerCase().includes(q));
  }, [systemFonts, fontSearch]);

  const handleApply = () => {
    localStorage.setItem("seditor:accentColor", accentColor);
    localStorage.setItem("seditor:fontFamily", fontFamily);
    localStorage.setItem("seditor:fontSize", String(fontSize));
    localStorage.setItem("seditor:lineWrap", String(lineWrap));
    localStorage.setItem("seditor:overflowFold", String(overflowFold));
    localStorage.setItem("seditor:autoSave", String(autoSave));
    localStorage.setItem("seditor:rememberRecentFiles", String(rememberRecentFiles));
    localStorage.setItem("seditor:restoreLastSession", String(restoreLastSession));
    localStorage.setItem("seditor:customCss", customCss || "");
    applyTheme(accentColor, fontFamily, fontSize, customCss);
    
    window.dispatchEvent(
      new CustomEvent("seditor:settingsChanged", {
        detail: { lineWrap, overflowFold, autoSave, rememberRecentFiles, restoreLastSession },
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
    localStorage.removeItem("seditor:autoSave");
    localStorage.removeItem("seditor:rememberRecentFiles");
    localStorage.removeItem("seditor:restoreLastSession");
    setAccentColor(DEFAULT_ACCENT);
    setFontFamily(DEFAULT_FONT);
    setFontSize(DEFAULT_FONT_SIZE);
    setCustomCss("");
    setLineWrap(false);
    setOverflowFold(false);
    setAutoSave(DEFAULT_AUTO_SAVE);
    setRememberRecentFiles(DEFAULT_REMEMBER_RECENT_FILES);
    setRestoreLastSession(DEFAULT_RESTORE_LAST_SESSION);
    applyTheme(DEFAULT_ACCENT, DEFAULT_FONT, DEFAULT_FONT_SIZE, "");
    window.dispatchEvent(
      new CustomEvent("seditor:settingsChanged", {
        detail: {
          lineWrap: false,
          overflowFold: false,
          autoSave: DEFAULT_AUTO_SAVE,
          rememberRecentFiles: DEFAULT_REMEMBER_RECENT_FILES,
          restoreLastSession: DEFAULT_RESTORE_LAST_SESSION,
        },
      })
    );
  };

  const selectFont = (font: string) => {
    setFontFamily(`'${font}', sans-serif`);
    setShowFontDropdown(false);
    setFontSearch("");
  };

  const inputStyle: React.CSSProperties = {
    borderColor: 'var(--background-modifier-border)',
    backgroundColor: '#fff',
    color: 'var(--text-normal)',
  };

  const labelStyle: React.CSSProperties = {
    color: 'var(--text-muted)',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings">
      <div className="space-y-5">
        {/* Accent Color */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={labelStyle}>
            アクセントカラー
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              className="w-10 h-10 cursor-pointer p-0 border"
              style={{ borderColor: 'var(--background-modifier-border)' }}
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
            />
            <input
              type="text"
              className="flex-1 px-3 py-2 border focus:outline-none text-sm font-mono"
              style={inputStyle}
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
            />
            <div
              className="w-16 h-10 border"
              style={{ backgroundColor: accentColor, borderColor: 'var(--background-modifier-border)' }}
            />
          </div>
        </div>

        {/* Font Family — Searchable dropdown */}
        <div ref={fontDropdownRef} className="relative">
          <label className="block text-sm font-medium mb-1.5" style={labelStyle}>
            フォント
          </label>
          <input
            ref={fontInputRef}
            type="text"
            className="w-full px-3 py-2 border focus:outline-none text-sm"
            style={{ ...inputStyle, fontFamily: fontFamily }}
            value={showFontDropdown ? fontSearch : fontFamily}
            placeholder="フォント名を検索..."
            onFocus={() => {
              setShowFontDropdown(true);
              setFontSearch("");
            }}
            onChange={(e) => {
              setFontSearch(e.target.value);
              if (!showFontDropdown) setShowFontDropdown(true);
            }}
          />
          {showFontDropdown && (
            <div
              className="absolute left-0 right-0 mt-1 border overflow-y-auto z-50"
              style={{
                maxHeight: "200px",
                backgroundColor: "#fff",
                borderColor: "var(--background-modifier-border)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
              }}
            >
              {filteredFonts.length === 0 ? (
                <div className="px-3 py-2 text-sm" style={{ color: "var(--text-faint)" }}>
                  見つかりません
                </div>
              ) : (
                filteredFonts.map((font) => (
                  <button
                    key={font}
                    className="w-full text-left px-3 py-1.5 text-sm hover:bg-[rgba(76,79,105,0.08)] transition-colors"
                    style={{ fontFamily: `'${font}', sans-serif`, color: "var(--text-normal)" }}
                    onClick={() => selectFont(font)}
                  >
                    {font}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Font Size */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={labelStyle}>
            フォントサイズ (px)
          </label>
          <input
            type="number"
            className="w-full px-3 py-2 border focus:outline-none"
            style={inputStyle}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value) || 16)}
          />
        </div>

        {/* Toggles */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="lineWrap"
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
              style={{ accentColor: accentColor }}
              checked={overflowFold}
              onChange={(e) => setOverflowFold(e.target.checked)}
            />
            <label htmlFor="overflowFold" className="text-sm" style={{ color: 'var(--text-normal)' }}>
              はみ出し折りたたみ
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoSave"
              style={{ accentColor: accentColor }}
              checked={autoSave}
              onChange={(e) => setAutoSave(e.target.checked)}
            />
            <label htmlFor="autoSave" className="text-sm" style={{ color: 'var(--text-normal)' }}>
              自動保存
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="rememberRecentFiles"
              style={{ accentColor: accentColor }}
              checked={rememberRecentFiles}
              onChange={(e) => setRememberRecentFiles(e.target.checked)}
            />
            <label htmlFor="rememberRecentFiles" className="text-sm" style={{ color: 'var(--text-normal)' }}>
              最近使ったファイルを記録
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="restoreLastSession"
              style={{ accentColor: accentColor }}
              checked={restoreLastSession}
              onChange={(e) => setRestoreLastSession(e.target.checked)}
            />
            <label htmlFor="restoreLastSession" className="text-sm" style={{ color: 'var(--text-normal)' }}>
              前回のファイルを起動時に復元
            </label>
          </div>
        </div>

        {/* Custom CSS */}
        <div>
          <label className="block text-sm font-medium mb-1.5" style={labelStyle}>
            カスタム CSS
          </label>
          <textarea
            className="w-full px-3 py-2 border focus:outline-none font-mono text-sm"
            style={inputStyle}
            rows={3}
            value={customCss}
            onChange={(e) => setCustomCss(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
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
