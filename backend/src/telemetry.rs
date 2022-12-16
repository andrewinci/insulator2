use std::time::{SystemTime, UNIX_EPOCH};

use log::debug;
use serde::Serialize;
#[derive(Serialize, Debug)]
struct GraphiteMetric {
    // Graphite style name (required)
    name: String,
    // the resolution of the metric in seconds (required)
    interval: u32,
    // float64 value (required)
    value: i32,
    // unix timestamp in seconds (required)
    time: u64,
    // list of key=value pairs of tags (optional)
    tags: Vec<String>,
}

pub fn log_active_user() {
    let url = "https://graphite-prod-01-eu-west-0.grafana.net/graphite/metrics";
    if let Some(token) = std::option_env!("GRAPHITE_TOKEN") {
        debug!("Telemetry log active user");
        let metrics = vec![GraphiteMetric {
            name: "insulator2.active_user".into(),
            interval: 1,
            value: 1,
            time: SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs(),
            tags: vec![get_locale_tag(), get_os_tag()],
        }];
        let client = reqwest::blocking::Client::new();
        let res = client.post(url).bearer_auth(token).json(&metrics).send();
        debug!("Telemetry send result: {:?}", res);
    }
}

fn get_locale_tag() -> String {
    use sys_locale::get_locale;
    format!("locale={}", get_locale().unwrap_or_else(|| String::from("unknown")))
}

fn get_os_tag() -> String {
    format!("os={}", std::env::consts::OS)
}
