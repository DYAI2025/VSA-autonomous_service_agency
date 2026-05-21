'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface SimpleGraphProps {
  apiUrl?: string;
}

interface GraphNode {
  id: string;
  label: string;
  type: string;
  phase: string;
  date: string;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
}

export default function SimpleGraph({ apiUrl = '/api/graph' }: SimpleGraphProps) {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  const loadGraphData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${apiUrl}/full-graph`);

      if (response.data.status === 'success') {
        const data = response.data.graph;
        setNodes(data.nodes);
        setEdges(data.edges);
      }
    } catch (err) {
      console.error('Failed to load graph data:', err);
      setError('Failed to load graph data from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGraphData();
  }, [apiUrl]);

  if (loading) {
    return (
      <div className="p-6 text-center text-text-secondary">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p>Loading graph data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-error mb-4">{error}</div>
        <button
          onClick={loadGraphData}
          className="px-4 py-2 bg-primary text-black rounded-lg hover:opacity-80 transition-opacity"
        >
          Retry
        </button>
      </div>
    );
  }

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'seed': return 'bg-success';
      case 'sprout': return 'bg-primary';
      case 'growth': return 'bg-warning';
      case 'flower': return 'bg-secondary';
      case 'harvest': return 'bg-error';
      default: return 'bg-text-muted';
    }
  };

  return (
    <div className="card rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-surface-light flex items-center justify-center">
            <span className="text-2xl">🔗</span>
          </div>
          <div>
            <h3 className="text-text-secondary text-xs uppercase tracking-wider">GBrain Graph</h3>
            <p className="text-text-primary">Idea connections visualization</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-text-muted text-sm">
            Nodes: {nodes.length} | Edges: {edges.length}
          </div>
          <button
            onClick={loadGraphData}
            className="px-4 py-2 bg-surface border border-border rounded-lg hover:border-primary transition-colors"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="tech-border rounded-lg p-4 bg-surface-light">
          <h4 className="font-bold text-text-primary mb-4">Nodes (Ideas)</h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {nodes.map((node) => (
              <div
                key={node.id}
                className={`p-3 rounded bg-surface border border-border cursor-pointer hover:border-primary transition-colors`}
                onClick={() => setSelectedNode(node)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-text-primary">{node.label}</span>
                  <span className={`text-xs px-2 py-1 rounded ${getPhaseColor(node.phase)} text-black`}>
                    {node.phase}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <span>{node.type}</span>
                  <span>|</span>
                  <span>{new Date(node.date).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="tech-border rounded-lg p-4 bg-surface-light">
          <h4 className="font-bold text-text-primary mb-4">Edges (Connections)</h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {edges.map((edge) => (
              <div key={edge.id} className="p-3 rounded bg-surface border border-border">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-primary font-bold">{edge.source}</span>
                  <span className="text-text-muted">→</span>
                  <span className="text-secondary font-bold">{edge.target}</span>
                </div>
                <div className="text-xs text-text-muted mt-1">{edge.type}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedNode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedNode(null)}>
          <div className="card rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-text-primary text-lg">{selectedNode.label}</h4>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-text-muted hover:text-text-primary text-2xl"
              >
                ×
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-text-muted">Type:</span>
                <span className="text-text-primary">{selectedNode.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Phase:</span>
                <span className={`text-xs px-2 py-1 rounded ${getPhaseColor(selectedNode.phase)} text-black`}>
                  {selectedNode.phase}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Date:</span>
                <span className="text-text-primary">{new Date(selectedNode.date).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">ID:</span>
                <span className="text-text-primary text-xs">{selectedNode.id}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}