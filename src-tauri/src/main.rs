#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]

mod configuration;
mod kafka;
mod schema_registry;
mod error;

use crate::{
    kafka::{
        admin::{ list_topics },
        consumer::{ AppConsumers, start_consumer, stop_consumer, get_record, get_consumer_state },
    },
    configuration::{ get_configuration, write_configuration },
    schema_registry::{ list_subjects, get_schema },
};

fn main() {
    tauri::Builder
        ::default()
        .manage(AppConsumers::default())
        .invoke_handler(
            tauri::generate_handler![
                get_configuration,
                write_configuration,
                list_topics,
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