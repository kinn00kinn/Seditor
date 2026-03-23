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
