export const MAX_RECENT_FILES = 8;

export interface DocumentStats {
  lines: number;
  words: number;
  characters: number;
}

export function buildDocumentStats(content: string): DocumentStats {
  const normalized = content.replace(/\r\n/g, "\n");
  const words = normalized.trim() ? normalized.trim().split(/\s+/).length : 0;

  return {
    lines: normalized.length === 0 ? 1 : normalized.split("\n").length,
    words,
    characters: content.length,
  };
}

export function normalizeRecentFiles(paths: string[]): string[] {
  const seen = new Set<string>();
  const items: string[] = [];

  for (const path of paths) {
    const normalized = path.trim();
    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    items.push(normalized);

    if (items.length >= MAX_RECENT_FILES) {
      break;
    }
  }

  return items;
}

export function addRecentFile(paths: string[], nextPath: string): string[] {
  return normalizeRecentFiles([nextPath, ...paths]);
}

export function fileNameFromPath(path: string | null): string {
  if (!path) {
    return "Untitled";
  }

  return path.split(/[\\/]/).pop() || path;
}

export function directoryFromPath(path: string | null): string | null {
  if (!path) {
    return null;
  }

  const normalized = path.replace(/\\/g, "/");
  const index = normalized.lastIndexOf("/");
  return index >= 0 ? normalized.slice(0, index) : null;
}

export function resolveLinkPath(baseFilePath: string | null, href: string): string {
  if (/^[a-zA-Z]:[\\/]/.test(href) || href.startsWith("/") || href.startsWith("\\")) {
    return href;
  }

  const baseDir = directoryFromPath(baseFilePath);
  if (!baseDir) {
    return href;
  }

  const parts = `${baseDir}/${href}`.split("/");
  const resolved: string[] = [];

  for (const part of parts) {
    if (!part || part === ".") {
      continue;
    }

    if (part === "..") {
      resolved.pop();
      continue;
    }

    resolved.push(part);
  }

  const prefix = baseDir.startsWith("//") ? "//" : /^[a-zA-Z]:/.test(baseDir) ? "" : "/";
  return `${prefix}${resolved.join("/")}`;
}

export function toggleTaskMarker(
  content: string,
  taskIndex: number,
  checked: boolean
): string {
  let currentIndex = -1;

  return content.replace(/^(\s*[-*+]\s+\[)( |x|X)(\])/gm, (match, prefix, _state, suffix) => {
    currentIndex += 1;
    if (currentIndex !== taskIndex) {
      return match;
    }

    return `${prefix}${checked ? "x" : " "}${suffix}`;
  });
}
