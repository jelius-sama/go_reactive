#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Change to the script directory
cd "$SCRIPT_DIR"

# Get version and app name from config
VERSION=$(grep '"version"' ./shared/app.config.json | sed -E 's/.*"version": *"([^"]+)".*/\1/')
APP_NAME=$(grep '"title"' ./shared/app.config.json | sed -E 's/.*"title": *"([^"]+)".*/\1/')

# Function to clean up processes on exit
cleanup() {
  echo "Gracefully shutting down all servers..."
  for pid in $pids; do
    if kill -0 $pid 2>/dev/null; then
      kill -TERM $pid 2>/dev/null || true
    fi
  done
  sleep 0.5
  for pid in $pids; do
    if kill -0 $pid 2>/dev/null; then
      kill -KILL $pid 2>/dev/null || true
    fi
  done
  wait 2>/dev/null || true
  echo "All servers stopped."
  exit 0
}

# Set trap for cleanup
trap cleanup INT TERM EXIT

# Start the main application
echo "Starting main application server..."
sudo ./bin/$APP_NAME-$VERSION &
pids="$!"

# Start the render process
echo "Starting render server..."
(cd "$SCRIPT_DIR/client" && "$SCRIPT_DIR/bin/bun" run render:prod) &
pids="$pids $!"

echo "All production servers started! Press Ctrl+C to stop all servers."

# Wait for all processes
wait