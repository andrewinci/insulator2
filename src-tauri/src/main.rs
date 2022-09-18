#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod configuration;
use configuration::{Cluster, InsulatorConfig};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

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
        .invoke_handler(tauri::generate_handler![
            greet,
            get_configuration,
            add_cluster
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
