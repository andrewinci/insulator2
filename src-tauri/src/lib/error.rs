pub enum Error {
    AvroParse {
        message: String,
    },
}

pub type Result<T> = core::result::Result<T, Error>;