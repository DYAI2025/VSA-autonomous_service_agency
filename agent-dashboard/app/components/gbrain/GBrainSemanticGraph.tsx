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

interface GraphNode {
  id: string;
  label: string;
  type: string;
  date: string;
  phase: string;
  data: any;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  animated: boolean;
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
      const response = await fetch(`${API_BASE_URL}/graph/full-graph`);
      const data = await response.json();

      if (data.status === 'success') {
        setGraphData(data.graph);
      } else {
        setError('Failed to load graph data');
      }
    } catch (err) {
      console.error('Error loading graph data:', err);
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Network error: Unable to reach API server. Please check your connection.');
      } else if (err instanceof SyntaxError) {
        setError('Data format error: Invalid response from server. Please try again.');
      } else {
        setError('An unexpected error occurred. Please refresh the page or try again later.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGraphData();
  }, [loadGraphData]);

  const getSourceColor = (source: string) => {
    return '#6366f1'; // indigo
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
      <div className="bg-surface-light rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RiFilter3Line className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">Graph Controls</span>
          </div>
          <button
            onClick={loadGraphData}
            className="px-4 py-2 bg-surface border border-border rounded-lg hover:border-primary transition-colors flex items-center gap-2"
          >
            <RiRefreshLine className="w-4 h-4" />
            Refresh Graph
          </button>
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
                  sourceColor: getSourceColor(node.type)
                }
              })),
              ...filtered.edges.map((edge, index) => ({
                data: {
                  id: edge.id,
                  source: edge.source,
                  target: edge.target,
                  weight: 1,
                  similarity: 1
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
                  'width': 2,
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
