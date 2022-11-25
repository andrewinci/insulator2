<h1 align="center">
  <br>
  <img src="src-tauri/icons/icon.png" alt="Insulator" width="200">
  <br>
  Insulator 2
  <br>
</h1>

<h4 align="center">A tool for devs to debug Kafka based applications and services</h4>
<br/>
<p align="center">

<a href="https://github.com/andrewinci/insulator2/actions/workflows/ci.yml">
    <img src="https://github.com/andrewinci/insulator2/actions/workflows/ci.yml/badge.svg"
         alt="CI"/>
  </a>
 
 <a href="https://codecov.io/github/andrewinci/insulator2" > 
  <img src="https://codecov.io/github/andrewinci/insulator2/branch/main/graph/badge.svg?token=pGmWpeLba1" alt="Coverage"/> 
 </a>
 
 <a href="https://snyk.io/test/github/andrewinci/insulator2">
    <img src="https://snyk.io/test/github/andrewinci/insulator2/badge.svg"
         alt="Snyk"/>
  </a>

<a href="https://app.fossa.com/projects/custom%2B19254%2Fgithub.com%2Fandrewinci%2Finsulator2?ref=badge_shield" alt="FOSSA Status">
  <img src="https://app.fossa.com/api/projects/custom%2B19254%2Fgithub.com%2Fandrewinci%2Finsulator2.svg?type=shield"/>
</a>

<a href="https://github.com/andrewinci/insulator2/releases/latest/" > 
 <img alt="GitHub release (latest by date)" src="https://img.shields.io/github/v/release/andrewinci/insulator2?style=plastic">
 </a>

</p>

## Installation

Download the artifact for your operative system from the [last release](https://github.com/andrewinci/insulator2/releases/latest/).

### Supported OSs:

- MacOS
- Windows 10
- Debian/Ubuntu

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

### Spin up a local kafka (RedPanda) cluster for testing

```bash
docker run -d --name=redpanda-1 --rm \
    -p 9092:9092 \
    -p 9644:9644 \
    docker.vectorized.io/vectorized/redpanda:latest \
    redpanda start \
    --overprovisioned \
    --smp 1  \
    --memory 1G \
    --reserve-memory 0M \
    --node-id 0 \
    --check=false
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
