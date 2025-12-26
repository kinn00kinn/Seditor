declare module '@tauri-apps/api/shell' {
  /**
   * Open the given target in the system's default handler (URL, file, or array of paths).
   * This is a minimal declaration to satisfy TypeScript checks in this project.
   */
  export function open(target: string | string[]): Promise<void>;

  const _default: {
    open: (target: string | string[]) => Promise<void>;
  };

  export default _default;
}
