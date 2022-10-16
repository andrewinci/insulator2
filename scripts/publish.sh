#!/bin/bash
set -e

VERSION=$1
RELEASE_NOTES="${*:2}"
NOW=$(python -c "import datetime; print(datetime.datetime.now().strftime(\"%Y-%m-%dT%H:%M:%SZ\"))")

echo "Update version to $VERSION"

function update_json() {
    FILE_NAME=$1
    JSON_PATH=$2
    VALUE=$3
    jq "$JSON_PATH = \"$VALUE\"" <<<$(cat $FILE_NAME) >$FILE_NAME
}

# Update package.json
update_json package.json ".version" $VERSION

# Update tauri
update_json src-tauri/tauri.conf.json ".package.version" $VERSION

# Update mac os manifest
update_json manifests/update-darwin.json '.version' "v$VERSION"
update_json manifests/update-darwin.json '.pub_date' "$NOW"
update_json manifests/update-darwin.json '.platforms."darwin-x86_64".url' "https://github.com/andrewinci/insulator2/releases/download/v${VERSION}/Insulator.2.app.tar.gz"
## use the x86_64 in aarch64 with rosetta
update_json manifests/update-darwin.json '.platforms."darwin-aarch64".url' "https://github.com/andrewinci/insulator2/releases/download/v${VERSION}/Insulator.2.app.tar.gz"
update_json manifests/update-darwin.json ".notes" "$RELEASE_NOTES"

# Update linux manifest
update_json manifests/update-linux.json '.version' "v$VERSION"
update_json manifests/update-linux.json '.pub_date' "$NOW"
update_json manifests/update-linux.json '.platforms."linux-x86_64".url' "https://github.com/andrewinci/insulator2/releases/download/v${VERSION}/insulator-2_${VERSION}_amd64.AppImage.tar.gz"
update_json manifests/update-linux.json ".notes" "$RELEASE_NOTES"

# Update windows manifest
update_json manifests/update-windows.json '.version' "v$VERSION"
update_json manifests/update-windows.json '.pub_date' "$NOW"
update_json manifests/update-windows.json '.platforms."windows-x86_64".url' "https://github.com/andrewinci/insulator2/releases/download/v${VERSION}/todo!"
update_json manifests/update-windows.json ".notes" "$RELEASE_NOTES"
