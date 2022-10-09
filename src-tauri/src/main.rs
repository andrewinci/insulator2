#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]
extern crate log;
mod api;
mod configuration;
mod kafka;
mod schema_registry;
mod lib;

use api::consumer::AppConsumers;
use crate::api::{
    admin::list_topic,
    configuration::{ get_configuration, write_configuration },
    consumer::{ get_consumer_state, get_record, start_consumer, stop_consumer },
    schema_registry::{ get_schema, list_subjects },
};

fn main() {
    env_logger::init();
    tauri::Builder
        ::default()
        .manage(AppConsumers::default())
        .invoke_handler(
            tauri::generate_handler![
                get_configuration,
                write_configuration,
                list_topic,
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