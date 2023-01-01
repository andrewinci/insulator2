use crate::lib::error::{Error, Result};

pub(super) fn get_schema_id(raw: &[u8]) -> Result<i32> {
    let arr = <[u8; 4]>::try_from(&raw[1..5]).map_err(|_| Error::AvroParse {
        message: "Invalid record. Unable to extract the schema id.".into(),
    })?;
    Ok(i32::from_be_bytes(arr))
}

#[cfg(test)]
mod tests {
    use super::get_schema_id;

    #[test]
    fn u8_array_to_i32() {
        let raw: Vec<u8> = vec![0x00, 0x00, 0x01, 0x86, 0xc5, 0x00, 0x00, 0x00];
        let id = get_schema_id(&raw).unwrap();
        assert_eq!(id, 100037)
    }
}
