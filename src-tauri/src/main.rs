#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]

mod configuration;
mod kafka;

use crate::{ kafka::list_topics, configuration::{ get_configuration, write_configuration } };

fn main() {
    tauri::Builder
        ::default()
        .invoke_handler(
            tauri::generate_handler![get_configuration, write_configuration, list_topics]
        )
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}