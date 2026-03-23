use std::env;

fn startup_file_from_args(args: impl IntoIterator<Item = String>) -> Option<String> {
    args.into_iter().nth(1)
}

#[tauri::command]
fn get_startup_file() -> Option<String> {
    startup_file_from_args(env::args())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![get_startup_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::startup_file_from_args;

    #[test]
    fn extracts_the_first_file_argument() {
        let args = vec![
            "seditor.exe".to_string(),
            "C:/notes/today.md".to_string(),
            "--ignored".to_string(),
        ];

        assert_eq!(
            startup_file_from_args(args),
            Some("C:/notes/today.md".to_string())
        );
    }

    #[test]
    fn returns_none_without_a_file_argument() {
        let args = vec!["seditor.exe".to_string()];

        assert_eq!(startup_file_from_args(args), None);
    }
}
