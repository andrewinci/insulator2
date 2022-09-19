#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]

mod configuration;
use configuration::{ Cluster, InsulatorConfig, Theme };

#[tauri::command]
fn get_configuration() -> Result<InsulatorConfig, String> {
    configuration::get_configuration()
}

#[tauri::command]
fn add_cluster(cluster: Cluster) -> Result<InsulatorConfig, String> {
    configuration::add_cluster(cluster)
}

#[tauri::command]
fn set_theme(theme: Theme) -> Result<(), String> {
    configuration::set_theme(theme)
}

fn main() {
    tauri::Builder
        ::default()
        .invoke_handler(tauri::generate_handler![get_configuration, add_cluster, set_theme])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}