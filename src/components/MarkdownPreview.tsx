// src/components/MarkdownPreview.tsx
import React, { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import mermaid from "mermaid";
import "katex/dist/katex.min.css"; // KaTeX CSS

interface Props {
  content: string;
}

const MermaidBlock = ({ code }: { code: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      mermaid
        .render(`mermaid-${Math.random().toString(36).substr(2, 9)}`, code)
        .then(({ svg }) => {
          if (ref.current) ref.current.innerHTML = svg;
        })
        .catch((_e) => {
          if (ref.current) ref.current.innerText = "Mermaid Error";
        });
    }
  }, [code]);
  return <div ref={ref} className="mermaid" />;
};

export const MarkdownPreview: React.FC<Props> = ({ content }) => {
  useEffect(() => {
    mermaid.initialize({ startOnLoad: true });
  }, []);

  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          a({ href, children, ...props }) {
            const handleClick = (e: React.MouseEvent) => {
              if (!href) return;
              e.preventDefault();
              // Try to use Tauri's shell API if available, otherwise fallback to window.open
              import("@tauri-apps/api/shell")
                .then((mod) => {
                  if (mod && typeof mod.open === "function") {
                    mod.open(href as string);
                  } else {
                    window.open(href as string, "_blank");
                  }
                })
                .catch(() => {
                  window.open(href as string, "_blank");
                });
            };

            return (
              // eslint-disable-next-line jsx-a11y/anchor-has-content
              <a href={href} onClick={handleClick} {...props}>
                {children}
              </a>
            );
          },
          code({ node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const isMermaid = match && match[1] === "mermaid";
            if (isMermaid) {
              return (
                <MermaidBlock code={String(children).replace(/\n$/, "")} />
              );
            }
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
