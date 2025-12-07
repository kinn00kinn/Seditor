# Seditor

![Tauri](https://img.shields.io/badge/Tauri-v2-24C8D5?logo=tauri&logoColor=white)
![React](https://img.shields.io/badge/React-v18-61DAFB?logo=react&logoColor=black)
![Rust](https://img.shields.io/badge/Rust-1.70%2B-000000?logo=rust&logoColor=white)

**Seditor** は、"サクラエディタ" のような軽快な動作と、"Obsidian" のようなリッチなプレビュー機能を兼ね備えた、Tauri 製の次世代 Markdown エディタです。
「起動 1 秒以内」の爆速動作と、ローカルファーストなデータ管理を重視して開発されました。

## ✨ Features

- **⚡ Blazing Fast:** Tauri (Rust) バックエンドによる圧倒的な起動速度と省メモリ動作。
- **🔄 Dual Mode:** `Ctrl+E` で瞬時に切り替わる「Source Mode (編集)」と「Reading Mode (閲覧)」。
- **📝 Rich Markdown Support:**
  - **数式:** KaTeX 対応 ($E=mc^2$)
  - **ダイアグラム:** Mermaid 対応（フローチャート、シーケンス図など）
  - **表:** GFM (GitHub Flavored Markdown) テーブル対応
  - **画像:** ローカル/Web 画像のプレビュー
- **🔍 Advanced Search:** 正規表現（Regex）に対応した検索・置換機能。
- **⌨️ Keyboard Driven:** マウスに触れずに主要な操作が完結するキーバインド設計。
- **📄 File Associations:** `.md` ファイルに関連付け可能。エクスプローラーから直接起動。
- **🖨️ Export:** 閲覧モードからの PDF 保存/印刷機能。

## 🚀 Shortcuts

| Key                    | Action          | Description                                   |
| :--------------------- | :-------------- | :-------------------------------------------- |
| `Ctrl` + `E`           | **Toggle Mode** | 編集モードとプレビューモードを切り替えます    |
| `Ctrl` + `S`           | **Save**        | 上書き保存（新規の場合はダイアログ表示）      |
| `Ctrl` + `Shift` + `S` | **Save As**     | 名前を付けて保存                              |
| `Ctrl` + `O`           | **Open**        | ファイルを開く                                |
| `Ctrl` + `F`           | **Find**        | 検索パネルを表示（正規表現対応）              |
| `Ctrl` + `P`           | **Print / PDF** | 印刷または PDF として保存（プレビュー時のみ） |
| `Tab`                  | **Indent**      | リストのネスト（字下げ）                      |
| `Shift` + `Tab`        | **Unindent**    | ネスト解除                                    |

## 🛠️ Tech Stack

- **Core:** [Tauri v2](https://tauri.app/) (Rust)
- **Frontend:** React + TypeScript + Vite
- **Editor Engine:** CodeMirror 6
- **Renderer:** react-markdown, remark-gfm, remark-math, rehype-katex, mermaid

## 💻 Development

### Prerequisites

- Node.js (LTS)
- Rust (Cargo)
- C++ Build Tools (Windows)

### Setup & Run

```bash
# Install dependencies
npm install

# Run in development mode
npm run tauri dev
```

### Build

```bash
# Build for production (exe/msi)
npm run tauri build
```

## 📦 Installation

Releases ページからインストーラー (`.exe` または `.msi`) をダウンロードして実行してください。
