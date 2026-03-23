export function isTauriRuntime(): boolean {
  return (
    typeof window !== "undefined" &&
    "__TAURI_INTERNALS__" in window
  );
}

export function openExternalLink(url: string) {
  if (isTauriRuntime()) {
    return import("@tauri-apps/plugin-opener").then(({ openUrl }) => openUrl(url));
  }

  window.open(url, "_blank", "noopener,noreferrer");
  return Promise.resolve();
}

export function openLocalPath(path: string) {
  if (isTauriRuntime()) {
    return import("@tauri-apps/plugin-opener").then(({ openPath }) => openPath(path));
  }

  window.open(path, "_blank", "noopener,noreferrer");
  return Promise.resolve();
}

export function revealInFileManager(path: string) {
  if (!isTauriRuntime()) {
    return Promise.resolve();
  }

  return import("@tauri-apps/plugin-opener").then(({ revealItemInDir }) =>
    revealItemInDir(path)
  );
}
