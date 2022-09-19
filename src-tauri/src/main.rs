#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]

mod configuration;
use configuration::{ InsulatorConfig };

#[tauri::command]
fn get_configuration() -> Result<InsulatorConfig, String> {
    configuration::get_configuration()
}

#[tauri::command]
fn write_configuration(config: InsulatorConfig) -> Result<InsulatorConfig, String> {
    configuration::write_configuration(&config).and_then(|_| Ok(config))
}

fn main() {
    tauri::Builder
        ::default()
        .invoke_handler(tauri::generate_handler![get_configuration, write_configuration])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}