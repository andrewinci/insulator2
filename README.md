# Insulator2

Insulator on Tauri.

## Dev

### Dependencies

- MacOS:
  ```bash
  brew install cmake openssl@3 cyrus-sasl
  export PKG_CONFIG_PATH="/opt/homebrew/opt/openssl@3/lib/pkgconfig"
  ```
- (To test) Linux: `apt install cmake libssl-dev libsasl2-dev`

Getting started

```bash
yarn
yarn tauri dev
```

### Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## Credits

- [Tauri](https://tauri.app/)
- [Mantine](https://mantine.dev/)
- [rust-rdkafka](https://github.com/fede1024/rust-rdkafka)

## Todo

- [ ] Use semantic release version in the artifact
