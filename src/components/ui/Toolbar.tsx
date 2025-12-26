import React from "react";

interface ToolbarProps {
  children: React.ReactNode;
  className?: string;
}

export const Toolbar: React.FC<ToolbarProps> = ({ children, className = "" }) => {
  return (
    <div
      className={`h-12 flex items-center justify-between px-4 bg-slate-50 border-b border-slate-200 select-none ${className}`}
    >
      {children}
    </div>
  );
};

export const ToolbarGroup: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <div className="flex items-center gap-1">{children}</div>;
};

export const ToolbarDivider: React.FC = () => {
  return <div className="w-px h-5 bg-slate-300 mx-2" />;
};
