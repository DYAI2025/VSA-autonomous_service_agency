'use client';

import { useEffect, useState, useRef } from 'react';
import { RiCpuLine, RiRobotLine, RiDatabase2Line, RiTaskLine, RiFlashlightLine, RiRefreshLine, RiPlayLine, RiStopLine, RiMessage3Line, RiBrainLine, RiBook2Line, RiDashboardLine, RiLightbulbLine } from '@remixicon/react';
import IdeenManagement from './components/ideen/IdeenManagement';
import GBrainSemanticGraph from './components/gbrain/GBrainSemanticGraph';
import ErrorBoundary from './components/ErrorBoundary';

// API Base URLs
const AGENT_API_BASE_URL = 'http://localhost:8001/api';
const IDEEN_API_BASE_URL = process.env.NEXT_PUBLIC_IDEEN_API_URL || 'http://localhost:8001/api';

interface SystemStatus {
  timestamp: string;
  config: {
    mode: string;
    max_concurrent_agents: number;
    team_lead_slug: string;
  };
  learning_system: {
    knowledge_base_size: number;
    total_learning_events: number;
    total_patterns: number;
    active_agents: number;
    last_activity: string;
  };
  agents: Agent[];
  tasks: {
    total: number;
    pending: number;
    in_progress: number;
    completed: number;
    failed: number;
  };
}

interface Agent {
  id: string;
  name: string;
  status: string;
  current_task: string | null;
  tasks_completed: number;
  tasks_failed: number;
  last_activity: string;
  skills: string[];
  model: string;
}

type MainView = 'agent-dashboard' | 'ideen-management';

export default function Dashboard() {
  const [mainView, setMainView] = useState<MainView>('agent-dashboard');
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');
  const [activeTab, setActiveTab] = useState<'overview' | 'dialogs' | 'thoughts' | 'knowledge' | 'gbrain-graph'>('overview');
  const wsRef = useRef<WebSocket | null>(null);

  const fetchSystemStatus = async () => {
    try {
      const response = await fetch(`${AGENT_API_BASE_URL}/system/status`);
      if (!response.ok) throw new Error('Failed to fetch system status');

      const data = await response.json();
      if (data.success) {
        setSystemStatus(data.data);
        setLastUpdate(new Date().toLocaleTimeString());
        setConnectionStatus('connected');
      }
    } catch (error) {
      console.error('Failed to fetch system status:', error);
      setConnectionStatus('disconnected');
    } finally {
      setLoading(false);
    }
  };

  // WebSocket Connection (only for agent dashboard)
  useEffect(() => {
    if (mainView !== 'agent-dashboard') return;

    const connectWebSocket = () => {
      try {
        const ws = new WebSocket('ws://localhost:8001/ws');
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('WebSocket connected');
          setConnectionStatus('connected');
          ws.send(JSON.stringify({ type: 'subscribe' }));
        };

        ws.onmessage = (event) => {
          const message = JSON.parse(event.data);

          if (message.type === 'system_status' && message.data.success) {
            setSystemStatus(message.data.data);
            setLastUpdate(new Date().toLocaleTimeString());
          }
        };

        ws.onclose = () => {
          console.log('WebSocket disconnected');
          setConnectionStatus('disconnected');
          setTimeout(connectWebSocket, 5000);
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setConnectionStatus('disconnected');
        };
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
        setConnectionStatus('disconnected');
        setTimeout(fetchSystemStatus, 5000);
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [mainView]);

  useEffect(() => {
    if (mainView === 'agent-dashboard') {
      fetchSystemStatus();
    }
  }, [mainView]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success';
      case 'busy': return 'bg-warning';
      case 'idle': return 'bg-text-muted';
      case 'error': return 'bg-error';
      default: return 'bg-text-muted';
    }
  };

  const getConnectionColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-success';
      case 'disconnected': return 'text-error';
      case 'connecting': return 'text-warning';
      default: return 'text-text-muted';
    }
  };

  const renderOverview = () => {
    if (!systemStatus) return null;

    return (
      <>
        {/* System Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="card rounded-lg p-6 animate-slide-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface-light flex items-center justify-center">
                  <RiCpuLine className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-text-secondary text-xs uppercase tracking-wider">System Mode</h3>
                  <p className="text-primary font-bold text-lg">{systemStatus.config.mode.toUpperCase()}</p>
                </div>
              </div>
              <div className="status-dot bg-success"></div>
            </div>
            <div className="text-text-muted text-xs">
              {systemStatus.config.max_concurrent_agents} concurrent agents
            </div>
          </div>

          <div className="card rounded-lg p-6 animate-slide-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface-light flex items-center justify-center">
                  <RiFlashlightLine className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <h3 className="text-text-secondary text-xs uppercase tracking-wider">Active Tasks</h3>
                  <p className="text-text-primary font-bold text-lg">
                    {systemStatus.tasks.total}
                  </p>
                </div>
              </div>
              <div className="status-dot bg-warning"></div>
            </div>
            <div className="text-text-muted text-xs">
              {systemStatus.tasks.pending} pending, {systemStatus.tasks.in_progress} in progress
            </div>
          </div>

          <div className="card rounded-lg p-6 animate-slide-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface-light flex items-center justify-center">
                  <RiDatabase2Line className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h3 className="text-text-secondary text-xs uppercase tracking-wider">Learning System</h3>
                  <p className="text-primary font-bold text-lg">
                    {systemStatus.learning_system.knowledge_base_size} Items
                  </p>
                </div>
              </div>
              <div className="status-dot bg-success"></div>
            </div>
            <div className="text-text-muted text-xs">
              {systemStatus.learning_system.total_learning_events} learning events
            </div>
          </div>
        </div>

        {/* Agent Workforce */}
        <div className="card rounded-lg p-6 mb-6 animate-slide-in" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-surface-light flex items-center justify-center">
                <RiRobotLine className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-text-secondary text-xs uppercase tracking-wider">Agent Workforce</h3>
                <p className="text-text-primary">Real-time agent status</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-success/10 border border-success/30 text-success rounded-lg flex items-center gap-2">
                <RiPlayLine className="w-4 h-4" />
                ACTIVE
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {systemStatus.agents.map((agent, index) => (
              <div key={agent.id} className="tech-border rounded-lg p-4 bg-surface-light" style={{ animationDelay: `${0.5 + index * 0.1}s` }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`status-dot ${getStatusColor(agent.status)}`}></div>
                    <h4 className="font-bold text-text-primary">{agent.name}</h4>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${agent.status === 'busy' ? 'bg-warning/10 text-warning border border-warning/30' : 'bg-success/10 text-success border border-success/30'}`}>
                    {agent.status.toUpperCase()}
                  </span>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-text-muted">Completed</span>
                    <span className="text-text-primary">{agent.tasks_completed}</span>
                  </div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-text-muted">Failed</span>
                    <span className="text-text-primary">{agent.tasks_failed}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-text-muted">Model</span>
                    <span className="text-text-primary text-xs">{agent.model}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {agent.skills.map((skill) => (
                    <span key={skill} className="text-xs px-2 py-1 bg-surface rounded text-text-secondary border border-border">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Task Statistics */}
        <div className="card rounded-lg p-6 animate-slide-in" style={{ animationDelay: '0.8s' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-surface-light flex items-center justify-center">
              <RiTaskLine className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-text-secondary text-xs uppercase tracking-wider">Task Statistics</h3>
              <p className="text-text-primary">Overall task performance</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="tech-border rounded-lg p-4 bg-surface-light text-center">
              <p className="text-text-muted text-xs mb-1">Total</p>
              <p className="text-text-primary font-bold text-2xl">{systemStatus.tasks.total}</p>
            </div>
            <div className="tech-border rounded-lg p-4 bg-surface-light text-center">
              <p className="text-text-muted text-xs mb-1">Pending</p>
              <p className="text-warning font-bold text-2xl">{systemStatus.tasks.pending}</p>
            </div>
            <div className="tech-border rounded-lg p-4 bg-surface-light text-center">
              <p className="text-text-muted text-xs mb-1">In Progress</p>
              <p className="text-primary font-bold text-2xl">{systemStatus.tasks.in_progress}</p>
            </div>
            <div className="tech-border rounded-lg p-4 bg-surface-light text-center">
              <p className="text-text-muted text-xs mb-1">Completed</p>
              <p className="text-success font-bold text-2xl">{systemStatus.tasks.completed}</p>
            </div>
          </div>
        </div>
      </>
    );
  };

  if (mainView === 'agent-dashboard' && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-text-secondary animate-pulse">Connecting to WUPHF System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <header className="mb-8 animate-slide-in">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-surface border border-border flex items-center justify-center">
              {mainView === 'agent-dashboard' ? (
                <RiRobotLine className="w-6 h-6 text-primary" />
              ) : (
                <RiLightbulbLine className="w-6 h-6 text-primary" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-glow">
                {mainView === 'agent-dashboard' ? 'WUPHF AGENT DASHBOARD' : 'IDEEN MANAGEMENT'}
              </h1>
              <p className="text-text-secondary text-sm">
                {mainView === 'agent-dashboard' ? 'Live Agent Monitoring System' : 'Idea ingestion and management system'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {mainView === 'agent-dashboard' && (
              <>
                <div className="text-right">
                  <p className="text-text-muted text-xs">CONNECTION</p>
                  <p className={`font-mono text-sm ${getConnectionColor()}`}>
                    ● {connectionStatus.toUpperCase()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-text-muted text-xs">LAST UPDATE</p>
                  <p className="text-primary font-mono">{lastUpdate}</p>
                </div>
                <button
                  onClick={fetchSystemStatus}
                  className="px-4 py-2 bg-surface border border-border rounded-lg hover:border-primary transition-colors flex items-center gap-2"
                >
                  <RiRefreshLine className="w-4 h-4" />
                  REFRESH
                </button>
              </>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMainView('agent-dashboard')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              mainView === 'agent-dashboard'
                ? 'bg-primary text-black font-bold'
                : 'bg-surface border border-border text-text-secondary hover:border-primary'
            }`}
          >
            <RiDashboardLine className="w-4 h-4" />
            Agent Dashboard
          </button>
          <button
            onClick={() => setMainView('ideen-management')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              mainView === 'ideen-management'
                ? 'bg-primary text-black font-bold'
                : 'bg-surface border border-border text-text-secondary hover:border-primary'
            }`}
          >
            <RiLightbulbLine className="w-4 h-4" />
            Ideen Management
          </button>
        </div>

        {/* Agent Dashboard Sub-Navigation */}
        {mainView === 'agent-dashboard' && (
          <>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  activeTab === 'overview'
                    ? 'bg-primary text-black font-bold'
                    : 'bg-surface border border-border text-text-secondary hover:border-primary'
                }`}
              >
                <RiRobotLine className="w-4 h-4" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab('dialogs')}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  activeTab === 'dialogs'
                    ? 'bg-primary text-black font-bold'
                    : 'bg-surface border border-border text-text-secondary hover:border-primary'
                }`}
              >
                <RiMessage3Line className="w-4 h-4" />
                Dialogs
              </button>
              <button
                onClick={() => setActiveTab('thoughts')}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  activeTab === 'thoughts'
                    ? 'bg-primary text-black font-bold'
                    : 'bg-surface border border-border text-text-secondary hover:border-primary'
                }`}
              >
                <RiBrainLine className="w-4 h-4" />
                Thoughts
              </button>
              <button
                onClick={() => setActiveTab('knowledge')}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  activeTab === 'knowledge'
                    ? 'bg-primary text-black font-bold'
                    : 'bg-surface border border-border text-text-secondary hover:border-primary'
                }`}
              >
                <RiBook2Line className="w-4 h-4" />
                Knowledge
              </button>
              <button
                onClick={() => setActiveTab('gbrain-graph')}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  activeTab === 'gbrain-graph'
                    ? 'bg-primary text-black font-bold'
                    : 'bg-surface border border-border text-text-secondary hover:border-primary'
                }`}
              >
                <RiBrainLine className="w-4 h-4" />
                GBrain Graph
              </button>
            </div>
          </>
        )}

        <div className="h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
      </header>

      {/* Main Content */}
      {mainView === 'agent-dashboard' ? (
        <>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'dialogs' && <DialogsTab API_BASE_URL={AGENT_API_BASE_URL} />}
          {activeTab === 'thoughts' && <ThoughtsTab API_BASE_URL={AGENT_API_BASE_URL} />}
          {activeTab === 'knowledge' && <KnowledgeTab API_BASE_URL={AGENT_API_BASE_URL} />}
          {activeTab === 'gbrain-graph' && (
            <ErrorBoundary fallback={<div className="p-6 text-center text-error">Graph component failed to load</div>}>
              <GBrainSemanticGraph />
            </ErrorBoundary>
          )}
        </>
      ) : (
        <IdeenManagement apiUrl={IDEEN_API_BASE_URL} />
      )}

      {/* Footer */}
      <footer className="mt-8 text-center text-text-muted text-xs">
        <p>
          {mainView === 'agent-dashboard' ? 'WUPHF Agent Dashboard v1.0 | Live Monitoring System' : 'Ideen Management v1.0 | Idea ingestion and management'}
        </p>
        {mainView === 'agent-dashboard' && (
          <p className="mt-1">Status: <span className={getConnectionColor()}>● {connectionStatus.toUpperCase()}</span> | Last Update: {lastUpdate}</p>
        )}
      </footer>
    </div>
  );
}

// Dialogs Tab Component
function DialogsTab({ API_BASE_URL }: { API_BASE_URL: string }) {
  const [dialogs, setDialogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<string>('');

  useEffect(() => {
    const fetchDialogs = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/dialogs?agent_id=${selectedAgent}`);
        const data = await response.json();
        if (data.success) {
          setDialogs(data.data);
        }
      } catch (error) {
        console.error('Error fetching dialogs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDialogs();
  }, [selectedAgent, API_BASE_URL]);

  if (loading) {
    return <div className="text-center text-text-secondary">Loading dialogs...</div>;
  }

  return (
    <div className="card rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-surface-light flex items-center justify-center">
            <RiMessage3Line className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-text-secondary text-xs uppercase tracking-wider">Agent Dialogs</h3>
            <p className="text-text-primary">Conversation history</p>
          </div>
        </div>
        <select
          value={selectedAgent}
          onChange={(e) => setSelectedAgent(e.target.value)}
          className="px-4 py-2 bg-surface border border-border rounded-lg text-text-primary"
        >
          <option value="">All Agents</option>
          <option value="ceo">CEO</option>
          <option value="sdr">SDR</option>
          <option value="research">Research</option>
          <option value="content">Content</option>
        </select>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {dialogs.length === 0 ? (
          <p className="text-text-muted text-center">No dialogs found</p>
        ) : (
          dialogs.map((dialog) => (
            <div key={dialog.id} className="tech-border rounded-lg p-4 bg-surface-light">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-primary">{dialog.agent_id.toUpperCase()}</span>
                <span className="text-xs text-text-muted">{new Date(dialog.timestamp).toLocaleString()}</span>
              </div>
              <p className="text-sm text-text-primary">{dialog.content}</p>
              <div className="mt-2">
                <span className={`text-xs px-2 py-1 rounded ${
                  dialog.role === 'user'
                    ? 'bg-primary/20 text-primary'
                    : 'bg-secondary/20 text-secondary'
                }`}>
                  {dialog.role.toUpperCase()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Thoughts Tab Component
function ThoughtsTab({ API_BASE_URL }: { API_BASE_URL: string }) {
  const [thoughts, setThoughts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<string>('');

  useEffect(() => {
    const fetchThoughts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/thoughts?agent_id=${selectedAgent}`);
        const data = await response.json();
        if (data.success) {
          setThoughts(data.data);
        }
      } catch (error) {
        console.error('Error fetching thoughts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchThoughts();
  }, [selectedAgent, API_BASE_URL]);

  if (loading) {
    return <div className="text-center text-text-secondary">Loading thoughts...</div>;
  }

  return (
    <div className="card rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-surface-light flex items-center justify-center">
            <RiBrainLine className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-text-secondary text-xs uppercase tracking-wider">Agent Thoughts</h3>
            <p className="text-text-primary">Internal reasoning and insights</p>
          </div>
        </div>
        <select
          value={selectedAgent}
          onChange={(e) => setSelectedAgent(e.target.value)}
          className="px-4 py-2 bg-surface border border-border rounded-lg text-text-primary"
        >
          <option value="">All Agents</option>
          <option value="ceo">CEO</option>
          <option value="sdr">SDR</option>
          <option value="research">Research</option>
          <option value="content">Content</option>
        </select>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {thoughts.length === 0 ? (
          <p className="text-text-muted text-center">No thoughts found</p>
        ) : (
          thoughts.map((thought) => (
            <div key={thought.id} className="tech-border rounded-lg p-4 bg-surface-light">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-primary">{thought.agent_id.toUpperCase()}</span>
                <span className="text-xs text-text-muted">{new Date(thought.timestamp).toLocaleString()}</span>
              </div>
              <p className="text-sm text-text-primary mb-2">{thought.thought}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 bg-surface rounded text-text-secondary border border-border">
                  {thought.category}
                </span>
                <span className="text-xs text-text-muted">
                  Confidence: {Math.round(thought.confidence * 100)}%
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Knowledge Tab Component
function KnowledgeTab({ API_BASE_URL }: { API_BASE_URL: string }) {
  const [knowledge, setKnowledge] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchKnowledge = async () => {
      try {
        const url = searchQuery
          ? `${API_BASE_URL}/knowledge?query=${encodeURIComponent(searchQuery)}`
          : `${API_BASE_URL}/knowledge`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.success) {
          setKnowledge(data.data);
        }
      } catch (error) {
        console.error('Error fetching knowledge:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchKnowledge();
  }, [searchQuery, API_BASE_URL]);

  if (loading) {
    return <div className="text-center text-text-secondary">Loading knowledge base...</div>;
  }

  return (
    <div className="card rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-surface-light flex items-center justify-center">
            <RiBook2Line className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-text-secondary text-xs uppercase tracking-wider">Knowledge Base</h3>
            <p className="text-text-primary">Learned insights and patterns</p>
          </div>
        </div>
        <input
          type="text"
          placeholder="Search knowledge..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 bg-surface border border-border rounded-lg text-text-primary"
        />
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {knowledge.length === 0 ? (
          <p className="text-text-muted text-center">No knowledge items found</p>
        ) : (
          knowledge.map((item) => (
            <div key={item.id} className="tech-border rounded-lg p-4 bg-surface-light">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-primary">{item.category}</span>
                <span className="text-xs text-text-muted">Used {item.usage_count} times</span>
              </div>
              <h4 className="text-sm font-bold text-text-primary mb-2">{item.title}</h4>
              <p className="text-sm text-text-secondary mb-2">{item.content}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted">
                  By: {item.source_agent}
                </span>
                <span className="text-xs text-text-muted">
                  | Confidence: {Math.round(item.confidence * 100)}%
                </span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {item.tags.map((tag: string) => (
                  <span key={tag} className="text-xs px-2 py-1 bg-surface rounded text-text-secondary border border-border">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}