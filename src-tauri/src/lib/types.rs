mod configuration {
    use serde::{ Serialize, Deserialize };

    #[derive(Serialize, Deserialize, Debug, Clone, Default)]
    pub struct Cluster {
        pub id: String,
        pub name: String,
        pub endpoint: String,
        pub authentication: Authentication,
        #[serde(rename = "schemaRegistry")]
        pub schema_registry: Option<SchemaRegistry>,
    }

    #[derive(Serialize, Deserialize, Debug, Clone, Default)]
    pub enum Authentication {
        Ssl {
            ca: String,
            certificate: String,
            key: String,
            #[serde(rename = "keyPassword")]
            key_password: Option<String>,
        },
        Sasl {
            username: String,
            password: String,
            scram: bool,
        },
        #[default] None,
    }

    #[derive(Serialize, Deserialize, Debug, Clone)]
    pub struct SchemaRegistry {
        pub endpoint: String,
        pub username: Option<String>,
        pub password: Option<String>,
    }
}

mod state {
    use crate::lib::{ schema_registry::SchemaRegistryClient, consumer::Consumer, admin::Admin };

    use super::configuration;

    struct Cluster {
        config: configuration::Cluster,
        schema_registry: Box<dyn SchemaRegistryClient>,
        consumer: Box<dyn Consumer>,
        admin_client: Box<dyn Admin>,
    }
}