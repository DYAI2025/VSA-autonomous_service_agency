#!/usr/bin/env python3
"""
Agent Coordinator - Zentrale Koordination aller Agent-Systeme

Dieser Coordinator verbindet Ruflo, Hermes GEPA, Ralph und WUPHF Learning
zu einem integrierten, autonomen Agentensystem.
"""

import sys
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime
import json

# Import Bridges
from learning_bridge import LearningBridge, get_learning_bridge
from gepa_bridge import GEPABridge, get_gepa_bridge
from ralph_bridge import RalphBridge, get_ralph_bridge


class AgentCoordinator:
    """
    Zentraler Coordinator für alle Agent-Systeme

    Verbindet:
    - Ruflo (Orchestrierung)
    - Hermes GEPA (Self-Evolution)
    - Ralph (Task Execution)
    - WUPHF Learning (Knowledge & Memory)
    """

    def __init__(
        self,
        wuphf_path: str = None,
        hermes_path: str = None,
        ralph_path: str = None,
        ruflo_path: str = None
    ):
        """
        Initialisiert den Agent Coordinator

        Args:
            wuphf_path: Pfad zu WUPHF
            hermes_path: Pfad zu Hermes GEPA
            ralph_path: Pfad zu Ralph
            ruflo_path: Pfad zu Ruflo
        """
        # Default Pfade
        if wuphf_path is None:
            wuphf_path = "/home/dyai/.wuphf-spaces/main/.wuphf"
        if hermes_path is None:
            hermes_path = "/home/dyai/wuphf-agency-output/hermes-gepa"
        if ralph_path is None:
            ralph_path = "/home/dyai/wuphf-agency-output/ralph-orchestrator"
        if ruflo_path is None:
            ruflo_path = "/home/dyai/wuphf-agency-output/ruflo"

        # Initialisiere Bridges
        self.learning_bridge = LearningBridge(wuphf_path)
        self.gepa_bridge = GEPABridge(hermes_path)
        self.ralph_bridge = RalphBridge(ralph_path)
        self.ruflo_path = Path(ruflo_path)

        # System Status
        self.system_status = {
            "learning_available": self.learning_bridge.is_available(),
            "gepa_available": self.gepa_bridge.is_available(),
            "ralph_available": self.ralph_bridge.is_available(),
            "ruflo_available": self.ruflo_path.exists()
        }

    def get_system_status(self) -> Dict[str, Any]:
        """
        Holt den System Status

        Returns:
            System Status Dict
        """
        status = {
            "timestamp": datetime.now().isoformat(),
            "components": self.system_status.copy(),
            "learning_health": self.learning_bridge.get_system_health() if self.system_status["learning_available"] else {}
        }
        return status

    def execute_agent_task(
        self,
        agent_id: str,
        task_description: str,
        hat: str = "code-assist",
        use_learning: bool = True,
        enable_evolution: bool = False
    ) -> Dict[str, Any]:
        """
        Führt eine Agent-Aufgabe aus mit vollem System-Integration

        Args:
            agent_id: Agent ID
            task_description: Aufgabenbeschreibung
            hat: Ralph Hat für Task Execution
            use_learning: Ob Learning System genutzt werden soll
            enable_evolution: Ob Self-Evolution aktiviert werden soll

        Returns:
            Ergebnisse der Ausführung
        """
        result = {
            "agent_id": agent_id,
            "task": task_description,
            "timestamp": datetime.now().isoformat(),
            "steps": []
        }

        # Step 1: Wissen abrufen (wenn Learning aktiv)
        if use_learning and self.system_status["learning_available"]:
            result["steps"].append({
                "step": "knowledge_retrieval",
                "status": "started"
            })
            knowledge = self.learning_bridge.get_knowledge(task_description)
            result["knowledge_retrieved"] = len(knowledge)
            result["steps"][-1]["status"] = "completed"

        # Step 2: Aufgabe ausführen mit Ralph Hat (wenn Ralph aktiv)
        if self.system_status["ralph_available"]:
            result["steps"].append({
                "step": "task_execution",
                "status": "started"
            })
            task_result = self.ralph_bridge.execute_with_hat(hat, task_description)
            result["task_result"] = task_result
            result["steps"][-1]["status"] = "completed"

        # Step 3: Learning Event aufzeichnen (wenn Learning aktiv)
        if use_learning and self.system_status["learning_available"]:
            result["steps"].append({
                "step": "learning_recording",
                "status": "started"
            })
            event_id = self.learning_bridge.record_event(
                agent_id=agent_id,
                task_description=task_description,
                outcome="completed",
                event_type="task_success"
            )
            result["learning_event_id"] = event_id
            result["steps"][-1]["status"] = "completed"

        # Step 4: Self-Evolution (wenn aktiviert und GEPA verfügbar)
        if enable_evolution and self.system_status["gepa_available"]:
            result["steps"].append({
                "step": "self_evolution",
                "status": "started"
            })
            # Wird später implementiert
            result["steps"][-1]["status"] = "pending"

        return result

    def trigger_skill_evolution(
        self,
        skill_path: str,
        iterations: int = 10
    ) -> Dict[str, Any]:
        """
        Triggert Skill Evolution mit GEPA

        Args:
            skill_path: Pfad zum Skill
            iterations: Anzahl der Iterationen

        Returns:
            Evolution Ergebnisse
        """
        if not self.system_status["gepa_available"]:
            return {
                "status": "failed",
                "error": "GEPA not available"
            }

        return self.gepa_bridge.evolve_skill(skill_path, iterations)

    def get_agent_stats(self, agent_id: str) -> Dict[str, Any]:
        """
        Holt Agent-Statistiken

        Args:
            agent_id: Agent ID

        Returns:
            Statistiken
        """
        if not self.system_status["learning_available"]:
            return {}

        return self.learning_bridge.get_agent_stats(agent_id)

    def perform_self_reflection(
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
        if not self.system_status["learning_available"]:
            return {}

        return self.learning_bridge.perform_reflection(
            agent_id, task_description, outcome, errors, successes
        )

    def add_shared_knowledge(
        self,
        category: str,
        title: str,
        content: str,
        source_agent: str,
        confidence: float = 0.8,
        tags: List[str] = None
    ) -> Optional[str]:
        """
        Fügt geteiltes Wissen hinzu

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
        if not self.system_status["learning_available"]:
            return None

        return self.learning_bridge.add_knowledge(
            category, title, content, source_agent, confidence, tags
        )


# Singleton-Instanz
_coordinator_instance = None

def get_agent_coordinator(
    wuphf_path: str = None,
    hermes_path: str = None,
    ralph_path: str = None,
    ruflo_path: str = None
) -> AgentCoordinator:
    """Gibt die Singleton-Instanz des Agent Coordinators zurück"""
    global _coordinator_instance
    if _coordinator_instance is None:
        _coordinator_instance = AgentCoordinator(
            wuphf_path, hermes_path, ralph_path, ruflo_path
        )
    return _coordinator_instance


if __name__ == "__main__":
    # Test
    coordinator = AgentCoordinator()
    print("System Status:", json.dumps(coordinator.get_system_status(), indent=2))

    # Test Task Execution
    result = coordinator.execute_agent_task(
        agent_id="test_agent",
        task_description="Test task",
        hat="code-assist"
    )
    print("\nTask Result:", json.dumps(result, indent=2))