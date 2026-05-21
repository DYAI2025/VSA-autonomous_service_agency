# Komplettes Setup-Guide für Routing und Agenten

**Datum**: 2026-05-21  
**Status**: Konfiguration aktualisiert für OpenRouter-Integration

---

## 📋 Übersicht

### Architektur
- **Orchestrator Agent**: OpenRouter mit 3-Stufen-Fallback (free → free → Minimax)
- **Worker-Agenten**: Exklusiv Local Ollama (GLM4.7, QWEN2.5, Llama3.2)
- **Guardrails**: Automatische Durchsetzung der Routing-Regeln

---

## 🔧 Schritt 1: API Keys konfigurieren

### 1.1 .env Datei erstellen/bearbeiten
Die .env Datei wurde bereits erstellt unter:
```
/home/dyai/.wuphf-spaces/main/.wuphf/.env
```

### 1.2 OpenRouter API Key eintragen
```bash
# Editieren Sie die .env Datei
nano /home/dyai/.wuphf-spaces/main/.wuphf/.env
```

Tragen Sie Ihren OpenRouter API Key ein:
```env
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**API Key erhalten**: https://openrouter.ai/keys

---

## 🔧 Schritt 2: Ollama Konfiguration

### 2.1 Ollama Base URL
**Standard-URL**: `http://localhost:11434`

**In config.json bereits konfiguriert**:
```json
"ollama": {
  "base_url": "http://localhost:11434",
  "api_key": "",
  "model": "glm-4.7-flash:latest"
}
```

### 2.2 Ollama installieren/verifizieren
```bash
# Prüfen ob Ollama läuft
ollama list

# Falls nicht installiert:
curl -fsSL https://ollama.com/install.sh | sh

# Ollama Service starten
ollama serve
```

### 2.3 Erforderliche Modelle prüfen
```bash
# Prüfen welche Modelle verfügbar sind
ollama list
```

**Erwartete Modelle**:
- ✅ glm-4.7-flash:latest
- ✅ qwen2.5:7b
- ✅ llama3.2:latest

**Fehlende Modelle installieren**:
```bash
ollama pull glm-4.7-flash:latest
ollama pull qwen2.5:7b
ollama pull llama3.2:latest
```

---

## 🔧 Schritt 3: Konfiguration validieren

### 3.1 Guardrails validieren
```bash
cd /home/dyai/.wuphf-spaces/main/.wuphf
python3 providers/routing_guardrails.py
```

**Erwartete Ausgabe**:
```
✅ Alle Routing-Guardrails eingehalten
```

### 3.2 Orchestrator testen
```bash
cd /home/dyai/.wuphf-spaces/main/.wuphf
python3 agents/orchestrator_agent.py
```

**Erwartete Ausgabe**:
```
Orchestrator: orchestrator mit deepseek/deepseek-v4-flash:free
Fallback aktiviert: True
Worker-Agenten (Local Ollama):
  ceo: glm-4.7-flash:latest (ollama)
  sdr: qwen2.5:7b (ollama)
  ...
```

---

## 🔧 Schritt 4: WUPHF neu starten

### 4.1 WUPHF stoppen
```bash
cd /home/dyai/wuphf-agency-output
npx wuphf shred
```

### 4.2 WUPHF neu starten
```bash
cd /home/dyai/wuphf-agency-output
npx wuphf --no-open --web-port 7891
```

---

## 🔧 Schritt 5: Agenten-Aufgabe starten

### 5.1 Web UI öffnen
```
http://localhost:7891
```

### 5.2 Agenten aktivieren
Im #general channel:
```
@orchestrator @team BEGINNT mit Pitch-Deck Strategie-Lernen unter wiki/tasks/00-URGENT-pitch-deck-learning.md
```

---

## 📋 Vollständige Konfigurations-Checkliste

### API Keys
- [ ] OpenRouter API Key in `.env` eingetragen
- [ ] `.env` Datei unter `/home/dyai/.wuphf-spaces/main/.wuphf/`

### Ollama
- [ ] Ollama läuft (`ollama list` funktioniert)
- [ ] Base URL: `http://localhost:11434`
- [ ] GLM4.7-flash:latest installiert
- [ ] QWEN2.5:7b installiert
- [ ] Llama3.2:latest installiert

### Konfiguration
- [ ] `config.json` aktualisiert
- [ ] Guardrails validiert (✅ alle eingehalten)
- [ ] Orchestrator getestet
- [ ] WUPHF neu gestartet

### Agenten
- [ ] Agenten über Web UI aktiviert
- [ ] Pitch-Deck-Learning Aufgabe gestartet
- [ ] Agenten-Arbeit wird beobachtet

---

## 🔍 Troubleshooting

### Problem: OpenRouter API Key nicht gefunden
**Lösung**:
```bash
# Prüfen ob .env Datei existiert
ls -la /home/dyai/wuphf-spaces/main/.wuphf/.env

# Prüfen ob API Key gesetzt ist
cat /home/dyai/.wuphf-spaces/main/.wuphf/.env | grep OPENROUTER
```

### Problem: Ollama nicht erreichbar
**Lösung**:
```bash
# Prüfen ob Ollama läuft
curl http://localhost:11434/api/tags

# Ollama Service starten
ollama serve

# Port prüfen
netstat -tlnp | grep 11434
```

### Problem: Modelle nicht verfügbar
**Lösung**:
```bash
# Modelle installieren
ollama pull glm-4.7-flash:latest
ollama pull qwen2.5:7b
ollama pull llama3.2:latest

# Verfügbare Modelle prüfen
ollama list
```

### Problem: Guardrails verletzt
**Lösung**:
```bash
# Automatische Korrektur
cd /home/diy/.wuphf-spaces/main/.wuphf
python3 providers/routing_guardrails.py --fix
```

---

## 📊 Aktuelle Konfiguration

### OpenRouter Fallback-Kaskade
```
Priority 1: deepseek/deepseek-v4-flash:free (Free)
Priority 2: nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free (Free)
Priority 3: minimax/minimax-m2.7 (über OpenRouter, $0.15/M input)
```

### Local Ollama Modelle
```
CEO: glm-4.7-flash:latest
SDR: qwen2.5:7b
Research: qwen2.5:7b
Content: llama3.2:latest
Analyst: glm-4.7-flash:latest
```

### Guardrails
```json
{
  "enforce_local_only_for_workers": true,
  "allowed_local_models": [
    "glm-4.7-flash:latest",
    "qwen2.5:7b",
    "llama3.2:latest"
  ],
  "orchestrator_cloud_access": true,
  "worker_cloud_access": false
}
```

---

## 🚀 Nächste Schritte

1. **API Key eintragen**: OpenRouter API Key in `.env`
2. **Ollama verifizieren**: Sicherstellen dass alle Modelle verfügbar sind
3. **Guardrails validieren**: `python3 providers/routing_guardrails.py`
4. **WUPHF neu starten**: Mit aktualisierter Konfiguration
5. **Agenten aktivieren**: Pitch-Deck-Learning Aufgabe starten

---

## 📞 Support

Bei Problemen:
1. Guardrails-Status prüfen: `python3 providers/routing_guardrails.py`
2. Ollama-Status prüfen: `ollama list`
3. Config-Validierung: `python3 agents/orchestrator_agent.py`

**Status**: ✅ Konfiguration aktualisiert für OpenRouter-Integration  
**Guardrails**: ✅ Validiert und aktiv  
**Nächster Schritt**: API Key eintragen und Agenten aktivieren