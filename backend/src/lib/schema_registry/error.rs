use super::http_client::HttpClientError;

#[derive(Debug)]
pub enum SchemaRegistryError {
    SchemaNotFound(String),
    SchemaParsing(String),
    HttpClient(String),
    InvalidUrl,
}

pub type SchemaRegistryResult<T> = core::result::Result<T, SchemaRegistryError>;

impl From<url::ParseError> for SchemaRegistryError {
    fn from(_: url::ParseError) -> Self {
        Self::InvalidUrl
    }
}

// impl ToString for SchemaRegistryError {
//     fn to_string(&self) -> String {
//         match self {
//             SchemaRegistryError::HttpClient(msg) => msg.into(),
//             SchemaRegistryError::SchemaParsing(msg) => msg.into(),
//             SchemaRegistryError::SchemaNotFound(msg) => msg.into(),
//             SchemaRegistryError::InvalidUrl => "Invalid URL".into(),
//         }
//     }
// }

impl From<HttpClientError> for SchemaRegistryError {
    fn from(err: HttpClientError) -> Self {
        SchemaRegistryError::HttpClient(format!("Http client error {:?}", err))
    }
}
