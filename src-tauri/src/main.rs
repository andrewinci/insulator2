#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]

mod api;
mod configuration;
mod error;
mod kafka;
mod schema_registry;

use crate::{
    api::{ configuration::{ get_configuration, write_configuration }, schema_registry::{ get_schema, list_subjects } },
    kafka::{
        admin::list_topic,
        consumer::{ get_consumer_state, get_record, start_consumer, stop_consumer, AppConsumers },
    },
};

fn main() {
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