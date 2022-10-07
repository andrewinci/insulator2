pub mod admin;
pub mod configuration;
pub mod consumer;
mod error;
mod notification;
pub mod schema_registry;

pub use notification::notify_error;