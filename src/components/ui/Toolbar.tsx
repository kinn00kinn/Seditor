import React from "react";
import { cn } from "../../utils/cn";

interface ToolbarProps {
  children: React.ReactNode;
  className?: string;
}

export const Toolbar: React.FC<ToolbarProps> = ({ children, className = "" }) => {
  return (
    <div
      className={cn(
        "h-14 flex items-center justify-between px-4 sticky top-0 z-10",
        "backdrop-blur-md border-b transition-all duration-300 ease-in-out",
        className
      )}
      style={{
        backgroundColor: 'var(--toolbar-glass)',
        borderBottomColor: 'var(--toolbar-border)',
      }}
    >
      {children}
    </div>
  );
};

export const ToolbarGroup: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return <div className={cn("flex items-center gap-1", className)}>{children}</div>;
};

export const ToolbarDivider: React.FC = () => {
  return <div className="w-px h-6 mx-2" style={{ backgroundColor: 'var(--background-modifier-border)' }} />;
};
