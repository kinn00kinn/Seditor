import React from "react";

interface LayoutProps {
  header?: React.ReactNode;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ header, children }) => {
  return (
    <div className="flex flex-col h-screen bg-white text-slate-900 overflow-hidden">
      {header}
      <main className="flex-1 flex overflow-hidden relative">
        {children}
      </main>
    </div>
  );
};
