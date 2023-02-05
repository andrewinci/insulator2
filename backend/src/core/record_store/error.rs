use rusqlite::{ffi, Error as SqlError};

#[derive(Debug, PartialEq, Eq)]
pub enum StoreError {
    SqlError(String),
    IO(String),
    RecordParse(String),
}

pub type StoreResult<T> = Result<T, StoreError>;

impl From<SqlError> for StoreError {
    fn from(error: SqlError) -> Self {
        StoreError::SqlError(match error {
            SqlError::SqliteFailure(ffi::Error { code, .. }, ..) => match code {
                rusqlite::ErrorCode::OperationInterrupted => "Operation timed out".into(),
                _ => format!("{error} {code:?}"),
            },
            _ => error.to_string(),
        })
    }
}
impl From<std::io::Error> for StoreError {
    fn from(error: std::io::Error) -> Self {
        StoreError::IO(error.to_string())
    }
}
