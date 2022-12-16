import json
import datetime
from pathlib import Path
from glob import glob
import argparse

# CLI parsing configuration
parser = argparse.ArgumentParser(description="Update `updater` manifests.")
parser.add_argument("--target", help='One of "linux", "windows" or "darwin"')
parser.add_argument("--version", help="Manifest version")
parser.add_argument("--notes", help="Release notes")

args = parser.parse_args()

# validate args
if args.target not in ["linux", "darwin", "windows", "all"]:
    print("Invalid target. Specify one of: linux, darwin, windows, all")
    exit(1)

target = args.target
version = args.version
notes = args.notes

manifest_config = {
    "darwin": {
        "manifest": "manifests/update-darwin.json",
        "sig": "backend/target/release/bundle/macos/Insulator 2.app.tar.gz.sig",
        "url": f"https://github.com/andrewinci/insulator2/releases/download/v{version}/Insulator.2.app.tar.gz",
        "platforms": ["darwin-x86_64", "darwin-aarch64"],
    },
    "linux": {
        "manifest": "manifests/update-linux.json",
        "sig": "backend/target/release/bundle/appimage/insulator-*_amd64.AppImage.tar.gz.sig",
        "url": f"https://github.com/andrewinci/insulator2/releases/download/v{version}/insulator-2_{version}_amd64.AppImage.tar.gz",
        "platforms": ["linux-x86_64"],
    },
    "windows": {
        "manifest": "manifests/update-windows.json",
        "sig": "backend/target/release/bundle/msi/Insulator*.msi.zip.sig",
        "url": f"https://github.com/andrewinci/insulator2/releases/download/v{version}/Insulator.2_{version}_x64_en-US.msi.zip",
        "platforms": ["windows-x86_64"],
    },
}


def update_target(target):
    # load manifest
    print(f"Updating {target} manifest")
    raw_manifest_path = manifest_config[target]["manifest"]
    manifest = json.loads(Path(raw_manifest_path).read_text())

    # load signature if any
    signature = None
    signature_file = glob(manifest_config[target]["sig"])
    if len(signature_file) == 1:
        signature = Path(signature_file[0]).read_text()
    
    # set specific fields
    for p in manifest_config[target]["platforms"]:
        if signature:
            manifest["platforms"][p]["signature"] = signature
        if version:
            manifest["platforms"][p]["url"] = manifest_config[target]["url"]

    # set common fields
    if version:
        manifest["version"] = f"v{version}"
    if notes:
        manifest["notes"] = notes
    manifest["pub_date"] = datetime.datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ")

    # write the new manifest
    raw_manifest = json.dumps(manifest, indent=2)
    print(raw_manifest)
    Path(raw_manifest_path).write_text(raw_manifest)


if target in ["darwin", "all"]:
    update_target("darwin")

if target in ["linux", "all"]:
    update_target("linux")

if target in ["windows", "all"]:
    update_target("windows")


if version:
    # update package.json
    package_json = json.loads(Path("./package.json").read_text())
    package_json["version"] = version
    Path("./package.json").write_text(json.dumps(package_json, indent=2))

    # update tauri.conf.json
    package_json = json.loads(Path("./backend/tauri.conf.json").read_text())
    package_json["package"]["version"] = version
    Path("./backend/tauri.conf.json").write_text(json.dumps(package_json, indent=2))

    # update toml
    # todo: this invalidates the cache
    # new_version = []
    # with open("./backend/Cargo.toml", "r") as f:
    #     new_version = f.readlines()
    #     new_version[2] = f'version = "{version}"\n'
    # with open("./backend/Cargo.toml", "w") as f:
    #     f.writelines(new_version)
