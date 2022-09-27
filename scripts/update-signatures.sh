#!/bin/bash
set -e

function update_json() {
    FILE_NAME=$1
    JSON_PATH=$2
    VALUE=$3
    jq "$JSON_PATH = \"$VALUE\"" <<<$(cat $FILE_NAME) >$FILE_NAME
}

TARGET="$1"

if [ "$TARGET" == "darwin" ]; then
    echo "Updating darwin signatures"
    SIG=$(cat "src-tauri/target/release/bundle/macos/Insulator 2.app.tar.gz.sig")
    update_json manifests/update-darwin.json '.platforms."darwin-x86_64".signature' "$SIG"
    update_json manifests/update-darwin.json '.platforms."darwin-aarch64".signature' "$SIG"
elif [ "$TARGET" == "linux" ]; then
    echo "Updating linux signatures"
    SIG=$(cat src-tauri/target/release/bundle/appimage/insulator-*_amd64.AppImage.tar.gz.sig)
    update_json manifests/update-linux.json '.platforms."linux-x86_64".signature' "$SIG"
else 
    echo "Invalid target. Specify one of: linux, darwin"
    exit 1
fi
