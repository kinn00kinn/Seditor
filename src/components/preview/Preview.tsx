import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import mermaid from "mermaid";
import Prism from "prismjs";
// @ts-ignore
// import { open } from "@tauri-apps/plugin-opener";

// Additional plugins
import remarkGemoji from "remark-gemoji";
import remarkSupersub from "remark-supersub";
import remarkIns from "remark-ins";
import remarkFlexibleMarkers from "remark-flexible-markers";
import remarkSmartypants from "remark-smartypants";
// import remarkDefinitionList from "remark-definition-list";
// import remarkAbbr from "remark-abbr";
import remarkDirective from "remark-directive";
import { visit } from "unist-util-visit";


import "katex/dist/katex.min.css";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-python";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";

import { FiCopy, FiCheck, FiSidebar } from "react-icons/fi";
import { Outline } from "./Outline";

interface PreviewProps {
  content: string;
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
      const cid = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
      mermaid.render(cid, code).then(({ svg }) => {
        if (ref.current) ref.current.innerHTML = svg;
      }).catch((e) => {
        if (ref.current) ref.current.innerText = "Mermaid Error";
        console.error(e);
      });
    }
  }, [code]);
  return <div ref={ref} className="my-4 flex justify-center" />;
};

const CodeBlock: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className, children }) => {
  const codeText = String(children).replace(/\n$/, "");
  const [copied, setCopied] = useState(false);
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
    <div className="relative group my-6 rounded-lg overflow-hidden border border-slate-700 shadow-md" ref={preRef}>
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
         <span className="text-xs font-semibold text-slate-400 uppercase">{displayLang || "text"}</span>
         <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-colors"
            title="Copy code"
          >
            {copied ? <><FiCheck className="text-green-500"/> Copied</> : <><FiCopy /> Copy</>}
          </button>
      </div>
      <pre className="!m-0 !bg-[#2d2d2d] !p-4 overflow-x-auto rounded-none">
        <code className={`${className} text-sm font-mono leading-relaxed text-gray-200`}>{codeText}</code>
      </pre>
    </div>
  );
};

export const Preview: React.FC<PreviewProps> = ({ content }) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showOutline, setShowOutline] = useState(true);

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
        className="absolute top-4 right-6 z-10 p-2 text-slate-400 hover:text-blue-600 bg-white/50 hover:bg-white rounded-md transition-all backdrop-blur-sm shadow-sm"
        title={showOutline ? "Hide Outline" : "Show Outline"}
      >
        <FiSidebar size={18} />
      </button>

      <div className="flex-1 overflow-y-auto preview-scroll-container px-8 py-8 transition-all duration-300">
        <div 
          ref={previewRef}
          className={`markdown-preview-view prose prose-slate max-w-3xl ${showOutline ? "mr-4" : "mx-auto"} ml-auto dark:prose-invert prose-headings:scroll-mt-20 prose-a:text-blue-600 hover:prose-a:text-blue-500 pb-32`} 
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
                return <code className={`${className} bg-slate-100 px-1 py-0.5 rounded text-sm text-pink-600 font-mono`} {...props}>{children}</code>;
              },
              a({ node, href, children, ...props }) {
                 return (
                    <a
                      href={href}
                      onClick={async (e) => {
                         if (href) {
                           if (href.startsWith("#")) return;
                           
                           e.preventDefault();
                           // try {
                             // await open(href);
                           // } catch (err) {
                             // console.error("Failed to open link:", err);
                             try {
                                window.open(href, "_blank");
                             } catch (e2) {
                               console.error("Fallback failed:", e2);
                             }
                           // }
                         }
                      }}
                      className="cursor-pointer"
                      {...props}
                    >
                      {children}
                    </a>
                 )
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
        flex-shrink-0 border-l border-slate-200 h-full overflow-y-auto bg-white/50
        transition-all duration-300 ease-in-out
        ${showOutline ? "w-64 opacity-100 translate-x-0" : "w-0 opacity-0 translate-x-10 p-0 border-none"}
      `}>
          <div className="pt-16 px-0 h-full">
            <Outline headings={headings} activeId={activeId || undefined} onClick={scrollToId} />
          </div>
      </div>
    </div>
  );
};
