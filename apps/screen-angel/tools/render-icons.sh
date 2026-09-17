#!/usr/bin/env bash
#
# SVG is the source; PNG is what Electron can actually load.
#
# nativeImage does not read SVG, so the menu bar mark and the application icon are both
# rasterized here and the results are committed. Run this after editing either SVG.
#
#   ./tools/render-icons.sh
#
# Needs ImageMagick. On macOS: brew install imagemagick

set -euo pipefail

cd "$(dirname "$0")/.."
res=resources

if ! command -v magick >/dev/null 2>&1; then
	echo "render-icons: ImageMagick not found. brew install imagemagick" >&2
	exit 1
fi

# Menu bar. macOS looks for the "Template" suffix and takes only the alpha channel, so a
# 1x and a 2x are all that is needed and colour in them would be discarded anyway.
magick -background none "$res/trayTemplate.svg" -resize 16x16   "$res/trayTemplate.png"
magick -background none "$res/trayTemplate.svg" -resize 32x32   "$res/trayTemplate@2x.png"

# Application icon. electron-builder generates .icns and .ico from a single large PNG, so
# one 1024 is the whole requirement; 512 is for app.dock.setIcon during development.
magick -background none "$res/icon.svg" -resize 1024x1024 "$res/icon.png"
magick -background none "$res/icon.svg" -resize 512x512   "$res/icon@512.png"

echo "render-icons: wrote"
for f in trayTemplate.png trayTemplate@2x.png icon.png icon@512.png; do
	printf '  %-22s %s\n' "$f" "$(magick identify -format '%wx%h' "$res/$f")"
done
