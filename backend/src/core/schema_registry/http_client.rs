use async_trait::async_trait;
use log::warn;
use reqwest::{
    header::{HeaderMap, CONTENT_TYPE},
    RequestBuilder,
};
use serde::{de::DeserializeOwned, Serialize};

use super::BasicAuth;

#[derive(Debug, PartialEq, Eq)]
pub enum HttpClientError {
    Unknown(String),
    Decode(String),
    Code(u16),
}

pub(super) type Result<T> = std::result::Result<T, HttpClientError>;

#[async_trait]
pub trait HttpClient: Sync + Send {
    async fn get<T: 'static + DeserializeOwned>(&self, url: &str) -> Result<T>;
    async fn delete(&self, url: &str) -> Result<()>;
    async fn post<T: Serialize + Send + Sync>(&self, url: &str, data: T) -> Result<()>;
    async fn put<T: Serialize + Send + Sync, R: 'static + DeserializeOwned>(&self, url: &str, data: T) -> Result<R>;
}

pub struct ReqwestClient {
    client: reqwest::Client,
    timeout_seconds: u64,
    auth: Option<BasicAuth>,
}

#[async_trait]
impl HttpClient for ReqwestClient {
    async fn post<T: Serialize + Send + Sync>(&self, url: &str, data: T) -> Result<()> {
        let request = self
            .client
            .post(url.to_string())
            .body(serde_json::to_string(&data).unwrap())
            .headers({
                let mut h = HeaderMap::new();
                h.insert(CONTENT_TYPE, "application/json".parse().unwrap());
                h
            });
        let response = self.send_request(request).await?;
        if response.status().is_success() {
            Ok(())
        } else {
            let error_code = response.status().as_u16();
            let text = response.text().await.unwrap();
            warn!("Unable to create a schema {:?}", text);
            Err(HttpClientError::Code(error_code))
        }
    }

    async fn put<T: Serialize + Send + Sync, R: 'static + DeserializeOwned>(&self, url: &str, data: T) -> Result<R> {
        let request = self
            .client
            .put(url.to_string())
            .body(serde_json::to_string(&data).unwrap())
            .headers({
                let mut h = HeaderMap::new();
                h.insert(CONTENT_TYPE, "application/json".parse().unwrap());
                h
            });
        let response = self.send_request(request).await?;
        if response.status().is_success() {
            let res = response.json().await?;
            Ok(res)
        } else {
            let error_code = response.status().as_u16();
            let text = response.text().await.unwrap();
            warn!("Unable to create a schema {:?}", text);
            Err(HttpClientError::Code(error_code))
        }
    }

    async fn get<T: 'static + DeserializeOwned>(&self, url: &str) -> Result<T> {
        let request = self.client.get(url.to_string());
        let response = self.send_request(request).await?;
        if response.status().is_success() {
            let res = response.json().await?;
            Ok(res)
        } else {
            Err(HttpClientError::Code(response.status().as_u16()))
        }
    }

    async fn delete(&self, url: &str) -> Result<()> {
        let request = self.client.delete(url.to_string());
        let response = self.send_request(request).await?;
        if response.status().is_success() {
            Ok(())
        } else {
            Err(HttpClientError::Code(response.status().as_u16()))
        }
    }
}

impl ReqwestClient {
    pub fn new(auth: Option<BasicAuth>) -> Self {
        Self {
            client: Default::default(),
            timeout_seconds: 10,
            auth,
        }
    }

    async fn send_request(&self, mut request: RequestBuilder) -> Result<reqwest::Response> {
        request = request.timeout(core::time::Duration::from_secs(self.timeout_seconds));
        if let Some(auth) = &self.auth {
            request = request.basic_auth(auth.username.to_owned(), auth.password.to_owned());
        }
        Ok(request.send().await?)
    }
}

impl From<reqwest::Error> for HttpClientError {
    fn from(err: reqwest::Error) -> Self {
        if let Some(error_code) = err.status() {
            HttpClientError::Code(error_code.as_u16())
        } else if err.is_decode() {
            HttpClientError::Decode(err.to_string())
        } else {
            HttpClientError::Unknown(err.to_string())
        }
    }
}

#[cfg(test)]
mod tests {
    use httpmock::{
        Method::{GET, POST},
        MockServer,
    };
    use serde::Deserialize;

    use crate::core::schema_registry::http_client::HttpClientError;

    use super::{HttpClient, ReqwestClient};

    #[tokio::test]
    async fn test_post_request() {
        let server = MockServer::start();
        let sut = ReqwestClient::new(None);
        // return Ok when the request is successful
        {
            let server_mock = server.mock(|when, then| {
                when.method(POST).path("/happy_path");
                then.status(200);
            });
            let res = sut.post(server.url("/happy_path").as_str(), &"{}").await;
            assert!(res.is_ok(), "Received {:?}", res);
            server_mock.assert();
        }
        // return the error code if any
        {
            let server_mock = server.mock(|when, then| {
                when.method(POST).path("/not_found");
                then.status(404);
            });
            let res = sut.post(server.url("/not_found").as_str(), &"{}").await;
            assert_eq!(res.err().unwrap(), HttpClientError::Code(404));
            server_mock.assert();
        }
    }

    #[tokio::test]
    async fn test_get_request() {
        let server = MockServer::start();
        let sut = ReqwestClient::new(None);
        #[derive(Deserialize, Debug)]
        struct MockResponse {
            id: String,
        }
        // return Ok when the request is successful
        {
            let server_mock = server.mock(|when, then| {
                when.method(GET).path("/happy_path");
                then.status(200)
                    .header("content-type", "text/json")
                    .body("{\"id\":\"123\"}");
            });
            let res = sut.get::<MockResponse>(server.url("/happy_path").as_str()).await;
            assert!(res.is_ok());
            assert_eq!(res.unwrap().id, "123");
            server_mock.assert();
        }
        // return deserialization error if an unexpected body is received
        {
            let server_mock = server.mock(|when, then| {
                when.method(GET).path("/invalid_response");
                then.status(200)
                    .header("content-type", "text/json")
                    .body("{\"unknown_field\":\"123\"}");
            });
            let res = sut.get::<MockResponse>(server.url("/invalid_response").as_str()).await;
            assert!(res.is_err());
            assert!(matches!(res.err().unwrap(), HttpClientError::Decode(..)));
            server_mock.assert();
        }
        // return the error code if any
        {
            let server_mock = server.mock(|when, then| {
                when.method(GET).path("/not_found");
                then.status(404);
            });
            let res = sut.get::<MockResponse>(server.url("/not_found").as_str()).await;
            assert_eq!(res.err().unwrap(), HttpClientError::Code(404));
            server_mock.assert();
        }
    }
}
