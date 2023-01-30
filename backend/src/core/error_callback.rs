use std::sync::Arc;

pub type ErrorCallback<T> = Arc<dyn Fn(T) + Send + Sync>;
