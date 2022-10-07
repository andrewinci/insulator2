use std::{ collections::HashMap, sync::{ Arc, Mutex } };

use super::types::{ ConsumerInfo, KafkaRecord };

pub(super) fn push_record(
    record: KafkaRecord,
    records_state: Arc<Mutex<HashMap<ConsumerInfo, Vec<KafkaRecord>>>>,
    consumer_info: &ConsumerInfo
) -> usize {
    let mut records_map = records_state.lock().unwrap();
    let records = records_map.get_mut(consumer_info).expect("The map record was created above");
    records.push(record);
    records.len()
}