// src/components/MarkdownPreview.tsx
import React, { useEffect, useRef, useState } from "react";
import { FiCopy, FiCheck } from "react-icons/fi";
import "./MarkdownPreview.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import mermaid from "mermaid";
import "katex/dist/katex.min.css"; // KaTeX CSS
import Prism from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-python";
import "prismjs/components/prism-markup";
import "prismjs/themes/prism.css";

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
  const codeRef = useRef<HTMLElement | null>(null);
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
  const [isDark, setIsDark] = useState<boolean | null>(null);

  React.useEffect(() => {
    if (codeRef.current) {
      try {
        Prism.highlightElement(codeRef.current as Element);
      } catch (e) {
        // ignore
      }

      // determine background brightness to toggle button styling
      try {
        const el = codeRef.current as HTMLElement;
        const container = el.closest(".code-block") || el.parentElement || el;
        const bg = window.getComputedStyle(
          container as Element
        ).backgroundColor;
        const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(bg || "");
        if (m) {
          const r = Number(m[1]);
          const g = Number(m[2]);
          const b = Number(m[3]);
          const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
          setIsDark(lum < 0.5);
        }
      } catch (e) {
        // ignore
      }
    }
  }, [codeText]);

  return (
    <div
      className={`code-block ${
        isDark === null ? "" : isDark ? "dark" : "light"
      }`}
    >
      <div className="code-toolbar">
        <button
          type="button"
          className="copy-btn"
          onClick={handleCopy}
          aria-label={copied ? "Copied" : "Copy code"}
          title={copied ? "Copied" : "Copy code"}
        >
          {copied ? <FiCheck className="icon" /> : <FiCopy className="icon" />}
        </button>
      </div>
      <pre>
        <code ref={codeRef as any} className={className}>
          {codeText}
        </code>
      </pre>
    </div>
  );
};

// Prism highlighting is triggered inside the component when `content` changes.

export const MarkdownPreview: React.FC<Props> = ({ content }) => {
  useEffect(() => {
    mermaid.initialize({ startOnLoad: true });
  }, []);

  useEffect(() => {
    try {
      Prism.highlightAll();
    } catch (e) {
      // ignore
    }
  }, [content]);

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
              const tauriModuleName = "@tauri-apps/api/shell";
              // @ts-ignore: dynamic import intentionally not statically analyzable
              import(/* @vite-ignore */ tauriModuleName)
                .then((mod) => {
                  // Tauri shell may be exported as a named export or as default
                  const opener =
                    mod && typeof mod.open === "function"
                      ? mod.open
                      : mod &&
                        mod.default &&
                        typeof mod.default.open === "function"
                      ? mod.default.open
                      : null;

                  if (opener) {
                    try {
                      opener(href as string);
                      return;
                    } catch (e) {
                      // fall through to window.open
                    }
                  }
                  window.open(href as string, "_blank");
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
