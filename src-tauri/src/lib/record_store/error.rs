use crate::lib::Error;
use rusqlite::Error as SqlError;

impl From<SqlError> for Error {
    fn from(error: SqlError) -> Self {
        Error::SqlError {
            message: error.to_string(),
        }
    }
}
