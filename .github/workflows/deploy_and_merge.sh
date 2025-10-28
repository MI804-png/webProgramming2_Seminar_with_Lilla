#!/usr/bin/env bash
# auto_deploy_merge.sh -- non-interactive automatic merge + set secrets + trigger deploy + watch
# Run locally on a machine with GitHub CLI authenticated.
# This script is non-interactive by default (CONFIRM=yes) and will watch the workflow run after merging.
# It reads secret values from environment variables and sets repository secrets via gh secret set.
# Required: gh CLI authenticated locally (gh auth login).
# DO NOT paste secrets into chat. Export them into your local environment before running.

set -euo pipefail

# Configuration: can be overridden by environment variables
REPO="${GITHUB_REPO:-MI804-png/webprogramming_with_lilla}"
PR_NUM="${PR_NUM:-13}"
CONFIRM="${CONFIRM:-yes}"    # changed default to yes per request
WATCH="${WATCH:-yes}"        # automatically watch workflow run after merge

# Secrets to set if environment variables present.
# For SSH_KEY you can provide SSH_KEY (content) or SSH_KEY_FILE (path to private key).
SECRETS_ENV_MAP=(
  "SSH_HOST:SSH_HOST"
  "SSH_USER:SSH_USER"
  "SSH_PASSWORD:SSH_PASSWORD"
  "SSH_KEY:SSH_KEY"          # content or provide SSH_KEY_FILE
  "REPO_URL:REPO_URL"
  "DB_HOST:DB_HOST"
  "DB_PORT:DB_PORT"
  "DB_USER:DB_USER"
  "DB_PASS:DB_PASS"
  "DB_NAME:DB_NAME"
  "SESSION_SECRET:SESSION_SECRET"
  "BASE_PATH:BASE_PATH"
  "APP_PORT:APP_PORT"
  "SSH_PORT:SSH_PORT"
)

# Safety: still require explicit CONFIRM=yes to run; default is yes now.
if [ "${CONFIRM,,}" != "yes" ] && [ "${CONFIRM,,}" != "y" ]; then
  cat <<EOF

This script will non-interactively set repo secrets (from your environment),
mark PR #${PR_NUM} ready (if draft), merge it into main, and watch the workflow run.

To run it, first export CONFIRM=yes and make sure required environment variables are set.
Example:
  export CONFIRM=yes
  export GITHUB_REPO="${REPO}"
  export PR_NUM="${PR_NUM}"
  export SSH_HOST="IHUTSC"
  export SSH_USER="IHUTSC"
  export SSH_PASSWORD="(your-new-password)"
  export SSH_KEY_FILE="/path/to/private_key"   # optional alternative to SSH_KEY
  export REPO_URL="git@github.com:MI804-png/webprogramming_with_lilla.git"
  export SESSION_SECRET="long-random-secret"

Then run:
  bash ./auto_deploy_merge.sh

EOF
  exit 0
fi

# Ensure GH CLI is available and authenticated.
if ! command -v gh >/dev/null 2>&1; then
  echo "[ERROR] gh CLI not found. Install and authenticate locally (gh auth login)." >&2
  exit 2
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "[ERROR] gh CLI is not authenticated. Run: gh auth login" >&2
  exit 2
fi

echo "[INFO] Using repository: $REPO"
echo "[INFO] Target PR: #$PR_NUM"

# Helper to set a secret in repo if corresponding env var exists.
set_secret_from_env() {
  local secret_name="$1"
  local env_name="$2"
  local val=""
  if [ "$env_name" = "SSH_KEY" ]; then
    # allow SSH_KEY_FILE or SSH_KEY
    if [ -n "${SSH_KEY_FILE:-}" ] && [ -f "${SSH_KEY_FILE}" ]; then
      val="$(cat "${SSH_KEY_FILE}")"
    elif [ -n "${SSH_KEY:-}" ]; then
      val="${SSH_KEY}"
    fi
  else
    # indirect expansion of environment variable name
    val="${!env_name:-}"
  fi

  if [ -n "$val" ]; then
    printf "%s" "$val" | gh secret set "$secret_name" --repo "$REPO" --body - >/dev/null
    echo "[INFO] Set secret $secret_name"
  else
    echo "[INFO] Env var for $secret_name ($env_name) not set; skipping"
  fi
}

# Set each secret if environment value present
for mapping in "${SECRETS_ENV_MAP[@]}"; do
  IFS=":" read -r secret_name env_name <<< "$mapping"
  set_secret_from_env "$secret_name" "$env_name"
done

# Mark PR ready if it's a draft (idempotent)
is_draft=$(gh pr view "$PR_NUM" --repo "$REPO" --json isDraft --jq '.isDraft' 2>/dev/null || echo "false")
if [ "$is_draft" = "true" ]; then
  echo "[INFO] PR #$PR_NUM is a draft — marking ready for review..."
  gh pr ready "$PR_NUM" --repo "$REPO" || true
else
  echo "[INFO] PR #$PR_NUM is not a draft."
fi

# Merge PR (use merge commit strategy). This will push changes to main and trigger workflows.
echo "[INFO] Merging PR #$PR_NUM into its base branch (merge commit)."
gh pr merge "$PR_NUM" --repo "$REPO" --merge --delete-branch --confirm

echo "[INFO] PR merged. The repository main branch should have new commit(s)."

# Optionally watch the workflow run (default: yes)
if [ "${WATCH,,}" = "yes" ] || [ "${WATCH,,}" = "y" ]; then
  echo "[INFO] Watching the most recent workflow run for repository $REPO..."
  # This will attach to the most recent run and stream logs until completion.
  gh run watch --repo "$REPO"
else
  echo "[INFO] WATCH not enabled; not watching workflow run."
fi

echo "[INFO] Done. Monitor Actions at https://github.com/${REPO}/actions if needed."