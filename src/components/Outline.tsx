import React from "react";

type Heading = { id: string; text: string; level: number };

const Outline: React.FC<{
  headings: Heading[];
  activeId?: string;
  onClick?: (id: string) => void;
}> = ({ headings, activeId, onClick }) => {
  return (
    <aside className="outline" aria-label="Document outline">
      <nav>
        <ul>
          {headings.map((h) => (
            <li
              key={h.id}
              className={`outline-item level-${h.level} ${
                activeId === h.id ? "active" : ""
              }`}
            >
              <a
                href={`#${h.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  onClick?.(h.id);
                }}
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Outline;
