#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Ollama container entrypoint
#
# Starts ollama serve, waits for the API to be ready (using the ollama CLI
# itself — no curl/wget required), then pulls the configured model if it is
# not already cached in the volume.
#
# OLLAMA_MODEL env var controls which model is pulled (default: llama3.2:3b).
# Model files live in the ollama_data Docker volume, so on subsequent starts
# the model is already present and the pull is skipped instantly.
# ─────────────────────────────────────────────────────────────────────────────

# -e  : exit on unhandled errors
# No -u / no pipefail: grep returns 1 when there is no match, which is normal
# and should NOT be treated as a fatal error.
set -e

MODEL="${OLLAMA_MODEL:-llama3.2:3b}"

echo "[ollama-init] Starting ollama serve ..."
ollama serve &
SERVE_PID=$!

# ── Wait for the API to become available ─────────────────────────────────────
# `ollama list` exits 0 when the server is ready and non-zero while it is
# still starting up. This avoids depending on curl/wget, which are not
# installed in the base ollama image.
echo "[ollama-init] Waiting for Ollama API ..."
until ollama list > /dev/null 2>&1; do
  sleep 1
done
echo "[ollama-init] API is up."

# ── Pull model only if not already present ────────────────────────────────────
# `grep -q` exits 0 on match, 1 on no match. We capture that with `if` so
# the shell does not treat exit code 1 as a script error.
if ollama list 2>/dev/null | grep -qi "${MODEL}"; then
  echo "[ollama-init] Model '${MODEL}' is already cached — skipping pull."
else
  echo "[ollama-init] Pulling '${MODEL}' (this may take a few minutes on first boot) ..."
  ollama pull "${MODEL}"
  echo "[ollama-init] Model '${MODEL}' is ready."
fi

# ── Hand off to ollama serve ─────────────────────────────────────────────────
echo "[ollama-init] Startup complete. Handing off to ollama serve (PID ${SERVE_PID})."
wait "${SERVE_PID}"
