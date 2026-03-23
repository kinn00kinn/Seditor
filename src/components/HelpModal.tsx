import React from "react";
import { Modal } from "./ui/Modal";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Seditor Help & Manual">
      <div className="space-y-6 text-sm max-h-[60vh] overflow-y-auto pr-2" style={{ color: 'var(--text-normal)' }}>
        <section>
          <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--text-normal)' }}>Shortcuts</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex justify-between pb-1" style={{ borderBottomColor: 'var(--background-modifier-border)', borderBottomWidth: '1px' }}>
              <span>Open File</span>
              <kbd className="px-2 rounded-none font-mono text-xs" style={{ backgroundColor: 'var(--bg-primary-alt)' }}>Ctrl + O</kbd>
            </div>
            <div className="flex justify-between pb-1" style={{ borderBottomColor: 'var(--background-modifier-border)', borderBottomWidth: '1px' }}>
              <span>Save File</span>
              <kbd className="px-2 rounded-none font-mono text-xs" style={{ backgroundColor: 'var(--bg-primary-alt)' }}>Ctrl + S</kbd>
            </div>
            <div className="flex justify-between pb-1" style={{ borderBottomColor: 'var(--background-modifier-border)', borderBottomWidth: '1px' }}>
              <span>Save As</span>
              <kbd className="px-2 rounded-none font-mono text-xs" style={{ backgroundColor: 'var(--bg-primary-alt)' }}>Ctrl + Shift + S</kbd>
            </div>
            <div className="flex justify-between pb-1" style={{ borderBottomColor: 'var(--background-modifier-border)', borderBottomWidth: '1px' }}>
              <span>Toggle Preview</span>
              <kbd className="px-2 rounded-none font-mono text-xs" style={{ backgroundColor: 'var(--bg-primary-alt)' }}>Ctrl + E</kbd>
            </div>
             <div className="flex justify-between pb-1" style={{ borderBottomColor: 'var(--background-modifier-border)', borderBottomWidth: '1px' }}>
              <span>Print</span>
              <kbd className="px-2 rounded-none font-mono text-xs" style={{ backgroundColor: 'var(--bg-primary-alt)' }}>Ctrl + P</kbd>
            </div>
            <div className="flex justify-between pb-1" style={{ borderBottomColor: 'var(--background-modifier-border)', borderBottomWidth: '1px' }}>
              <span>Find / Replace</span>
              <kbd className="px-2 rounded-none font-mono text-xs" style={{ backgroundColor: 'var(--bg-primary-alt)' }}>Ctrl + F</kbd>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--text-normal)' }}>Features</h3>
          <ul className="list-disc list-inside space-y-1 ml-1">
            <li><strong>Markdown Preview:</strong> Real-time preview with GFM support.</li>
            <li><strong>Math Support:</strong> $ E = mc^2 $ using KaTeX.</li>
            <li><strong>Diagrams:</strong> Mermaid diagrams supported (use ```mermaid).</li>
            <li><strong>Code Blocks:</strong> Syntax highlighting and copy button.</li>
            <li><strong>Folding:</strong> Click the gutter arrows to fold code sections or headings.</li>
            <li><strong>Line Moving:</strong> Use the arrow buttons in toolbar to move lines up/down.</li>
            <li><strong>Recent Files:</strong> Reopen documents quickly from the recent files list.</li>
            <li><strong>Reload from Disk:</strong> Refresh the current file when it changed outside the app.</li>
            <li><strong>Export:</strong> Print to PDF via Ctrl+P.</li>
          </ul>
        </section>

         <section>
          <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--text-normal)' }}>Settings</h3>
          <div>
            Access settings via the cog icon to customize:
            <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
                <li>Font Family & Size</li>
                <li>Line Wrapping</li>
                <li>Overflow Folding (Horizontal clip)</li>
                <li>Auto Save</li>
                <li>Custom CSS injection</li>
            </ul>
          </div>
        </section>
      </div>
    </Modal>
  );
};
