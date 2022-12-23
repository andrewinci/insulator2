use std::{ collections::HashMap, sync::Arc, time::Duration };

use log::debug;
use tauri::Manager;
use tokio::sync::RwLock;

use crate::lib::{
    configuration::ConfigurationProvider,
    schema_registry::CachedSchemaRegistry,
    types::ErrorCallback,
    Cluster,
};

use super::error::TauriError;

type ClusterId = String;

pub struct AppState {
    clusters: Arc<RwLock<HashMap<ClusterId, Arc<Cluster>>>>,
    pub configuration_provider: Arc<ConfigurationProvider>,
    error_callback: ErrorCallback,
}

impl AppState {
    pub fn new(app_handle: tauri::AppHandle) -> Self {
        AppState {
            clusters: Default::default(),
            configuration_provider: Arc::new(ConfigurationProvider::new()),
            error_callback: Arc::new(move |err| {
                app_handle.emit_all("error", TauriError::from(err)).ok();
            }),
        }
    }

    pub async fn get_cluster(&self, cluster_id: &str) -> Arc<Cluster> {
        {
            if let Some(cluster) = self.clusters.read().await.get(cluster_id) {
                return cluster.clone();
            }
        }
        {
            debug!("Init cluster {}", cluster_id);
            let cluster = self.build_new_cluster(cluster_id, self.error_callback.clone());
            let cluster = Arc::new(cluster);
            self.clusters.write().await.insert(cluster_id.into(), cluster.clone());
            cluster
        }
    }

    pub async fn get_schema_reg_client(&self, cluster_id: &str) -> Option<Arc<CachedSchemaRegistry>> {
        let cluster = self.get_cluster(cluster_id).await;
        cluster.schema_registry_client.as_ref().cloned()
    }

    fn build_new_cluster(&self, cluster_id: &str, error_callback: ErrorCallback) -> Cluster {
        debug!("Init cluster {}", cluster_id);
        let configuration = self.configuration_provider.get_configuration().expect("Unable to get the configuration");
        let cluster_config = configuration.clusters
            .iter()
            .find(|c| c.id == cluster_id)
            .expect("Unable to find the cluster config");
        Cluster::new(cluster_config, error_callback, Duration::from_secs(configuration.sql_timeout_secs as u64))
    }
}