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

### Logging

Use `RUST_LOG="insulator2=debug"` to get debug logs in console for the insulator app only.  
Use `RUST_LOG=debug` to enable debug log in any component (kafkard may be very noisy).

### Release

Once happy with the latest main branch artifact, release running `yarn release`. (need the GH_TOKEN)

### Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## Credits

- [Tauri](https://tauri.app/)
- [Mantine](https://mantine.dev/)
- [rust-rdkafka](https://github.com/fede1024/rust-rdkafka)

## Todo

- [x] Use semantic release version in the artifact
- [ ] Windows build
- [ ] Make font size configurable in record list
- [ ] Use a single encrypted file for all the configurations
