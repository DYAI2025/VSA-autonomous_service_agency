#!/usr/bin/env python3
"""
Learning Bridge - Verbindet WUPHF Learning System mit anderen Komponenten

Diese Bridge ermöglicht es Ruflo, Hermes und Ralph, das WUPHF Learning System
zu nutzen für Knowledge Sharing, Pattern Recognition und Self-Reflection.
"""

import sys
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime

# Add WUPHF providers to path
WUPHF_PATH = Path("/home/dyai/.wuphf-spaces/main/.wuphf")
PROVIDERS_PATH = WUPHF_PATH / "providers"
if str(PROVIDERS_PATH) not in sys.path:
    sys.path.insert(0, str(PROVIDERS_PATH))


class LearningBridge:
    """
    Bridge zu WUPHF Learning System

    Ermöglicht anderen Systemen, auf das Learning System zuzugreifen.
    """

    def __init__(self, base_path: str = None):
        """
        Initialisiert die Learning Bridge

        Args:
            base_path: Pfad zum .wuphf Verzeichnis
        """
        try:
            from agent_learning_system import AgentLearningSystem
            self.learning_system = AgentLearningSystem(base_path)
            self.available = True
        except Exception as e:
            print(f"Warning: Could not initialize Learning System: {e}")
            self.learning_system = None
            self.available = False

    def is_available(self) -> bool:
        """Prüft, ob das Learning System verfügbar ist"""
        return self.available

    def get_knowledge(self, query: str, category: str = None) -> List[Dict[str, Any]]:
        """
        Holt Wissen aus der Knowledge Base

        Args:
            query: Suchbegriff
            category: Optionale Kategorie

        Returns:
            Liste relevanter Wissens-Einträge
        """
        if not self.available:
            return []

        knowledge = self.learning_system.search_knowledge(query, category)
        return [item.to_dict() for item in knowledge]

    def add_knowledge(
        self,
        category: str,
        title: str,
        content: str,
        source_agent: str,
        confidence: float = 0.8,
        tags: List[str] = None
    ) -> Optional[str]:
        """
        Fügt Wissen zur Knowledge Base hinzu

        Args:
            category: Kategorie
            title: Titel
            content: Inhalt
            source_agent: Quell-Agent
            confidence: Konfidenz
            tags: Tags

        Returns:
            ID des Eintrags oder None
        """
        if not self.available:
            return None

        return self.learning_system.add_knowledge(
            category, title, content, source_agent, confidence, tags
        )

    def record_event(
        self,
        agent_id: str,
        task_description: str,
        outcome: str,
        event_type: str = "new_insight",
        insights: List[str] = None,
        patterns: List[str] = None,
        metadata: Dict[str, Any] = None
    ) -> Optional[str]:
        """
        Zeichnet ein Lern-Ereignis auf

        Args:
            agent_id: Agent ID
            task_description: Aufgabenbeschreibung
            outcome: Ergebnis
            event_type: Ereignistyp
            insights: Einsichten
            patterns: Muster
            metadata: Metadaten

        Returns:
            ID des Ereignisses oder None
        """
        if not self.available:
            return None

        from agent_learning_system import LearningEventType

        # Map string to enum
        event_type_map = {
            "task_success": LearningEventType.TASK_SUCCESS,
            "task_failure": LearningEventType.TASK_FAILURE,
            "error_recovery": LearningEventType.ERROR_RECOVERY,
            "pattern_discovery": LearningEventType.PATTERN_DISCOVERY,
            "optimization": LearningEventType.OPTIMIZATION,
            "new_insight": LearningEventType.NEW_INSIGHT,
        }

        enum_type = event_type_map.get(event_type, LearningEventType.NEW_INSIGHT)

        return self.learning_system.record_learning_event(
            agent_id=agent_id,
            task_description=task_description,
            outcome=outcome,
            event_type=enum_type,
            insights=insights,
            patterns=patterns,
            metadata=metadata
        )

    def get_agent_stats(self, agent_id: str) -> Dict[str, Any]:
        """
        Holt Statistiken für einen Agenten

        Args:
            agent_id: Agent ID

        Returns:
            Statistiken-Dict
        """
        if not self.available:
            return {}

        return self.learning_system.get_agent_learning_stats(agent_id)

    def get_system_health(self) -> Dict[str, Any]:
        """
        Holt System Health Status

        Returns:
            Health Status Dict
        """
        if not self.available:
            return {}

        return self.learning_system.get_system_health()

    def perform_reflection(
        self,
        agent_id: str,
        task_description: str,
        outcome: str,
        errors: List[str] = None,
        successes: List[str] = None
    ) -> Dict[str, Any]:
        """
        Führt Self-Reflection durch

        Args:
            agent_id: Agent ID
            task_description: Aufgabenbeschreibung
            outcome: Ergebnis
            errors: Fehler
            successes: Erfolge

        Returns:
            Reflection Ergebnisse
        """
        if not self.available:
            return {}

        return self.learning_system.perform_self_reflection(
            agent_id=agent_id,
            task_description=task_description,
            outcome=outcome,
            errors=errors,
            successes=successes
        )


# Singleton-Instanz
_bridge_instance = None

def get_learning_bridge(base_path: str = None) -> LearningBridge:
    """Gibt die Singleton-Instanz der Learning Bridge zurück"""
    global _bridge_instance
    if _bridge_instance is None:
        _bridge_instance = LearningBridge(base_path)
    return _bridge_instance


if __name__ == "__main__":
    # Test
    bridge = LearningBridge()
    print(f"Learning Bridge available: {bridge.is_available()}")

    if bridge.is_available():
        print("System Health:", bridge.get_system_health())
        print("Agent Stats:", bridge.get_agent_stats("test_agent"))