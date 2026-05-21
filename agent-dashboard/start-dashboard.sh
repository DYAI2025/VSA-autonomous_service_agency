#!/bin/bash

# WUPHF Agent Dashboard Start Script

echo "Starting WUPHF Agent Dashboard..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# WUPHF Path
WUPHF_PATH="/home/dyai/.wuphf-spaces/main/.wuphf"
DASHBOARD_PATH="/home/dyai/wuphf-agency-output/agent-dashboard"

# Check if directories exist
if [ ! -d "$WUPHF_PATH" ]; then
    echo -e "${RED}Error: WUPHF path not found: $WUPHF_PATH${NC}"
    exit 1
fi

if [ ! -d "$DASHBOARD_PATH" ]; then
    echo -e "${RED}Error: Dashboard path not found: $DASHBOARD_PATH${NC}"
    exit 1
fi

# Start Backend API
echo -e "${YELLOW}Starting Backend API...${NC}"
cd "$WUPHF_PATH"
./venv/bin/python providers/agent_dashboard_api.py &
BACKEND_PID=$!
echo -e "${GREEN}Backend API started with PID: $BACKEND_PID${NC}"
echo -e "${GREEN}Backend API running on: http://localhost:8001${NC}"

# Wait for backend to start
sleep 3

# Start Frontend
echo -e "${YELLOW}Starting Frontend Dashboard...${NC}"
cd "$DASHBOARD_PATH"
npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}Frontend Dashboard started with PID: $FRONTEND_PID${NC}"

# Save PIDs
echo $BACKEND_PID > /tmp/wuphf-dashboard-backend.pid
echo $FRONTEND_PID > /tmp/wuphf-dashboard-frontend.pid

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}WUPHF Agent Dashboard is running!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Frontend: http://localhost:3001${NC}"
echo -e "${GREEN}Backend API: http://localhost:8001${NC}"
echo -e "${GREEN}API Docs: http://localhost:8001/docs${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Press Ctrl+C to stop both services"
echo "Or run: stop-dashboard.sh"

# Wait for interrupt
trap "echo -e '${YELLOW}Stopping services...${NC}'; kill $BACKEND_PID $FRONTEND_PID; rm -f /tmp/wuphf-dashboard-*.pid; exit 0" INT TERM

wait