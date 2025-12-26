import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import mermaid from "mermaid";
import Prism from "prismjs";

import "katex/dist/katex.min.css";
import "prismjs/themes/prism.css";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-python";
import "prismjs/components/prism-markup";

import { FiCopy, FiCheck } from "react-icons/fi";
import { Outline } from "./Outline";

interface PreviewProps {
  content: string;
}

type HeadingItem = { id: string; text: string; level: number };

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

  useEffect(() => {
    if (preRef.current) {
      const codeEl = preRef.current.querySelector("code");
      if (codeEl) Prism.highlightElement(codeEl as HTMLElement);
    }
  }, [codeText]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="relative group my-4" ref={preRef}>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 rounded bg-white/80 border border-slate-200 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:text-slate-900"
        title="Copy code"
      >
        {copied ? <FiCheck /> : <FiCopy />}
      </button>
      <pre className={`${className} !m-0 rounded-lg !bg-slate-900 !p-4 overflow-x-auto`}>
        <code className="text-sm text-slate-100 font-mono">{codeText}</code>
      </pre>
    </div>
  );
};

export const Preview: React.FC<PreviewProps> = ({ content }) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Extract headings and handle scroll spy
  useEffect(() => {
    if (!previewRef.current) return;
    
    // Wait for render
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
    <div className="flex h-full">
      <div className="flex-1 overflow-y-auto preview-scroll-container px-8 py-8">
        <div 
          ref={previewRef}
          className="prose prose-slate max-w-3xl mx-auto dark:prose-invert prose-headings:scroll-mt-20 prose-a:text-blue-600 hover:prose-a:text-blue-500"
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
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
                return <code className={className} {...props}>{children}</code>;
              },
              h1: ({ node, ...props }) => <h1 id={props.id} {...props} />,
              h2: ({ node, ...props }) => <h2 id={props.id} {...props} />,
              h3: ({ node, ...props }) => <h3 id={props.id} {...props} />,
              h4: ({ node, ...props }) => <h4 id={props.id} {...props} />,
              h5: ({ node, ...props }) => <h5 id={props.id} {...props} />,
              h6: ({ node, ...props }) => <h6 id={props.id} {...props} />,
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
      <Outline headings={headings} activeId={activeId || undefined} onClick={scrollToId} />
    </div>
  );
};
