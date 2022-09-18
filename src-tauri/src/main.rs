#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod configuration;
use configuration::{Cluster, InsulatorConfig};

#[tauri::command]
fn get_configuration() -> Result<InsulatorConfig, String> {
    configuration::get_configuration()
}

#[tauri::command]
fn add_cluster(cluster: Cluster) -> Result<InsulatorConfig, String> {
    configuration::add_cluster(cluster)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_configuration, add_cluster])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
