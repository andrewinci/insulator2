use super::http_client::HttpClientError;

#[derive(Debug)]
pub enum SchemaRegistryError {
    SchemaParsing { message: String },
    HttpClient { message: String },
    InvalidUrl,
}

pub type Result<T> = core::result::Result<T, SchemaRegistryError>;

impl From<url::ParseError> for SchemaRegistryError {
    fn from(_: url::ParseError) -> Self {
        Self::InvalidUrl
    }
}

impl ToString for SchemaRegistryError {
    fn to_string(&self) -> String {
        match self {
            SchemaRegistryError::HttpClient { message: msg } => msg.into(),
            SchemaRegistryError::InvalidUrl => "Invalid URL".into(),
            SchemaRegistryError::SchemaParsing { message: msg } => msg.into(),
        }
    }
}

impl From<HttpClientError> for SchemaRegistryError {
    fn from(err: HttpClientError) -> Self {
        SchemaRegistryError::HttpClient {
            message: format!("Http client error {:?}", err),
        }
    }
}
