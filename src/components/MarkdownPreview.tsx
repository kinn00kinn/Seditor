// src/components/MarkdownPreview.tsx
import React, { useEffect, useRef, useState } from "react";
import { FiCopy, FiCheck } from "react-icons/fi";
import "./MarkdownPreview.css";
import Outline from "./Outline";
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

type HeadingItem = { id: string; text: string; level: number };

const MermaidBlock: React.FC<{ code: string }> = ({ code }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    let cid = "";
    if (ref.current) {
      cid = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
      mermaid
        .render(cid, code)
        .then(({ svg }) => {
          if (ref.current) ref.current.innerHTML = svg;
        })
        .catch(() => {
          if (ref.current) ref.current.innerText = "Mermaid Error";
        });
    }
    return () => {
      // no-op cleanup
    };
  }, [code]);
  return <div ref={ref} className="mermaid" />;
};

const CodeBlock: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className, children }) => {
  const codeText = String(children).replace(/\n$/, "");
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (preRef.current) {
      const codeEl = preRef.current.querySelector("code");
      if (codeEl) Prism.highlightElement(codeEl as HTMLElement);
    }
  }, [codeText]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      const ta = document.createElement("textarea");
      ta.value = codeText;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1200);
      } finally {
        document.body.removeChild(ta);
      }
    }
  };

  return (
    <div className="code-block" ref={preRef}>
      <pre className={className}>
        <code>{codeText}</code>
      </pre>
      <button className="code-copy" onClick={handleCopy} aria-label="Copy code">
        {copied ? <FiCheck /> : <FiCopy />}
      </button>
    </div>
  );
};

const MarkdownPreview: React.FC<Props> = ({ content }) => {
  const previewRef = useRef<HTMLDivElement | null>(null);
  const headingsRef = useRef<HeadingItem[]>([]);
  const [outline, setOutline] = useState<HeadingItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const root = previewRef.current || document.querySelector(".markdown-body");
    if (!root) return;

    const headings = Array.from(
      root.querySelectorAll("h1,h2,h3,h4,h5,h6")
    ) as HTMLElement[];
    headingsRef.current = [];

    const addToggle = (h: HTMLElement) => {
      if (h.querySelector(".fold-toggle")) return;
      const btn = document.createElement("button");
      btn.className = "fold-toggle";
      btn.setAttribute("aria-label", "Toggle fold");
      btn.innerHTML =
        '<svg viewBox="0 0 24 24" width="12" height="12" aria-hidden><path d="M8 10l4 4 4-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

      btn.setAttribute(
        "aria-expanded",
        (!h.classList.contains("collapsed")).toString()
      );

      btn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        const level = Number(h.tagName.charAt(1));
        let sib = h.nextElementSibling;
        const collapsed = h.classList.toggle("collapsed");
        btn.setAttribute("aria-expanded", (!collapsed).toString());
        while (sib) {
          if (/H[1-6]/.test(sib.tagName)) {
            const nextLevel = Number(sib.tagName.charAt(1));
            if (nextLevel <= level) break;
          }
          if (collapsed) sib.classList.add("collapsed-section");
          else sib.classList.remove("collapsed-section");
          sib = sib.nextElementSibling;
        }
      });
      h.insertBefore(btn, h.firstChild);
    };

    headings.forEach((h) => {
      const text = h.textContent ? h.textContent.trim() : "";
      const id =
        h.id ||
        text
          .toLowerCase()
          .replace(/[^^\w\- ]+/g, "")
          .replace(/\s+/g, "-");
      const level = Number(h.tagName.charAt(1));
      headingsRef.current.push({ id, text, level });
      if (!h.id) h.id = id;
      addToggle(h);
    });

    setOutline(headingsRef.current.slice());

    return () => {
      headings.forEach((h) => {
        const btn = h.querySelector(".fold-toggle");
        if (btn) btn.remove();
      });
    };
  }, [content]);

  useEffect(() => {
    const container = previewRef.current || document;
    let raf = 0;

    const updateActive = () => {
      const headings = Array.from(
        (previewRef.current || document).querySelectorAll("h1,h2,h3,h4,h5,h6")
      ) as HTMLElement[];
      let current: string | null = null;
      const topMargin = 80;
      for (const h of headings) {
        const rect = h.getBoundingClientRect();
        if (rect.top <= topMargin) current = h.id || null;
      }
      setActiveId((prev) => (current !== prev ? current : prev));
    };

    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(updateActive);
    };

    (container as Element | Document).addEventListener(
      "scroll",
      onScroll as EventListener,
      { passive: true } as any
    );
    window.addEventListener("resize", onScroll);
    updateActive();

    return () => {
      (container as Element | Document).removeEventListener(
        "scroll",
        onScroll as EventListener
      );
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [content]);

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    const container =
      previewRef.current || document.querySelector(".markdown-body");
    if (el && container) {
      const ctr = container as HTMLElement;
      const elRect = el.getBoundingClientRect();
      const ctrRect = ctr.getBoundingClientRect();
      const offset = elRect.top - ctrRect.top + ctr.scrollTop - 12;
      ctr.scrollTo({ top: offset, behavior: "smooth" });
      setActiveId(id);
    }
  };

  return (
    <div className="preview-with-outline">
      <div
        className="markdown-body"
        ref={previewRef as React.RefObject<HTMLDivElement>}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
        >
          {content}
        </ReactMarkdown>
      </div>
      <Outline
        headings={outline}
        activeId={activeId || undefined}
        onClick={scrollToId}
      />
    </div>
  );
};

export default MarkdownPreview;
