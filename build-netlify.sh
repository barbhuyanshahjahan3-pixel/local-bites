#!/usr/bin/env bash
# Builds all 5 Local Bites frontend apps and assembles them into a single
# dist/ folder that Netlify serves as one site:
#
#   /              -> Customer app
#   /restaurant/   -> Restaurant dashboard
#   /delivery/     -> Delivery partner app
#   /admin/        -> Admin dashboard
#   /super-admin/  -> Super Admin dashboard
#
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUT_DIR="$ROOT_DIR/dist"

echo "Cleaning previous build output..."
rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

build_app () {
  local app_dir="$1"
  local sub_path="$2"

  echo ""
  echo "=== Building apps/$app_dir ==="
  (
    cd "$ROOT_DIR/apps/$app_dir"
    npm install
    npm run build
  )

  if [ -z "$sub_path" ]; then
    cp -r "$ROOT_DIR/apps/$app_dir/dist/." "$OUT_DIR/"
  else
    mkdir -p "$OUT_DIR/$sub_path"
    cp -r "$ROOT_DIR/apps/$app_dir/dist/." "$OUT_DIR/$sub_path/"
  fi
}

# Customer app is served from the site root.
build_app "customer" ""

# Dashboards are served from their own sub-paths.
build_app "restaurant" "restaurant"
build_app "delivery" "delivery"
build_app "admin" "admin"
build_app "super-admin" "super-admin"

echo ""
echo "All apps built successfully into $OUT_DIR"
