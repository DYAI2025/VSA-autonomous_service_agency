#!/bin/bash

# WUPHF Agent Dashboard Stop Script

echo "Stopping WUPHF Agent Dashboard..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Kill processes using PID files
if [ -f /tmp/wuphf-dashboard-backend.pid ]; then
    BACKEND_PID=$(cat /tmp/wuphf-dashboard-backend.pid)
    kill $BACKEND_PID 2>/dev/null
    echo -e "${GREEN}Backend API stopped (PID: $BACKEND_PID)${NC}"
    rm /tmp/wuphf-dashboard-backend.pid
fi

if [ -f /tmp/wuphf-dashboard-frontend.pid ]; then
    FRONTEND_PID=$(cat /tmp/wuphf-dashboard-frontend.pid)
    kill $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}Frontend Dashboard stopped (PID: $FRONTEND_PID)${NC}"
    rm /tmp/wuphf-dashboard-frontend.pid
fi

# Also kill by process name as fallback
pkill -f "agent_dashboard_api.py"
pkill -f "next dev"

echo -e "${GREEN}All services stopped${NC}"