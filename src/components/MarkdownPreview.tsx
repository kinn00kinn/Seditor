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
