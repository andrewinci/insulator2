use std::{collections::HashMap, sync::Arc};

use log::debug;
use tauri::Manager;
use tokio::sync::RwLock;

use crate::core::{
    configuration::ConfigurationProvider, error_callback::ErrorCallback, schema_registry::CachedSchemaRegistry,
};

use super::{
    cluster::Cluster,
    error::{ApiError, ApiResult},
};

type ClusterId = String;

pub struct AppState {
    clusters: Arc<RwLock<HashMap<ClusterId, Arc<Cluster>>>>,
    pub configuration_provider: Arc<ConfigurationProvider>,
    error_callback: ErrorCallback<ApiError>,
}

impl AppState {
    pub fn new(app_handle: tauri::AppHandle) -> Self {
        AppState {
            clusters: Default::default(),
            configuration_provider: Arc::new(ConfigurationProvider::new()),
            error_callback: Arc::new(move |err| {
                app_handle.emit_all("error", err).ok();
            }),
        }
    }

    pub async fn get_cluster(&self, cluster_id: &str) -> ApiResult<Arc<Cluster>> {
        {
            if let Some(cluster) = self.clusters.read().await.get(cluster_id) {
                return Ok(cluster.clone());
            }
        }
        {
            debug!("Init cluster {}", cluster_id);
            let cluster = self.build_new_cluster(cluster_id, self.error_callback.clone())?;
            let cluster = Arc::new(cluster);
            self.clusters.write().await.insert(cluster_id.into(), cluster.clone());
            Ok(cluster)
        }
    }

    pub async fn get_schema_reg_client(&self, cluster_id: &str) -> ApiResult<Option<Arc<CachedSchemaRegistry>>> {
        let cluster = self.get_cluster(cluster_id).await?;
        Ok(cluster.schema_registry_client.as_ref().cloned())
    }

    fn build_new_cluster(&self, cluster_id: &str, error_callback: ErrorCallback<ApiError>) -> ApiResult<Cluster> {
        debug!("Init cluster {}", cluster_id);
        let configuration = self.configuration_provider.get_configuration()?;
        Cluster::new(cluster_id, &configuration, error_callback)
    }
}
