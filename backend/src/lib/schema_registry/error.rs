use super::http_client::HttpClientError;

#[derive(Debug)]
pub enum SchemaRegistryError {
    SchemaNotFound(String),
    SchemaParsing(String),
    HttpClient(String),
    InvalidUrl(String),
}

pub type SchemaRegistryResult<T> = core::result::Result<T, SchemaRegistryError>;

impl From<url::ParseError> for SchemaRegistryError {
    fn from(url: url::ParseError) -> Self {
        Self::InvalidUrl(url.to_string())
    }
}
impl From<HttpClientError> for SchemaRegistryError {
    fn from(err: HttpClientError) -> Self {
        SchemaRegistryError::HttpClient(format!("Http client error {:?}", err))
    }
}
