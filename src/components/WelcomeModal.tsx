import React from "react";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Welcome to Seditor">
      <div className="space-y-4 text-sm" style={{ color: "var(--text-normal)" }}>
        <p>
          軽量な Markdown 編集と高品質なプレビューに集中したデスクトップエディタです。
        </p>
        <div className="space-y-2">
          <div>New in this build:</div>
          <ul className="list-disc space-y-1 pl-5">
            <li>Recent Files と Clear History</li>
            <li>Auto Save と Session Restore</li>
            <li>Reload from Disk と Open Containing Folder</li>
            <li>Status Bar と OSS 向け release workflow</li>
          </ul>
        </div>
        <div className="flex justify-end">
          <Button variant="primary" onClick={onClose}>
            Continue
          </Button>
        </div>
      </div>
    </Modal>
  );
};
