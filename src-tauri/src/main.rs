#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]
extern crate log;
mod api;
mod lib;

use api::{ AppState };
use crate::api::{
    admin::{ list_topics, create_topic },
    configuration::{ get_configuration, write_configuration },
    consumer::{ get_consumer_state, get_record, start_consumer, stop_consumer },
    schema_registry::{ get_schema, list_subjects },
};

fn main() {
    env_logger::init();
    tauri::Builder
        ::default()
        .manage(AppState::default())
        .invoke_handler(
            tauri::generate_handler![
                get_configuration,
                write_configuration,
                list_topics,
                create_topic,
                list_subjects,
                get_schema,
                start_consumer,
                stop_consumer,
                get_record,
                get_consumer_state
            ]
        )
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}