# WUPHF Agent Dashboard

Ein funktionales Live-Überwachungs-Dashboard für das WUPHF-Agentensystem mit Integration in das Learning-System.

## Features

### Backend API (Port 8001)
- **REST-Endpoints** für Agenten-Status, Aufgaben, Dialoge, Thoughts und Knowledge Base
- **WebSocket-Support** für Live-Updates
- **Learning-System Integration** für Echtzeit-Lernstatistiken
- **FastAPI** mit automatischer API-Dokumentation

### Frontend Dashboard (Port 3001)
- **Live-Überwachung** aller Agenten in Echtzeit
- **Dialog-Interface** zur Anzeige der Agentenkommunikation
- **Thought-Viewer** für interne Agenten-Reasoning
- **Knowledge-Browser** durchsuchbare Wissensdatenbank
- **WebSocket-Integration** für automatische Updates

## Installation

### Backend
```bash
cd /home/dyai/.wuphf-spaces/main/.wuphf
python3 -m venv venv
./venv/bin/pip install fastapi uvicorn websockets
```

### Frontend
```bash
cd /home/dyai/wuphf-agency-output/agent-dashboard
npm install
```

## Starten

### Automatisch (Empfohlen)
```bash
cd /home/dyai/wuphf-agency-output/agent-dashboard
./start-dashboard.sh
```

### Manuelles Starten

Backend API:
```bash
cd /home/dyai/.wuphf-spaces/main/.wuphf
./venv/bin/python providers/agent_dashboard_api.py
```

Frontend Dashboard:
```bash
cd /home/dyai/wuphf-agency-output/agent-dashboard
npm run dev
```

## Stoppen

```bash
cd /home/dyai/wuphf-agency-output/agent-dashboard
./stop-dashboard.sh
```

## Zugriff

- **Frontend Dashboard**: http://localhost:3001
- **Backend API**: http://localhost:8001
- **API Dokumentation**: http://localhost:8001/docs

## API Endpoints

### System Status
- `GET /api/health` - Health Check
- `GET /api/system/status` - Vollständiger System-Status

### Agenten
- `GET /api/agents` - Alle Agenten
- `GET /api/agents/{agent_id}` - Spezifischer Agent

### Aufgaben
- `GET /api/tasks` - Alle Aufgaben
- `GET /api/tasks/{task_id}` - Spezifische Aufgabe

### Dialoge
- `GET /api/dialogs` - Alle Dialoge
- `POST /api/agents/{agent_id}/message` - Nachricht an Agenten senden

### Thoughts
- `GET /api/thoughts` - Alle Thoughts
- `GET /api/thoughts?agent_id={id}` - Thoughts nach Agent filtern

### Knowledge Base
- `GET /api/knowledge` - Alle Knowledge Items
- `GET /api/knowledge?query={text}` - Knowledge durchsuchen
- `GET /api/knowledge/{id}` - Spezifisches Knowledge Item

### Patterns
- `GET /api/patterns` - Erkannte Muster

### WebSocket
- `WS /ws` - Live-Updates

## Dashboard Tabs

### Overview
- System-Status Übersicht
- Agenten-Workforce Anzeige
- Aufgaben-Statistiken
- Learning-System Status

### Dialogs
- Agenten-Kommunikationshistorie
- Filter nach Agent
- Zeitstempel und Rollen

### Thoughts
- Interne Agenten-Reasoning
- Insights und Muster
- Konfidenz-Anzeigen

### Knowledge
- Durchsuchbare Wissensdatenbank
- Kategorisierte Einträge
- Usage-Tracking

## Integration mit WUPHF-System

Das Dashboard ist vollständig in das bestehende WUPHF-System integriert:

- **Learning-System**: Greift auf `agent_learning_system.py` zu
- **Konfiguration**: Liest `config.json` für Agenten-Konfiguration
- **Logs**: Liest Dialoge aus dem `logs/` Verzeichnis
- **Knowledge**: Nutzt die bestehende Knowledge Base

## Technologie-Stack

### Backend
- Python 3.12
- FastAPI
- Uvicorn
- WebSockets

### Frontend
- Next.js 16.2.6
- React 19
- TypeScript
- Tailwind CSS 4
- Remix Icons

## Entwicklung

### Backend hinzufügen
```bash
cd /home/dyai/.wuphf-spaces/main/.wuphf/providers
# Edit agent_dashboard_api.py
```

### Frontend hinzufügen
```bash
cd /home/dyai/wuphf-agency-output/agent-dashboard
# Edit app/page.tsx or add components
```

## Troubleshooting

### Backend startet nicht
- Prüfen ob Port 8001 frei ist: `lsof -i :8001`
- Prüfen ob venv existiert: `ls -la venv/`
- Logs prüfen: `./venv/bin/python providers/agent_dashboard_api.py`

### Frontend startet nicht
- Prüfen ob Port 3001 frei ist: `lsof -i :3001`
- Dependencies installieren: `npm install`
- Next.js Cache löschen: `rm -rf .next`

### WebSocket Verbindung fehlgeschlagen
- Prüfen ob Backend läuft: `curl http://localhost:8001/api/health`
- Browser Console auf Fehler prüfen
- CORS-Settings prüfen

## Lizenz

Dieses Dashboard ist Teil des WUPHF-Agentensystems.