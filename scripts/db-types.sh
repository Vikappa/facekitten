#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

read_env_var() {
  local key="$1"
  local file="$2"

  if [[ ! -f "$file" ]]; then
    return 0
  fi

  sed -n \
    -e "s/^${key}=\"\\([^\"]*\\)\"$/\\1/p" \
    -e "s/^${key}=\\([^#[:space:]]*\\)$/\\1/p" \
    "$file" \
    | tail -n1
}

access_token="${SUPABASE_ACCESS_TOKEN:-}"
if [[ -z "$access_token" ]]; then
  access_token="$(read_env_var SUPABASE_ACCESS_TOKEN .env.local)"
fi
if [[ -z "$access_token" ]]; then
  access_token="$(read_env_var SUPABASE_ACCESS_TOKEN .env)"
fi
: "${access_token:?SUPABASE_ACCESS_TOKEN non impostata (env, .env.local o .env)}"
export SUPABASE_ACCESS_TOKEN="$access_token"

project_id="${SUPABASE_PROJECT_ID:-}"
if [[ -z "$project_id" ]]; then
  project_id="$(read_env_var SUPABASE_PROJECT_ID .env.local)"
fi
if [[ -z "$project_id" ]]; then
  project_id="$(read_env_var SUPABASE_PROJECT_ID .env)"
fi
: "${project_id:?SUPABASE_PROJECT_ID non impostata (env, .env.local o .env)}"

schema="${SUPABASE_DB_SCHEMA:-}"
if [[ -z "$schema" ]]; then
  schema="$(read_env_var SUPABASE_DB_SCHEMA .env.local)"
fi
if [[ -z "$schema" ]]; then
  schema="$(read_env_var SUPABASE_DB_SCHEMA .env)"
fi
schema="${schema:-public}"

tmp_file="$(mktemp)"
supabase gen types typescript --project-id "$project_id" --schema "$schema" > "$tmp_file"
mv "$tmp_file" src/types/database.types.ts
