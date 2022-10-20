#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]
extern crate log;
mod api;
mod lib;

use crate::api::{
    admin::{create_topic, describe_consumer_group, list_consumer_groups, list_topics},
    configuration::{get_configuration, write_configuration},
    consumer::{get_consumer_state, get_record, start_consumer, stop_consumer},
    schema_registry::{get_schema, list_subjects},
};
use api::AppState;

fn main() {
    env_logger::init();
    tauri::Builder::default()
        .manage(AppState::default())
        .invoke_handler(tauri::generate_handler![
            // consumer
            start_consumer,
            stop_consumer,
            get_record,
            get_consumer_state,
            // schema
            list_subjects,
            get_schema,
            // config
            get_configuration,
            write_configuration,
            // admin
            list_topics,
            create_topic,
            list_consumer_groups,
            describe_consumer_group
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
