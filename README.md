# Seditor

![Tauri](https://img.shields.io/badge/Tauri-v2-24C8D5?logo=tauri&logoColor=white)
![React](https://img.shields.io/badge/React-v19-61DAFB?logo=react&logoColor=black)
![Rust](https://img.shields.io/badge/Rust-stable-000000?logo=rust&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

![](./screenshot.png)

Seditor is a lightweight desktop Markdown editor built with Tauri, React, and CodeMirror. It aims for the startup speed of a native text editor and the preview quality of note-taking apps such as Obsidian.

## Features

- Fast startup and low memory usage with Tauri v2
- Markdown editing with CodeMirror 6
- Rich preview with GFM, KaTeX, Mermaid, syntax highlighting, and heading outline
- File association support for `.md`, `.markdown`, and `.txt`
- Recent files, reload from disk, and unsaved-change protection
- Auto save, Save As, print / PDF export, search, replace, and line move operations
- Appearance customization for fonts, accent color, wrapping, and custom CSS
- Local-first workflow with no cloud dependency

## Shortcuts

| Key | Action |
| :--- | :--- |
| `Ctrl+O` | Open file |
| `Ctrl+S` | Save |
| `Ctrl+Shift+S` | Save As |
| `Ctrl+E` | Toggle editor / preview |
| `Ctrl+F` | Find / replace |
| `Ctrl+P` | Print / export PDF |

## Development

### Requirements

- Node.js LTS
- Rust toolchain
- Microsoft C++ Build Tools on Windows

### Setup

```bash
npm install
npm run tauri dev
```

### Quality checks

```bash
npm run check
npm test
```

### Production build

```bash
npm run tauri build
```

## Project status

Current repository improvements include:

- startup-file opening fixed on the Tauri side
- editor content synchronization fixed
- recent files and auto save added
- reload-from-disk workflow added
- status bar added
- Rust unit tests added for startup argument parsing

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

This project is licensed under the [MIT License](./LICENSE).
