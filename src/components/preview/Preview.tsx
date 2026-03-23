import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import Prism from "prismjs";

// Additional plugins
import remarkGemoji from "remark-gemoji";
import remarkSupersub from "remark-supersub";
import remarkIns from "remark-ins";
import remarkFlexibleMarkers from "remark-flexible-markers";
import remarkSmartypants from "remark-smartypants";
import remarkDirective from "remark-directive";
import { visit } from "unist-util-visit";


import "katex/dist/katex.min.css";
// NOTE: prism-tomorrow.css removed — custom Zenn-style theme in App.css
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-python";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
import "prismjs/components/prism-css";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-go";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-diff";

import { FiCopy, FiCheck, FiSidebar, FiExternalLink } from "react-icons/fi";
import { resolveLinkPath } from "../../utils/document";
import { openExternalLink, openLocalPath } from "../../utils/runtime";
import { Outline } from "./Outline";

interface PreviewProps {
  content: string;
  currentPath: string | null;
  onTaskToggle?: (taskIndex: number, checked: boolean) => void;
}

type HeadingItem = { id: string; text: string; level: number };

// Plugin to transform directives (::: warning) to HTML
function remarkDirectiveRehype() {
  return (tree: any) => {
    visit(tree, ["containerDirective", "leafDirective", "textDirective"], (node) => {
      const data = node.data || (node.data = {});
      const tagName = node.type === "textDirective" ? "span" : "div";
      
      data.hName = tagName;
      data.hProperties = { 
        className: ["directive", node.name], 
        ...node.attributes 
      };
    });
  };
}

const MermaidBlock: React.FC<{ code: string }> = ({ code }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (ref.current) {
      const cid = `mermaid-${Math.random().toString(36).slice(2, 11)}`;
      void import("mermaid")
        .then(({ default: mermaid }) => mermaid.render(cid, code))
        .then(({ svg }) => {
          if (ref.current) ref.current.innerHTML = svg;
        })
        .catch((e) => {
          if (ref.current) ref.current.innerText = "Mermaid Error";
          console.error(e);
        });
    }
  }, [code]);
  return <div ref={ref} className="my-6 flex justify-center" />;
};

// ── Zenn-style Code Block ──
const CodeBlock: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className, children }) => {
  const codeText = String(children).replace(/\n$/, "");
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);
  const preRef = useRef<HTMLDivElement>(null);

  const match = /language-(\w+)/.exec(className || "");
  const displayLang = match ? match[1] : "";

  useEffect(() => {
    if (preRef.current) {
      const codeEl = preRef.current.querySelector("code");
      if (codeEl) Prism.highlightElement(codeEl as HTMLElement);
    }
  }, [codeText]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="code-block-wrapper"
      ref={preRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Language label + Copy button row */}
      {(displayLang || true) && (
        <div className="code-block-header">
          <span className="code-block-lang">{displayLang || "text"}</span>
          <button
            onClick={handleCopy}
            className={`code-block-copy ${hovered || copied ? "visible" : ""}`}
            title="Copy code"
          >
            {copied ? (
              <><FiCheck className="text-green-600" size={13} /> Copied!</>
            ) : (
              <><FiCopy size={13} /> Copy</>
            )}
          </button>
        </div>
      )}
      <pre className="code-block-pre">
        <code className={`${className || ""} code-block-code`}>{codeText}</code>
      </pre>
    </div>
  );
};

export const Preview: React.FC<PreviewProps> = ({
  content,
  currentPath,
  onTaskToggle,
}) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showOutline, setShowOutline] = useState(true);
  let taskIndex = -1;

  useEffect(() => {
    if (!previewRef.current) return;
    
    setTimeout(() => {
      if (!previewRef.current) return;
      const elements = Array.from(previewRef.current.querySelectorAll("h1,h2,h3,h4,h5,h6"));
      const items = elements.map((el) => {
        const id = el.id || el.textContent?.toLowerCase().replace(/[^\w]+/g, "-") || "";
        if (!el.id) el.id = id;
        return {
          id,
          text: el.textContent || "",
          level: parseInt(el.tagName.substring(1)),
        };
      });
      setHeadings(items);
    }, 100);

    const handleScroll = () => {
      if (!previewRef.current) return;
      const elements = Array.from(previewRef.current.querySelectorAll("h1,h2,h3,h4,h5,h6"));
      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        if (rect.top >= 0 && rect.top < 150) {
          setActiveId(el.id);
          break;
        }
      }
    };

    const container = previewRef.current.closest(".preview-scroll-container");
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [content]);

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveId(id);
  };

  return (
    <div className="flex h-full relative">
       <button
        onClick={() => setShowOutline(!showOutline)}
        className="absolute top-4 right-6 z-10 p-2 rounded-none transition-all backdrop-blur-sm shadow-sm border"
        style={{ color: 'var(--text-faint)', backgroundColor: 'var(--toolbar-glass)', borderColor: 'var(--toolbar-border)' }}
        title={showOutline ? "Hide Outline" : "Show Outline"}
      >
        <FiSidebar size={16} />
      </button>

      <div className="flex-1 overflow-y-auto preview-scroll-container px-8 py-8 transition-all duration-300">
        <div 
          ref={previewRef}
          className={`markdown-preview-view prose max-w-3xl ${showOutline ? "mr-4" : "mx-auto"} ml-auto prose-headings:scroll-mt-20 pb-32`} 
          style={{ color: '#1e1e2e' }}
        >
          <ReactMarkdown
            remarkPlugins={[
              remarkGfm, 
              remarkMath, 
              remarkGemoji,
              remarkSupersub,
              remarkIns,
              remarkFlexibleMarkers,
              remarkSmartypants,
              remarkDirective,
              remarkDirectiveRehype
            ]}
            rehypePlugins={[rehypeKatex, rehypeSlug]}
            components={{
              code({ inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || "");
                const lang = match && match[1];
                if (!inline && lang === "mermaid") {
                  return <MermaidBlock code={String(children).replace(/\n$/, "")} />;
                }
                if (!inline) {
                  return <CodeBlock className={className}>{children}</CodeBlock>;
                }
                // Zenn-style inline code
                return (
                  <code
                    className="inline-code"
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              a({ node, href, children, ...props }) {
                const isExternal = href && /^(https?:|mailto:|tel:)/.test(href);
                const isAnchor = href && href.startsWith("#");
                return (
                  <a
                    href={href}
                    onClick={async (e) => {
                      if (!href) return;
                      
                      if (isAnchor) {
                        e.preventDefault();
                        const targetId = href.slice(1);
                        const el = document.getElementById(targetId);
                        if (el) {
                          el.scrollIntoView({ behavior: "smooth", block: "start" });
                        }
                        return;
                      }
                      
                      if (isExternal) {
                        e.preventDefault();
                        try {
                          await openExternalLink(href);
                        } catch (err) {
                          console.error("Failed to open link:", err);
                        }
                        return;
                      }

                      e.preventDefault();
                      try {
                        await openLocalPath(resolveLinkPath(currentPath, href));
                      } catch (err) {
                        console.error("Failed to open local link:", err);
                      }
                    }}
                    className="link-styled"
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                    {...props}
                  >
                    {children}
                    {isExternal && (
                      <FiExternalLink
                        className="inline-block ml-0.5 align-text-top"
                        size={12}
                        style={{ verticalAlign: "text-top", display: "inline", marginBottom: "1px" }}
                      />
                    )}
                  </a>
                );
              },
              // Wrap tables in overflow container
              table({ node, children, ...props }) {
                return (
                  <div className="table-overflow-wrapper">
                    <table {...props}>{children}</table>
                  </div>
                );
              },
              input({ node, type, checked, disabled, ...props }: any) {
                if (type !== "checkbox") {
                  return <input type={type} disabled={disabled} checked={checked} {...props} />;
                }

                taskIndex += 1;
                const currentTaskIndex = taskIndex;

                return (
                  <input
                    type="checkbox"
                    className="task-list-checkbox"
                    checked={Boolean(checked)}
                    onChange={(event) =>
                      onTaskToggle?.(currentTaskIndex, event.currentTarget.checked)
                    }
                    {...props}
                  />
                );
              },
              li({ node, className, children, ...props }: any) {
                const isTaskItem =
                  typeof className === "string" && className.includes("task-list-item");

                return (
                  <li
                    className={isTaskItem ? `${className} preview-task-item` : className}
                    {...props}
                  >
                    {children}
                  </li>
                );
              },
              h1: ({ node, ...props }) => <h1 {...props} />,
              h2: ({ node, ...props }) => <h2 {...props} />,
              h3: ({ node, ...props }) => <h3 {...props} />,
              h4: ({ node, ...props }) => <h4 {...props} />,
              h5: ({ node, ...props }) => <h5 {...props} />,
              h6: ({ node, ...props }) => <h6 {...props} />,
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
      
      <div className={`
        flex-shrink-0 border-l h-full overflow-y-auto
        transition-all duration-300 ease-in-out
        ${showOutline ? "w-64 opacity-100 translate-x-0" : "w-0 opacity-0 translate-x-10 p-0 border-none"}
      `}
      style={{ borderLeftColor: 'var(--background-modifier-border)', backgroundColor: 'var(--bg-primary-alt)' }}
      >
          <div className="pt-16 px-0 h-full">
            <Outline headings={headings} activeId={activeId || undefined} onClick={scrollToId} />
          </div>
      </div>
    </div>
  );
};
