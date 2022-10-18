pub(super) fn parse_string(v: &[u8]) -> String {
    String::from_utf8_lossy(v).into_owned()
}

#[cfg(test)]
mod tests {
    use super::parse_string;

    #[test]
    fn parse_empty_array_to_string() {
        let vec = vec![];
        let res = parse_string(&vec);
        assert_eq!(res, "")
    }

    #[test]
    fn parse_invalid_to_string() {
        let vec: Vec<u8> = vec![0x00, 0x41, 0xff];
        let res = parse_string(&vec);
        assert!(res.len() > 0)
    }
}
