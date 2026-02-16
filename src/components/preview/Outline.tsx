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
    <div className="h-full px-4">
      <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-3">
        目次
      </h3>
      <ul className="space-y-0.5">
        {headings.map((h) => {
          const isActive = activeId === h.id;
          return (
            <li
              key={h.id}
              className="relative"
            >
              {/* Active indicator line */}
              {isActive && (
                <div className="absolute left-0 top-1 bottom-1 w-[2px] bg-blue-500 rounded-full" />
              )}
              <button
                onClick={() => onClick(h.id)}
                className={`
                  text-left w-full truncate focus:outline-none
                  text-[13px] leading-relaxed py-1 rounded-md
                  transition-colors duration-150
                  ${isActive
                    ? "text-blue-600 font-medium pl-3"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/60 pl-3"
                  }
                `}
                style={{ paddingLeft: `${Math.max(12, (h.level - 1) * 12)}px` }}
                title={h.text}
              >
                {h.text}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
