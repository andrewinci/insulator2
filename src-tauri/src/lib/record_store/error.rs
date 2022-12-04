use crate::lib::Error;
use rusqlite::{ffi, Error as SqlError};

impl From<SqlError> for Error {
    fn from(error: SqlError) -> Self {
        Error::SqlError {
            message: match error {
                SqlError::SqliteFailure(ffi::Error { code, .. }, ..) => match code {
                    rusqlite::ErrorCode::OperationInterrupted => "Operation timed out".into(),
                    _ => format!("{} {:?}", error, code),
                },
                _ => error.to_string(),
            },
        }
    }
}
