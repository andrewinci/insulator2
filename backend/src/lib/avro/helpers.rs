use crate::lib::error::{LibError, LibResult};

pub(super) fn get_schema_id_from_record_header(raw: &[u8]) -> LibResult<i32> {
    const AVRO_MAGIC_BYTE: u8 = 0x00;
    if raw.len() <= 5 || raw[0] != AVRO_MAGIC_BYTE {
        return Err(LibError::AvroParse {
            message: "Supported avro messages should start with 0x00 follow by the schema id (4 bytes)".into(),
        });
    }
    let arr = <[u8; 4]>::try_from(&raw[1..5]).map_err(|_| LibError::AvroParse {
        message: "Invalid record. Unable to extract the schema id.".into(),
    })?;
    Ok(i32::from_be_bytes(arr))
}

pub(super) fn build_record_header(schema_id: i32) -> Vec<u8> {
    let mut res = vec![0x00];
    let mut id = Vec::from(schema_id.to_be_bytes());
    res.append(&mut id);
    res
}

#[cfg(test)]
mod tests {
    use super::{build_record_header, get_schema_id_from_record_header};

    #[test]
    fn test_get_schema_id_from_raw() {
        let raw: Vec<u8> = vec![0x00, 0x00, 0x01, 0x86, 0xc5, 0x00, 0x00, 0x00];
        let id = get_schema_id_from_record_header(&raw).unwrap();
        assert_eq!(id, 100037)
    }

    #[test]
    fn test_too_short_record_fails() {
        let raw: Vec<u8> = vec![0x00, 0x00, 0x01, 0x86, 0xc5, 0x00, 0x00, 0x00];
        let id = get_schema_id_from_record_header(&raw).unwrap();
        assert_eq!(id, 100037)
    }

    #[test]
    fn test_missing_magic_byte_fails() {
        let raw: Vec<u8> = vec![0x00, 0x00, 0x01, 0x86, 0xc5, 0x00, 0x00, 0x00];
        let id = get_schema_id_from_record_header(&raw).unwrap();
        assert_eq!(id, 100037)
    }

    #[test]
    fn build_record_header_happy_path() {
        let raw = build_record_header(100037);
        assert_eq!(raw, vec![0x00, 0x00, 0x01, 0x86, 0xc5])
    }
}
