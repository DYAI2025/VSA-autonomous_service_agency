'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape, { Core } from 'cytoscape';
import dagre from 'cytoscape-dagre';
import fcose from 'cytoscape-fcose';
import { RiBrainLine, RiRefreshLine, RiFilter3Line, RiSearchLine } from '@remixicon/react';

dagre(cytoscape);
fcose(cytoscape);

// Custom hook outside component (React best practice)
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

interface GraphNodeMetadata {
  [key: string]: string | number | boolean | null;
}

interface GraphNode {
  id: string;
  label: string;
  source: string;
  type: string;
  metadata: GraphNodeMetadata;
}

interface GraphEdge {
  source: string;
  target: string;
  weight: number;
  similarity: number;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001';

export default function GBrainSemanticGraph() {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSources, setSelectedSources] = useState<string[]>(['default', 'wuphf-memory', 'wuphf-wiki']);
  const [similarityThreshold, setSimilarityThreshold] = useState(0.7);
  const [maxNodes, setMaxNodes] = useState(100);
  const [searchQuery, setSearchQuery] = useState('');
  
  const cyRef = useRef<Core | null>(null);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Filter graph data based on search query
  const filteredGraphData = useCallback(() => {
    if (!debouncedSearchQuery) {
      return graphData;
    }
    
    const query = debouncedSearchQuery.toLowerCase();
    const filteredNodeIds = new Set(
      graphData.nodes
        .filter(node => node.label.toLowerCase().includes(query))
        .map(node => node.id)
    );
    
    const filteredEdges = graphData.edges.filter(
      edge => filteredNodeIds.has(edge.source) || filteredNodeIds.has(edge.target)
    );
    
    return {
      nodes: graphData.nodes.filter(node => filteredNodeIds.has(node.id)),
      edges: filteredEdges
    };
  }, [graphData, debouncedSearchQuery]);

  const loadGraphData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const sourcesParam = selectedSources.join(',');
      const response = await fetch(`${API_BASE_URL}/api/gbrain/semantic-graph?sources=${sourcesParam}&similarity_threshold=${similarityThreshold}&max_nodes=${maxNodes}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setGraphData(data.graph);
      } else {
        setError('Failed to load graph data');
      }
    } catch (err) {
      console.error('Error loading graph data:', err);
      setError('Failed to connect to API server');
    } finally {
      setLoading(false);
    }
  }, [selectedSources, similarityThreshold, maxNodes]);

  useEffect(() => {
    loadGraphData();
  }, [loadGraphData]);

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'default': return '#6366f1'; // indigo
      case 'wuphf-memory': return '#10b981'; // emerald
      case 'wuphf-wiki': return '#f59e0b'; // amber
      default: return '#6b7280'; // gray
    }
  };

  if (loading) {
    return (
      <div className="card rounded-lg p-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-text-secondary animate-pulse">Loading semantic graph...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card rounded-lg p-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-error/10 flex items-center justify-center">
              <RiBrainLine className="w-8 h-8 text-error" />
            </div>
            <p className="text-error">{error}</p>
            <button
              onClick={loadGraphData}
              className="px-4 py-2 bg-surface border border-border rounded-lg hover:border-primary transition-colors flex items-center gap-2"
            >
              <RiRefreshLine className="w-4 h-4" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-surface-light flex items-center justify-center">
            <RiBrainLine className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold">GBrain Semantic Graph</h3>
            <p className="text-text-muted text-xs">
              {graphData.nodes.length} nodes, {graphData.edges.length} edges
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <RiSearchLine className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:border-primary w-64"
            />
          </div>
          <button
            onClick={loadGraphData}
            className="px-4 py-2 bg-surface border border-border rounded-lg hover:border-primary transition-colors flex items-center gap-2"
          >
            <RiRefreshLine className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Source Filter */}
        <div className="bg-surface-light rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <RiFilter3Line className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">Sources</span>
          </div>
          <div className="space-y-2">
            {['default', 'wuphf-memory', 'wuphf-wiki'].map((source) => (
              <label key={source} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedSources.includes(source)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedSources([...selectedSources, source]);
                    } else {
                      setSelectedSources(selectedSources.filter(s => s !== source));
                    }
                  }}
                  className="w-4 h-4 rounded border-border"
                />
                <span className="text-sm" style={{ color: getSourceColor(source) }}>
                  {source}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Similarity Threshold */}
        <div className="bg-surface-light rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold">Similarity Threshold</span>
            <span className="text-primary font-mono text-sm">{similarityThreshold.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={similarityThreshold}
            onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Max Nodes */}
        <div className="bg-surface-light rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold">Max Nodes</span>
            <span className="text-primary font-mono text-sm">{maxNodes}</span>
          </div>
          <input
            type="range"
            min="10"
            max="500"
            step="10"
            value={maxNodes}
            onChange={(e) => setMaxNodes(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      {/* Graph Visualization */}
      <div className="h-[600px] border border-border rounded-lg bg-surface-light">
        {(() => {
          const filtered = filteredGraphData();
          return filtered.nodes.length > 0 ? (
          <CytoscapeComponent
            elements={[
              ...filtered.nodes.map(node => ({
                data: { 
                  id: node.id, 
                  label: node.label, 
                  source: node.source,
                  sourceColor: getSourceColor(node.source)
                }
              })),
              ...filtered.edges.map((edge, index) => ({
                data: { 
                  source: edge.source, 
                  target: edge.target, 
                  weight: edge.weight,
                  similarity: edge.similarity
                }
              }))
            ]}
            style={{
              width: '100%',
              height: '100%'
            }}
            layout={{
              name: 'fcose'
            }}
            stylesheet={[
              {
                selector: 'node',
                style: {
                  'background-color': 'data(sourceColor)',
                  'label': 'data(label)',
                  'font-size': '12px',
                  'text-valign': 'center',
                  'text-halign': 'center',
                  'color': '#fff',
                  'text-outline-color': '#000',
                  'text-outline-width': 2,
                  'width': 30,
                  'height': 30
                }
              },
              {
                selector: 'edge',
                style: {
                  'width': 'data(weight) * 2',
                  'line-color': '#666',
                  'target-arrow-color': '#666',
                  'target-arrow-shape': 'triangle',
                  'curve-style': 'bezier',
                  'opacity': 0.6
                }
              }
            ]}
            cy={(cy) => {
              cyRef.current = cy;
              
              // Enable pan and zoom
              cy.userZoomingEnabled(true);
              cy.userPanningEnabled(true);
              cy.boxSelectionEnabled(false);
            }}
          />
          ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <RiBrainLine className="w-16 h-16 text-text-muted mx-auto mb-4" />
              {debouncedSearchQuery ? (
                <>
                  <p className="text-text-muted">No matching nodes found</p>
                  <p className="text-text-muted text-sm mt-2">Try a different search term</p>
                </>
              ) : (
                <>
                  <p className="text-text-muted">No graph data available</p>
                  <p className="text-text-muted text-sm mt-2">Try adjusting filters or refresh</p>
                </>
              )}
            </div>
          </div>
        );
        })()}
      </div>
    </div>
  );
}
