#!/usr/bin/env bash
# Deploy nick.sa to new Vercel account (oemad2284@gmail.com).
# Uses --archive=tgz to bypass local .git (which points to eclipseagency/nick).
set -e
cd "$(dirname "$0")"
source .vercel-token
npx vercel --prod --token=$VERCEL_TOKEN --yes --archive=tgz
