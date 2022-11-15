use std::{collections::HashMap, sync::Arc};

use log::debug;
use tokio::sync::RwLock;

use crate::lib::{configuration::ConfigStore, schema_registry::CachedSchemaRegistry, Cluster};

type ClusterId = String;

#[derive(Default)]
pub struct AppState {
    clusters: Arc<RwLock<HashMap<ClusterId, Arc<Cluster>>>>,
}

impl AppState {
    pub async fn get_cluster(&self, cluster_id: &str) -> Arc<Cluster> {
        {
            if let Some(cluster) = self.clusters.read().await.get(cluster_id) {
                return cluster.clone();
            }
        }
        {
            debug!("Init cluster {}", cluster_id);
            let cluster = AppState::build_new_cluster(cluster_id);
            let cluster = Arc::new(cluster);
            self.clusters.write().await.insert(cluster_id.into(), cluster.clone());
            cluster
        }
    }

    pub async fn get_schema_reg_client(&self, cluster_id: &str) -> Option<Arc<CachedSchemaRegistry>> {
        let cluster = self.get_cluster(cluster_id).await;
        cluster.schema_registry_client.as_ref().cloned()
    }

    fn build_new_cluster(cluster_id: &str) -> Cluster {
        debug!("Init cluster {}", cluster_id);
        let configurations = ConfigStore::new()
            .get_configuration()
            .expect("Unable to get the configuration");
        let cluster_config = configurations
            .clusters
            .iter()
            .find(|c| c.id == cluster_id)
            .expect("Unable to find the cluster config");
        Cluster::new(cluster_config)
    }
}
