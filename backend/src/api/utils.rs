use log::{debug, error};

use super::error::{Result, TauriError};
use super::AppState;
use rust_keystore::KeyStore;
use serde::{Deserialize, Serialize};

#[tauri::command]
pub async fn export_datastore(cluster_id: &str, output_path: &str, state: tauri::State<'_, AppState>) -> Result<()> {
    debug!("Start export database");
    Ok(state.get_cluster(cluster_id).await?.store.export_db(output_path)?)
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserCertificate {
    certificate: String,
    key: String,
}

#[tauri::command]
pub async fn parse_truststore(location: &str, password: Option<&str>) -> Result<String> {
    debug!("Parsing truststore {}", &location);
    let ca_certificate = KeyStore::try_load(location)
        .and_then(|c| c.certificates(password))
        .map(|certs| certs[0].pem.clone());
    ca_certificate.map_err(|err| {
        error!("Unable to load the truststore: {:?}", err);
        TauriError {
            error_type: "Legacy config".into(),
            message: "Unable to correctly parse the truststore".into(),
        }
    })
}

#[tauri::command]
pub async fn parse_keystore(location: &str, password: Option<&str>) -> Result<UserCertificate> {
    debug!("Parsing keystore {}", &location);
    let user_cert = KeyStore::try_load(location)
        .and_then(|c| c.certificates(password))
        .map(|certs| certs[0].clone());

    if let Ok(certificate) = user_cert {
        if let (certificate, Some(key)) = (certificate.pem, certificate.private_key) {
            return Ok(UserCertificate {
                certificate,
                key: key.pkcs8_pem,
            });
        }
    }
    Err(TauriError {
        error_type: "Legacy config".into(),
        message: "Unable to correctly parse the keystore".into(),
    })
}
