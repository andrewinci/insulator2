use std::time::Duration;

use super::{ error::Result, types::BasicAuth };
use futures::{ future::BoxFuture, FutureExt };
use serde::de::DeserializeOwned;

pub trait HttpClient {
    fn get<T: DeserializeOwned>(&self, url: String, auth: Option<BasicAuth>) -> BoxFuture<Result<T>>;
}

pub struct ReqwestClient {
    timeout_seconds: Duration,
}

impl ReqwestClient {
    pub fn new(tmo_seconds: Option<u64>) -> ReqwestClient {
        ReqwestClient {
            timeout_seconds: Duration::from_secs(tmo_seconds.unwrap_or(5)),
        }
    }
}

impl HttpClient for ReqwestClient {
    fn get<T: DeserializeOwned>(&self, url: String, auth: Option<BasicAuth>) -> BoxFuture<Result<T>> {
        (
            async move {
                let client = reqwest::Client::new();
                let mut request = client.get(url);
                request = request.timeout(self.timeout_seconds);
                if let Some(auth) = auth {
                    request = request.basic_auth(auth.username, auth.password);
                }
                let response = request.send().await?;
                let res = response.json().await?;
                Ok(res)
            }
        ).boxed()
    }
}