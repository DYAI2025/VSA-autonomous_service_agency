# WUPHF Combined Dashboard

Ein kombiniertes Frontend, das Agent-Überwachung und Ideen-Management vereint.

## Features

### Agent Dashboard
- **Live-Agent-Überwachung**: CEO, SDR, Research, Content Agents in Echtzeit
- **Dialog-Historie**: Konversationsverlauf mit Filter nach Agenten
- **Thought-Viewer**: Interne Reasoning-Prozesse der Agents
- **Knowledge-Browser**: Gelernte Insights und Patterns
- **WebSocket Live-Updates**: Echtzeit-Updates ohne Refresh

### Ideen Management
- **Drag-and-Drop Upload**: Dateien einfach hochladen (.md, .txt, .json, .yaml, .yml)
- **Ideen-Suche**: Volltextsuche im Ideen-Repository
- **Phasen-basierte Organisation**: Seed → Sprout → Growth → Flower → Harvest
- **Graph-Visualisierung**: 2D Graph der Ideen-Verbindungen
- **Kanban-Board**: Task-Management mit Drag-and-Drop

## Installation

```bash
cd /home/dyai/wuphf-agency-output/agent-dashboard
npm install
```

## Konfiguration

Erstelle eine `.env.local` Datei basierend auf `.env.local.example`:

```bash
cp .env.local.example .env.local
```

Konfiguriere die API-URLs:

```env
# Agent API (Port 8001)
AGENT_API_URL=http://localhost:8001/api

# Ideen API (Standard auch Port 8001, oder Railway URL)
IDEEN_API_URL=http://localhost:8001/api
```

Für Railway Deployment:

```env
IDEEN_API_URL=https://your-railway-app.railway.app/api
```

## Starten

```bash
npm run dev
```

Das Dashboard ist dann verfügbar unter: http://localhost:3000

## Backend Voraussetzungen

### Agent API
Der Agent-Backend muss auf Port 8001 laufen:

```bash
# Starte den Agent-Backend
cd /path/to/agent-backend
python -m uvicorn src.main:app --host 0.0.0.0 --port 8001
```

### Ideen API
Der Ideen-Backend kann auf demselben Port (8001) oder einem separaten Port laufen.

Für lokalen Test mit dem Ideen-Backend:

```bash
cd /tmp/ideen-ingest-channel-fixed/backend
python -m uvicorn src.main:app --host 0.0.0.0 --port 8001
```

Für Railway:

1. Deploye das Ideen-Backend auf Railway
2. Kopiere die Railway URL
3. Setze `IDEEN_API_URL` in `.env.local`

## Navigation

### Hauptnavigation
- **Agent Dashboard**: Live-Überwachung der Agent-Workforce
- **Ideen Management**: Ideen-Ingest und Management

### Agent Dashboard Sub-Tabs
- **Overview**: System-Status und Agent-Workforce
- **Dialogs**: Konversationshistorie
- **Thoughts**: Interne Reasoning-Prozesse
- **Knowledge**: Gelernte Insights

### Ideen Management Views
- **List View**: Upload, Suche und Listenansicht
- **Graph View**: 2D Graph-Visualisierung
- **Kanban Board**: Task-Management

## API Endpoints

### Agent API (Port 8001)
- `GET /api/system/status` - System-Status
- `GET /api/dialogs` - Dialog-Historie
- `GET /api/thoughts` - Agent-Thoughts
- `GET /api/knowledge` - Knowledge Base
- `WS /ws` - WebSocket für Live-Updates

### Ideen API (konfigurierbar)
- `POST /api/ingest/upload` - Datei-Upload
- `GET /api/ingest/files` - Dateiliste
- `DELETE /api/ingest/files/:filename` - Datei löschen
- `GET /api/ideas/list` - Ideenliste
- `GET /api/ideas/search` - Ideen-Suche
- `GET /api/graph/full-graph` - Graph-Daten
- `GET /api/kanban/board` - Kanban-Daten
- `POST /api/kanban/board` - Kanban speichern
- `POST /api/kanban/task` - Task erstellen
- `DELETE /api/kanban/task/:id` - Task löschen
- `POST /api/sync/kanban` - GBrain → Kanban Sync

## Technologien

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS 4**
- **React Dropzone** (Drag-and-Drop)
- **Axios** (HTTP Client)
- **@hello-pangea/dnd** (Drag-and-Drop für Kanban)
- **Remix Icon** (Icons)
- **WebSocket** (Live-Updates)

## Troubleshooting

### Verbindung zum Agent-Backend fehlschlägt
- Prüfe, ob der Backend auf Port 8001 läuft: `curl http://localhost:8001/health`
- Prüfe die Firewall-Einstellungen

### Verbindung zum Ideen-Backend fehlschlägt
- Prüfe die `IDEEN_API_URL` in `.env.local`
- Für Railway: Prüfe, ob die Railway URL korrekt ist
- Teste die Verbindung: `curl $IDEEN_API_URL/health`

### Drag-and-Drop funktioniert nicht
- Prüfe, ob die Dateiendung unterstützt wird (.md, .txt, .json, .yaml, .yml)
- Prüfe die Browser-Konsole auf Fehler

### WebSocket keine Live-Updates
- Prüfe, ob der WebSocket auf `ws://localhost:8001/ws` erreichbar ist
- Prüfe die Browser-Konsole auf WebSocket-Fehler

## Build für Produktion

```bash
npm run build
npm start
```

## Lizenz

MIT