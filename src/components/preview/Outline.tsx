import React from "react";

interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

interface OutlineProps {
  headings: HeadingItem[];
  activeId?: string;
  onClick: (id: string) => void;
}

export const Outline: React.FC<OutlineProps> = ({
  headings,
  activeId,
  onClick,
}) => {
  if (headings.length === 0) return null;

  return (
    <div className="hidden lg:block w-64 flex-shrink-0 border-l border-slate-200 pl-4 h-full overflow-y-auto sticky top-4">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
        Outline
      </h3>
      <ul className="space-y-1">
        {headings.map((h) => (
          <li
            key={h.id}
            className={`text-sm transition-colors duration-200 ${
              activeId === h.id
                ? "text-blue-600 font-medium"
                : "text-slate-600 hover:text-slate-900"
            }`}
            style={{ paddingLeft: `${(h.level - 1) * 8}px` }}
          >
            <button
              onClick={() => onClick(h.id)}
              className="text-left w-full truncate focus:outline-none"
              title={h.text}
            >
              {h.text}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
