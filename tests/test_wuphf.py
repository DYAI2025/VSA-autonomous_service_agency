#!/usr/bin/env python3
"""
WUPHF Learning System Integration Tests

Tests für WUPHF Learning System Integration.
Folgt TDD-Prinzip: Tests werden zuerst geschrieben, dann Implementation.
"""

import os
import sys
import json
from pathlib import Path
from typing import Dict, Any
import pytest


# Add WUPHF providers to path
WUPHF_PATH = Path("/home/dyai/.wuphf-spaces/main/.wuphf")
PROVIDERS_PATH = WUPHF_PATH / "providers"
if str(PROVIDERS_PATH) not in sys.path:
    sys.path.insert(0, str(PROVIDERS_PATH))


class TestWUPHFInstallation:
    """Testet WUPHF Learning System Installation"""

    def test_wuphf_directory_exists(self):
        """Test: WUPHF Directory existiert"""
        assert WUPHF_PATH.exists(), "WUPHF Directory nicht gefunden"

    def test_wuphf_providers_exist(self):
        """Test: WUPHF Providers existieren"""
        assert PROVIDERS_PATH.exists(), "WUPHF Providers nicht gefunden"
        assert (PROVIDERS_PATH / "agent_learning_system.py").exists(), \
            "agent_learning_system.py nicht gefunden"
        assert (PROVIDERS_PATH / "learning_integration.py").exists(), \
            "learning_integration.py nicht gefunden"

    def test_wuphf_knowledge_base_exists(self):
        """Test: WUPHF Knowledge Base existiert"""
        knowledge_file = WUPHF_PATH / "knowledge_base.json"
        assert knowledge_file.exists(), "knowledge_base.json nicht gefunden"


class TestWUPHFLearningSystem:
    """Testet WUPHF Learning System Funktionalität"""

    def test_learning_system_importable(self):
        """Test: Learning System kann importiert werden"""
        try:
            from agent_learning_system import AgentLearningSystem
            assert True, "Learning System import erfolgreich"
        except ImportError as e:
            pytest.fail(f"Learning System Import fehlgeschlagen: {e}")

    def test_learning_system_initializable(self):
        """Test: Learning System kann initialisiert werden"""
        try:
            from agent_learning_system import AgentLearningSystem
            ls = AgentLearningSystem(str(WUPHF_PATH))
            assert ls is not None, "Learning System konnte nicht initialisiert werden"
        except Exception as e:
            pytest.fail(f"Learning System Initialisierung fehlgeschlagen: {e}")

    def test_knowledge_base_readable(self):
        """Test: Knowledge Base kann gelesen werden"""
        try:
            from agent_learning_system import AgentLearningSystem
            ls = AgentLearningSystem(str(WUPHF_PATH))
            kb_size = len(ls.knowledge_base)
            assert kb_size >= 0, "Knowledge Base konnte nicht gelesen werden"
        except Exception as e:
            pytest.fail(f"Knowledge Base Lesen fehlgeschlagen: {e}")

    def test_knowledge_search(self):
        """Test: Knowledge Search funktioniert"""
        try:
            from agent_learning_system import AgentLearningSystem
            ls = AgentLearningSystem(str(WUPHF_PATH))
            results = ls.search_knowledge("test")
            assert isinstance(results, list), "Search Ergebnisse sind keine Liste"
        except Exception as e:
            pytest.fail(f"Knowledge Search fehlgeschlagen: {e}")

    def test_learning_event_recording(self):
        """Test: Learning Events können aufgezeichnet werden"""
        try:
            from agent_learning_system import AgentLearningSystem, LearningEventType
            ls = AgentLearningSystem(str(WUPHF_PATH))
            event_id = ls.record_learning_event(
                agent_id="test_agent",
                task_description="Test task",
                outcome="success",
                event_type=LearningEventType.TASK_SUCCESS
            )
            assert event_id is not None, "Learning Event konnte nicht aufgezeichnet werden"
        except Exception as e:
            pytest.fail(f"Learning Event Recording fehlgeschlagen: {e}")


class TestWUPHFLearningIntegration:
    """Testet WUPHF Learning Integration"""

    def test_learning_integration_importable(self):
        """Test: Learning Integration kann importiert werden"""
        try:
            from learning_integration import LearningIntegration
            assert True, "Learning Integration import erfolgreich"
        except ImportError as e:
            pytest.fail(f"Learning Integration Import fehlgeschlagen: {e}")

    def test_learning_integration_initializable(self):
        """Test: Learning Integration kann initialisiert werden"""
        try:
            from learning_integration import create_learning_integration
            li = create_learning_integration("test_agent", str(WUPHF_PATH))
            assert li is not None, "Learning Integration konnte nicht initialisiert werden"
        except Exception as e:
            pytest.fail(f"Learning Integration Initialisierung fehlgeschlagen: {e}")


class TestWUPHFBridge:
    """Testet WUPHF Bridge zu anderen Systemen"""

    def test_wuphf_ruflo_bridge_exists(self):
        """Test: Bridge zu Ruflo existiert"""
        bridge_path = Path("/home/dyai/wuphf-agency-output/integration/learning_bridge.py")
        assert bridge_path.exists(), "Learning Bridge nicht gefunden"

    def test_wuphf_hermes_bridge_exists(self):
        """Test: Bridge zu Hermes existiert"""
        bridge_path = Path("/home/dyai/wuphf-agency-output/integration/learning_bridge.py")
        assert bridge_path.exists(), "Learning Bridge nicht gefunden"


class TestWUPHFSelfReflection:
    """Testet WUPHF Self-Reflection"""

    def test_self_reflection_possible(self):
        """Test: Self-Reflection kann durchgeführt werden"""
        try:
            from agent_learning_system import AgentLearningSystem
            ls = AgentLearningSystem(str(WUPHF_PATH))
            reflection = ls.perform_self_reflection(
                agent_id="test_agent",
                task_description="Test task",
                outcome="success",
                errors=[],
                successes=["Test success"]
            )
            assert reflection is not None, "Self-Reflection fehlgeschlagen"
            assert "learned_insights" in reflection, "Reflection hat keine learned_insights"
        except Exception as e:
            pytest.fail(f"Self-Reflection fehlgeschlagen: {e}")

    def test_system_health_check(self):
        """Test: System Health Check funktioniert"""
        try:
            from agent_learning_system import AgentLearningSystem
            ls = AgentLearningSystem(str(WUPHF_PATH))
            health = ls.get_system_health()
            assert health is not None, "System Health Check fehlgeschlagen"
            assert "knowledge_base_size" in health, "Health hat keine knowledge_base_size"
        except Exception as e:
            pytest.fail(f"System Health Check fehlgeschlagen: {e}")


if __name__ == "__main__":
    # Run tests
    pytest.main([__file__, "-v", "-s"])