import { useEffect } from "react";

interface ShortcutActions {
  save?: () => void;
  saveAs?: () => void;
  open?: () => void;
  toggleMode?: () => void;
  print?: () => void;
}

export const useShortcuts = (actions: ShortcutActions) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase();
        switch (key) {
          case "s":
            e.preventDefault();
            if (e.shiftKey && actions.saveAs) {
              actions.saveAs();
            } else if (actions.save) {
              actions.save();
            }
            break;
          case "o":
            if (actions.open) {
              e.preventDefault();
              actions.open();
            }
            break;
          case "e":
            if (actions.toggleMode) {
              e.preventDefault();
              e.stopPropagation(); // Stop propagation for toggle
              actions.toggleMode();
            }
            break;
          case "p":
            if (actions.print) {
              e.preventDefault();
              actions.print();
            }
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [actions]);
};
