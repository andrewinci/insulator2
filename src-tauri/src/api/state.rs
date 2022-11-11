use std::{collections::HashMap, sync::Arc};

use futures::lock::Mutex;
use log::debug;

use crate::lib::{configuration::ConfigStore, schema_registry::CachedSchemaRegistry, Cluster};

type ClusterId = String;

#[derive(Default)]
pub struct AppState {
    clusters: Arc<Mutex<HashMap<ClusterId, Arc<Cluster>>>>,
}

impl AppState {
    pub async fn get_cluster(&self, cluster_id: &str) -> Arc<Cluster> {
        let clusters = self.clusters.clone();
        let mut map = clusters.lock().await;
        if map.get(cluster_id).is_none() {
            debug!("Init cluster {}", cluster_id);
            let cluster = AppState::build_new_cluster(cluster_id);
            map.insert(cluster_id.into(), Arc::new(cluster));
        }
        map.get(cluster_id)
            .expect("Something went wrong retrieving a cluster that must be in the clusters vector")
            .clone()
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
            .get(cluster_id)
            .expect("Unable to find the cluster config");
        Cluster::new(cluster_config)
    }
}
