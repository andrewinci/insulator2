#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]
extern crate log;

#[cfg(feature = "integration_tests")]
mod integration_tests;

mod api;
mod core;
mod telemetry;

use crate::api::{
    admin::{
        create_topic, delete_consumer_group, delete_topic, describe_consumer_group, get_consumer_group_state,
        get_last_offsets, get_topic_info, list_consumer_groups, list_topics, set_consumer_group,
    },
    configuration::{get_configuration, write_configuration},
    consumer::{export_records, get_consumer_state, get_records_page, start_consumer, stop_consumer},
    producer::produce_record,
    schema_registry::{delete_subject, delete_subject_version, get_subject, list_subjects, post_schema},
    utils::{export_datastore, parse_keystore, parse_truststore},
};
use api::AppState;
use log::debug;
use tauri::Manager;
use telemetry::log_active_user;

fn main() {
    env_logger::init();
    // rdkafka is opening a lot of FD and is hitting the limit on mac os.
    assert!(rlimit::increase_nofile_limit(10240).is_ok());
    log_active_user();
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            // utils
            export_datastore,
            parse_keystore,
            parse_truststore,
            // producer
            produce_record,
            // consumer
            start_consumer,
            stop_consumer,
            get_consumer_state,
            get_records_page,
            export_records,
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
        .setup(|app| {
            app.manage(AppState::new(app.app_handle()));
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
