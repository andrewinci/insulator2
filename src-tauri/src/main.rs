#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]
extern crate log;
mod api;
mod lib;

use crate::api::{
    admin::{
        create_topic, delete_consumer_group, delete_topic, describe_consumer_group, get_consumer_group_state,
        get_last_offsets, get_topic_info, list_consumer_groups, list_topics, set_consumer_group,
    },
    configuration::{get_configuration, write_configuration},
    consumer::{get_consumer_state, get_records_page, start_consumer, stop_consumer},
    schema_registry::{delete_subject, delete_subject_version, get_subject, list_subjects, post_schema},
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
            get_consumer_state,
            get_records_page,
            // schema
            list_subjects,
            get_subject,
            delete_subject,
            delete_subject_version,
            post_schema,
            // config
            get_configuration,
            write_configuration,
            // admin topics
            list_topics,
            get_topic_info,
            create_topic,
            delete_topic,
            get_last_offsets,
            // admin consumer groups
            get_consumer_group_state,
            list_consumer_groups,
            describe_consumer_group,
            set_consumer_group,
            delete_consumer_group,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
