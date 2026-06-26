# Seditor Agent Notes

## Product Context

Seditor is a lightweight desktop Markdown editor built with Tauri, React, and CodeMirror. The product direction is local-first editing with fast startup, reliable file handling, and a high-quality Markdown preview.

Important user-facing surfaces:

- Markdown editing with CodeMirror 6.
- Preview with GFM, KaTeX, Mermaid, syntax highlighting, task lists, links, and an outline.
- Recent files, session restore, reload from disk, save/save-as, and unsaved-change protection.
- Appearance settings for accent color, font, font size, line wrapping, long-line handling, auto save, and custom CSS.

## Local Commands

```bash
npm install
npm run dev
npm run check
npm test
npm run tauri dev
```

`npm run check` runs TypeScript without emitting files. `npm test` runs Rust tests through `cargo test --manifest-path src-tauri/Cargo.toml`.

## Implementation Notes

- Keep the editor local-first. Do not add cloud, account, telemetry, or remote persistence behavior unless explicitly requested.
- Use existing React/Tailwind patterns and the shared UI components in `src/components/ui`.
- Tauri APIs should stay behind small utility or hook boundaries when possible.
- Settings are persisted in `localStorage` under `seditor:*` keys.
- Avoid permission prompts on initial render. Ask for OS-level capabilities only from an explicit user action.
- Preview outline should remain stable and predictable. Avoid width-zero animated sidebars or layout shifts that make the reading area jump unexpectedly.
- Long-line handling must not hide content. Word wrap is on by default and should use CodeMirror line wrapping, matching VS Code-style right-edge wrapping.

## Docs Summary

The README positions Seditor as a native-feeling Markdown editor with rich preview quality similar to note-taking apps. The competitive review highlights recent files, session restore, status information, and future candidates such as multi-document tabs, spellcheck, split editor/preview mode, and export presets.

When changing UX, prioritize the workflows implied by those docs: opening files quickly, preserving work safely, reading Markdown comfortably, and keeping controls low-friction.
