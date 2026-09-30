use tauri_plugin_deep_link::DeepLinkExt;

pub mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_notification::init())
        .plugin(
            tauri_plugin_log::Builder::new()
                .level(tauri_plugin_log::log::LevelFilter::Info)
                .build(),
        )
        .plugin(tauri_plugin_single_instance::init(|_app, argv, _cwd| {
            println!(
                "a new Project Relive instance was opened with {argv:?}; the existing instance handled the request"
            );
        }))
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.deep_link().register_all()?;
            }
            Ok(())
        })
        .invoke_handler(
            tauri::generate_handler![
                commands::builds::search_for_version,
                commands::builds::check_file_exists_and_size,
                commands::builds::check_file_exists,
                commands::builds::launch,
                commands::builds::exit_all,
                commands::download::download_file_command,
                commands::download::get_file_size,
                commands::download::delete_file
            ]
        )
        .run(tauri::generate_context!())
        .expect("error while running Project Relive");
}
