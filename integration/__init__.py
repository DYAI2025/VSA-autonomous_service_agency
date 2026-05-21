"""
Integration Package für Autonomes Agentensystem

Verbindet Ruflo, Hermes GEPA, Ralph und WUPHF Learning System.
"""

from learning_bridge import LearningBridge, get_learning_bridge
from gepa_bridge import GEPABridge, get_gepa_bridge
from ralph_bridge import RalphBridge, get_ralph_bridge
from agent_coordinator import AgentCoordinator, get_agent_coordinator

__all__ = [
    "LearningBridge",
    "get_learning_bridge",
    "GEPABridge",
    "get_gepa_bridge",
    "RalphBridge",
    "get_ralph_bridge",
    "AgentCoordinator",
    "get_agent_coordinator"
]