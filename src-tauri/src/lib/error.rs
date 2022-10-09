pub enum Error {
    AvroParse {
        message: String,
    },
    IOError {
        message: String,
    },
    JSONSerdeError {
        message: String,
    },
}

pub(super) type Result<T> = core::result::Result<T, Error>;

impl From<std::io::Error> for Error {
    fn from(error: std::io::Error) -> Self {
        Error::IOError {
            message: error.to_string(),
        }
    }
}

impl From<serde_json::Error> for Error {
    fn from(error: serde_json::Error) -> Self {
        Error::JSONSerdeError {
            message: error.to_string(),
        }
    }
}