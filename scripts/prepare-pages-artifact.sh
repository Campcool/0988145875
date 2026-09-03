#!/usr/bin/env bash
set -euo pipefail

readonly output_dir="_site"

# Site policy: deny internal roots first, then allow only explicit public paths.
readonly -a deny_rules=(
  '/_site/***'
  '/work/***'
  '/.git*'
  '/.github/***'
  '/scripts/***'
  '/*.md'
  '/google-ads-*.csv'
  '/CNAME.txt'
  '/cases/placeholder.txt'
)
readonly -a public_rules=(
  '/CNAME'
  '/*.html'
  '/analytics.js'
  '/*.png'
  '/*.jpg'
  '/*.webp'
  '/cases.json'
  '/cases/'
  '/cases/*.jpg'
  '/cases/*.webp'
  '/service-icons/'
  '/service-icons/*.png'
  '/service-icons/*.webp'
  '/robots.txt'
  '/sitemap.xml'
  '/llms.txt'
)
readonly -a required_paths=(
  'index.html'
  'CNAME'
  'analytics.js'
  'cases.json'
  'robots.txt'
  'sitemap.xml'
  'llms.txt'
  'service-icons/home.webp'
  'service-icons/home.png'
  'service-icons/community.webp'
  'service-icons/community.png'
  'service-icons/renovation.webp'
  'service-icons/renovation.png'
  'service-icons/business.webp'
  'service-icons/business.png'
  'service-icons/organizing.webp'
  'service-icons/organizing.png'
  'service-icons/move.webp'
  'service-icons/move.png'
  'service-icons/deep.webp'
  'service-icons/deep.png'
)
readonly -a denied_paths=(
  'AI-README.md'
  'scripts'
  'google-ads-keywords.csv'
  'google-ads-negative-keywords.csv'
  'google-ads-rsa-assets.csv'
  'cases/placeholder.txt'
)

mkdir -p "$output_dir"
rsync_args=(-a --delete --delete-excluded --prune-empty-dirs)
for rule in "${deny_rules[@]}"; do rsync_args+=(--exclude "$rule"); done
for rule in "${public_rules[@]}"; do rsync_args+=(--include "$rule"); done
rsync_args+=(--exclude '*')
rsync "${rsync_args[@]}" ./ "$output_dir/"

for required in "${required_paths[@]}"; do
  if [ ! -e "$output_dir/$required" ]; then
    echo "::error title=Pages artifact invalid::$required is missing from $output_dir"
    exit 1
  fi
done

for denied in "${denied_paths[@]}"; do
  if [ -e "$output_dir/$denied" ]; then
    echo "::error title=Internal path leaked::$denied must not be included in the Pages artifact"
    exit 1
  fi
done

case_asset_count=0
while IFS= read -r asset; do
  case_asset_count=$((case_asset_count + 1))
  case "$asset" in
    cases/*.jpg|cases/*.webp) ;;
    *)
      echo "::error title=Cases artifact invalid::cases.json references unexpected path: $asset"
      exit 1
      ;;
  esac
  if [ ! -f "$output_dir/$asset" ]; then
    echo "::error title=Cases artifact incomplete::$asset is referenced by cases.json but missing from $output_dir"
    exit 1
  fi
done < <(sed -nE 's/^[[:space:]]*"(before|after)"[[:space:]]*:[[:space:]]*"([^"]+)".*/\2/p' cases.json)

if [ "$case_asset_count" -eq 0 ]; then
  echo "::error title=Cases artifact invalid::cases.json did not yield any before/after assets"
  exit 1
fi

echo "Public Pages artifact ready: $(find "$output_dir" -type f | wc -l | tr -d ' ') files"
find "$output_dir" -type f -print | sort
