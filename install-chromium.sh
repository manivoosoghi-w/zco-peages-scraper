#!/usr/bin/env bash
set -e

echo "Downloading Chromium (stable build)..."

mkdir -p chromium

curl -Lo chromium/chrome.zip \
https://storage.googleapis.com/chromium-browser-snapshots/Linux_x64/1134310/chrome-linux.zip

echo "Unzipping..."
unzip chromium/chrome.zip -d chromium/

echo "Chromium installed successfully."
