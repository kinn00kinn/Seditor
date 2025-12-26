declare module '@tauri-apps/api/shell' {
  export function open(target: string | string[]): Promise<void>;
  const _default: { open: (target: string | string[]) => Promise<void> };
  export default _default;
}
