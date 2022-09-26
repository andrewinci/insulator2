#!/bin/bash

set -e
VERSION=$1

echo "Update version to $VERSION"

function update_json() {
    FILE_NAME=$1
    JSON_PATH=$2
    VALUE=$3
    jq "$JSON_PATH = \"$VALUE\"" <<< $(cat $FILE_NAME) > $FILE_NAME
}

# Update package.json
update_json package.json ".version" $VERSION

# Update tauri
update_json src-tauri/tauri.conf.json ".package.version" $VERSION