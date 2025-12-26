import React from "react";
import { Modal } from "./ui/Modal";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Seditor Help & Manual">
      <div className="space-y-6 text-sm text-slate-700 max-h-[60vh] overflow-y-auto pr-2">
        <section>
          <h3 className="text-base font-semibold text-slate-900 mb-2">Shortcuts</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex justify-between border-b border-slate-100 pb-1">
              <span>Open File</span>
              <kbd className="bg-slate-100 px-2 rounded font-mono text-xs">Ctrl + O</kbd>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-1">
              <span>Save File</span>
              <kbd className="bg-slate-100 px-2 rounded font-mono text-xs">Ctrl + S</kbd>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-1">
              <span>Save As</span>
              <kbd className="bg-slate-100 px-2 rounded font-mono text-xs">Ctrl + Shift + S</kbd>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-1">
              <span>Toggle Preview</span>
              <kbd className="bg-slate-100 px-2 rounded font-mono text-xs">Ctrl + E</kbd>
            </div>
             <div className="flex justify-between border-b border-slate-100 pb-1">
              <span>Print</span>
              <kbd className="bg-slate-100 px-2 rounded font-mono text-xs">Ctrl + P</kbd>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-1">
              <span>Find / Replace</span>
              <kbd className="bg-slate-100 px-2 rounded font-mono text-xs">Ctrl + F</kbd>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-base font-semibold text-slate-900 mb-2">Features</h3>
          <ul className="list-disc list-inside space-y-1 ml-1">
            <li><strong>Markdown Preview:</strong> Real-time preview with GFM support.</li>
            <li><strong>Math Support:</strong> $ E = mc^2 $ using KaTeX.</li>
            <li><strong>Diagrams:</strong> Mermaid diagrams supported (use ```mermaid).</li>
            <li><strong>Code Blocks:</strong> Syntax highlighting and copy button.</li>
            <li><strong>Folding:</strong> Click the gutter arrows to fold code sections or headings.</li>
            <li><strong>Line Moving:</strong> Use the arrow buttons in toolbar to move lines up/down.</li>
            <li><strong>Export:</strong> Print to PDF via Ctrl+P.</li>
          </ul>
        </section>

         <section>
          <h3 className="text-base font-semibold text-slate-900 mb-2">Settings</h3>
          <div>
            Access settings via the cog icon to customize:
            <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
                <li>Font Family & Size</li>
                <li>Line Wrapping</li>
                <li>Overflow Folding (Horizontal clip)</li>
                <li>Custom CSS injection</li>
            </ul>
          </div>
        </section>
      </div>
    </Modal>
  );
};
