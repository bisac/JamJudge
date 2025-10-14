#!/bin/bash
# Cleanup script for E2E test processes

echo "Cleaning up E2E test processes..."

# Kill Firebase emulators
lsof -ti:8081,9098,4400,4401,4500,4501,9150 2>/dev/null | xargs kill -9 2>/dev/null

# Kill Playwright report servers
pkill -f "playwright show-report" 2>/dev/null

# Kill any hanging node processes related to firebase emulators
pkill -f "firebase emulators" 2>/dev/null

echo "✓ Cleanup complete"

