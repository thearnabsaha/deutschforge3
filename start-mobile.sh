#!/bin/bash
# DeutschForge Mobile Dev Server Starter
# Usage: ./start-mobile.sh

# Kill old processes
pkill cloudflared 2>/dev/null
pkill -f "expo start" 2>/dev/null
sudo rm -rf /tmp/metro-* /tmp/haste-* 2>/dev/null

# Start cloudflared tunnel
cloudflared tunnel --url http://localhost:4300 --no-autoupdate > /tmp/cf.log 2>&1 &
echo "Waiting for tunnel..."
sleep 12

CF_HOST=$(grep -oP '[a-z0-9-]+\.trycloudflare\.com' /tmp/cf.log | head -1)
echo "Tunnel: $CF_HOST"
echo "Expo Go URL: exp://$CF_HOST"

# Start Metro (must cd into packages/mobile, no EXPO_NO_METRO_WORKSPACE_ROOT)
cd /home/user/deutschforge/packages/mobile
EXPO_PACKAGER_PROXY_URL=https://$CF_HOST ./node_modules/.bin/expo start --port 4300 --clear
