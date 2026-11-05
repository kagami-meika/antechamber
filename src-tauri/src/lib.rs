use std::sync::Mutex;
use tauri::Manager;

pub mod db;
pub mod models;
pub mod commands;
#[cfg(test)]
mod db_test;

pub struct AppState {
    pub db: Mutex<db::Database>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let app_data_dir = app.path().app_data_dir().expect("failed to get app data dir");
            std::fs::create_dir_all(&app_data_dir).expect("failed to create app data dir");
            let db_path = app_data_dir.join("antechamber.db");
            
            let database = db::Database::new(db_path.to_str().unwrap()).expect("failed to init database");
            app.manage(AppState {
                db: Mutex::new(database),
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_cloisters,
            commands::create_cloister,
            commands::update_cloister,
            commands::delete_cloister,
            commands::get_presences,
            commands::create_presence,
            commands::update_presence,
            commands::delete_presence,
            commands::get_messages,
            commands::send_message,
            commands::edit_message,
            commands::delete_message,
            commands::search_messages,
            commands::export_json,
            commands::export_jsonl,
            commands::export_txt,
            commands::save_file_dialog,
            commands::restore_json
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
