use rdkafka::error::KafkaError;
use serde::{ Serialize, Deserialize };

pub type Result<T> = std::result::Result<T, TauriError>;

#[derive(Debug, Serialize, Deserialize)]
pub struct TauriError {
    #[serde(rename = "errorType")]
    pub error_type: String,
    pub message: String,
}

impl From<std::io::Error> for TauriError {
    fn from(error: std::io::Error) -> Self {
        TauriError {
            error_type: "IO error".to_owned(),
            message: error.to_string(),
        }
    }
}

impl From<serde_json::Error> for TauriError {
    fn from(error: serde_json::Error) -> Self {
        TauriError {
            error_type: "JSON Serde error".to_owned(),
            message: error.to_string(),
        }
    }
}

impl From<KafkaError> for TauriError {
    fn from(error: KafkaError) -> Self {
        TauriError {
            error_type: "Kafka client error".to_owned(),
            message: error.to_string(),
        }
    }
}

impl From<reqwest::Error> for TauriError {
    fn from(error: reqwest::Error) -> Self {
        TauriError {
            error_type: "HTTP client error".to_owned(),
            message: error.to_string(),
        }
    }
}

impl From<url::ParseError> for TauriError {
    fn from(error: url::ParseError) -> Self {
        TauriError {
            error_type: "Url parsing".to_owned(),
            message: error.to_string(),
        }
    }
}