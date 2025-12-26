// src/components/MarkdownPreview.tsx
import React, { useEffect, useRef, useState } from "react";
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

const CodeBlock: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className, children }) => {
  const codeText = String(children).replace(/\n$/, "");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_e) {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = codeText;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("copy failed", err);
      }
      document.body.removeChild(ta);
    }
  };

  return (
    <div className="code-block">
      <div className="code-toolbar">
        <button type="button" className="copy-btn" onClick={handleCopy}>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre>
        <code className={className}>{codeText}</code>
      </pre>
    </div>
  );
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
          code({ className, children }) {
            const match = /language-(\w+)/.exec(className || "");
            const lang = match && match[1];
            const isMermaid = lang === "mermaid";
            if (isMermaid) {
              return (
                <MermaidBlock code={String(children).replace(/\n$/, "")} />
              );
            }
            return <CodeBlock className={className}>{children}</CodeBlock>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
