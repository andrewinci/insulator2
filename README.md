# Insulator2

Insulator on Tauri.

## Dev

### Required tools

- [Volta](https://github.com/volta-cli/volta) to install the pinned version of yarn and node.
- [Rust](https://www.rust-lang.org/tools/install) rust is required to build the tauri backend

### Setup on Ubuntu/Debian

Some libraries are required on debian in order to build

```
sudo apt update
sudo apt install libwebkit2gtk-4.0-dev \
    build-essential \
    curl \
    wget \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev \
    libsasl2-dev \
    cmake
```

### Setup MacOS

Requirements to compile on mac os can be installed with [brew](https://brew.sh/)

`brew install cmake`

### Setup Windows

Before running the build make sure the following executables are installed and available in env

- [Perl](https://strawberryperl.com/)
- [cmake](https://github.com/Kitware/CMake/releases/download/v3.24.2/cmake-3.24.2-windows-x86_64.msi)

**Note:** Use powershell to run the build commands

### Run in dev mode

```bash
yarn
yarn tauri dev
```

### Build

To build the application locally run

```bash
# Mac OS
yarn tauri build -b dmg
# Windows
yarn tauri build -b msi
# Linux
yarn tauri build -b deb appimage
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
- [x] Windows build
- [x] Use a single file for all the configurations
- [ ] Make font size configurable in record list
- [ ] Encrypt config file
