use std::{ collections::HashMap, sync::Arc };

use futures::lock::Mutex;
use log::debug;

use crate::lib::{ Cluster, ConfigStore };

type ClusterId = String;

#[derive(Default)]
pub struct AppState {
    clusters: Arc<Mutex<HashMap<ClusterId, Cluster>>>,
}

impl AppState {
    pub async fn get_by_cluster_id(&self, cluster_id: &str) -> Cluster {
        let clusters = self.clusters.clone();
        let mut map = clusters.lock().await;
        if map.get(cluster_id).is_none() {
            debug!("Initialise cluster {}", cluster_id);
            let configurations = ConfigStore::new().get_configuration().expect("Unable to get the configuration");
            let cluster_config = configurations.clusters
                .iter()
                .find(|c| c.id == cluster_id)
                .expect("Unable to find the cluster config");
            let cluster = Cluster::new(cluster_config.to_owned());
            map.insert(cluster_id.into(), cluster);
        }
        map.get(cluster_id)
            .expect("Something went wrong retrieving a cluster that must be in the clusters vector")
            .clone()
    }
}