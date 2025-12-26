import React from "react";
import { cn } from "../../utils/cn";

interface LayoutProps {
  header?: React.ReactNode;
  children: React.ReactNode;
  className?: string; // Content area class
}

export const Layout: React.FC<LayoutProps> = ({ header, children, className }) => {
  return (
    <div className="flex flex-col h-screen bg-slate-50/50 text-slate-900 overflow-hidden font-inter selection:bg-slate-200">
      {header}
      <main className={cn("flex-1 flex overflow-hidden relative", className)}>
        {children}
      </main>
    </div>
  );
};
