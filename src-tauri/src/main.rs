// src-tauri/src/main.rs
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::env;

#[tauri::command]
fn get_startup_file() -> Option<String> {
    let args: Vec<String> = env::args().collect();
    // args[0]は実行ファイル自体のパスなので、args[1]をチェック
    if args.len() > 1 {
        Some(args[1].clone())
    } else {
        None
    }
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![get_startup_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
