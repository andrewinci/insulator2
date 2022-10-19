#[derive(Debug)]
pub enum SchemaRegistryError {
    HttpClientError { msg: String },
    UrlError,
}

pub type Result<T> = core::result::Result<T, SchemaRegistryError>;

impl From<reqwest::Error> for SchemaRegistryError {
    fn from(err: reqwest::Error) -> Self {
        Self::HttpClientError { msg: err.to_string() }
    }
}

impl From<url::ParseError> for SchemaRegistryError {
    fn from(_: url::ParseError) -> Self {
        Self::UrlError
    }
}

impl ToString for SchemaRegistryError {
    fn to_string(&self) -> String {
        match self {
            SchemaRegistryError::HttpClientError { msg } => msg.into(),
            SchemaRegistryError::UrlError => "Invalid URL".into(),
        }
    }
}
