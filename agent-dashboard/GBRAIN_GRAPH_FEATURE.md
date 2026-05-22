# GBrain Semantic Graph Feature

## Overview

The GBrain Semantic Graph is an interactive visualization feature integrated into the WUPHF Agent Dashboard that displays semantic connections between knowledge items based on embedding similarity. This feature helps users understand how different pieces of information in the WUPHF knowledge base are conceptually related.

## Features

### Core Functionality
- **Interactive Graph Visualization**: Uses Cytoscape.js with fcose layout algorithm for optimal node positioning
- **Semantic Similarity**: Connections are based on cosine similarity of embeddings from the Ollama bge-m3 model
- **Multi-Source Support**: Can filter and visualize data from multiple GBrain sources (default, wuphf-memory, wuphf-wiki)
- **Real-time Search**: Debounced search functionality to filter nodes by label
- **Performance Optimization**: API-level caching with 5-minute TTL to reduce computational load

### User Interface Features
- **Source Filtering**: Toggle checkboxes to include/exclude data sources
- **Similarity Threshold**: Adjustable slider (0.0-1.0) to control connection strength requirements
- **Max Nodes Control**: Adjustable slider (10-500) to limit graph complexity
- **Search**: Real-time text search with 300ms debounce to filter nodes
- **Interactive Navigation**: Zoom, pan, and click interactions with graph elements
- **Color Coding**: Different colors for different data sources (indigo for default, emerald for wuphf-memory, amber for wuphf-wiki)

## Technical Architecture

### Backend Components

#### FastAPI Route
- **Endpoint**: `/api/gbrain/semantic-graph`
- **Parameters**:
  - `sources`: Comma-separated list of source names
  - `similarity_threshold`: Float between 0.0 and 1.0 (default: 0.7)
  - `max_nodes`: Integer between 1 and 500 (default: 100)
  - `max_edges_per_node`: Integer between 1 and 20 (default: 5)
- **Response Format**:
  ```json
  {
    "status": "success",
    "graph": {
      "nodes": [
        {
          "id": "string",
          "label": "string",
          "source": "string",
          "type": "string",
          "metadata": {}
        }
      ],
      "edges": [
        {
          "source": "string",
          "target": "string",
          "weight": number,
          "similarity": number
        }
      ]
    },
    "metadata": {
      "cached": boolean,
      "sources": ["string"],
      "threshold": number,
      "node_count": number,
      "edge_count": number
    }
  }
  ```

#### Caching System
- **Implementation**: In-memory dictionary with timestamp-based expiration
- **TTL**: 300 seconds (5 minutes)
- **Cache Key**: Combination of all query parameters
- **Cache Hit Indication**: Response includes `cached: true` in metadata

#### GBrain Client Extension
- **Method**: `get_semantic_graph(sources, threshold, max_nodes, max_edges_per_node)`
- **Current State**: Placeholder implementation returning empty graph structure
- **Planned Enhancement**: Actual embedding similarity calculation using NumPy/Scipy

### Security Considerations

#### Implemented Security Measures
- **Input Validation**: Source names are validated against allowlist (default, wuphf-memory, wuphf-wiki)
- **Path Validation**: GBrain CLI path is validated to prevent command injection attacks
- **Rate Limiting**: API endpoint limited to 10 requests per minute per IP address to prevent abuse
- **Error Boundaries**: Component wrapped in error boundary to prevent crashes from affecting dashboard
- **Type Safety**: Proper TypeScript types prevent runtime type errors
- **Hash-based Cache Keys**: MD5 hashing prevents cache key collisions

#### Deployment Security Notes
- Set `NEXT_PUBLIC_API_BASE_URL` environment variable for production deployments
- Configure CORS origins appropriately for production environment (currently set to `*` for development)
- Consider adding authentication for production deployment
- Review and adjust rate limits based on expected traffic patterns
- The simple in-memory rate limiter is suitable for single-instance deployments; consider Redis-based rate limiting for distributed deployments

### Frontend Components

#### React Component
- **Location**: `app/components/gbrain/GBrainSemanticGraph.tsx`
- **Libraries**: 
  - `react-cytoscapejs` for graph rendering
  - `cytoscape-fcose` for force-directed layout
  - `cytoscape-dagre` for hierarchical layout (alternative)
- **State Management**:
  - Graph data from API
  - Selected sources
  - Similarity threshold
  - Max nodes
  - Search query with debouncing

#### Integration
- **Tab Location**: Agent Dashboard → "GBrain Graph" tab
- **Icon**: Brain icon from Remixicon
- **Styling**: Consistent with dashboard design system using Tailwind CSS

## Usage

### Basic Usage

1. Navigate to the WUPHF Agent Dashboard
2. Click on the "GBrain Graph" tab in the sub-navigation
3. The graph will automatically load with default settings

### Filtering by Source

1. Use the checkboxes in the "Sources" control panel
2. Available sources:
   - `default`: Main GBrain knowledge base
   - `wuphf-memory`: WUPHF agent memory
   - `wuphf-wiki`: WUPHF documentation wiki
3. The graph will update automatically when sources are toggled

### Adjusting Similarity Threshold

1. Use the "Similarity Threshold" slider
2. Range: 0.0 (all connections) to 1.0 (only very strong connections)
3. Higher thresholds result in fewer, stronger connections
4. Changes take effect immediately

### Limiting Graph Size

1. Use the "Max Nodes" slider
2. Range: 10 to 500 nodes
3. Useful for performance optimization with large knowledge bases
4. Changes trigger a new API call

### Searching Nodes

1. Use the search input in the header
2. Type to filter nodes by label (case-insensitive)
3. Search is debounced (300ms) for performance
4. Graph updates to show only matching nodes and their connections

### Refreshing Data

1. Click the "Refresh" button in the header
2. This bypasses the cache and fetches fresh data from the API
3. Useful when knowledge base has been updated

## Performance Considerations

### API Caching
- First request with specific parameters fetches fresh data
- Subsequent identical requests within 5 minutes return cached data
- Cache is automatically invalidated after TTL expires
- Reduces computational load on embedding similarity calculations

### Frontend Optimization
- Debounced search prevents excessive re-rendering
- Filter operations are memoized with useCallback
- Graph layout calculations are handled by Cytoscape.js efficiently

### Recommended Settings
- For large knowledge bases (>1000 nodes): Use max_nodes ≤ 100
- For detailed exploration: Use similarity_threshold ≥ 0.8
- For overview: Use similarity_threshold ≤ 0.6 and max_nodes ≥ 200

## Future Enhancements

### Planned Improvements
1. **Actual Embedding Similarity**: Implement real cosine similarity calculation in GBrain client
2. **Advanced Layouts**: Add more layout options (circular, grid, etc.)
3. **Node Details**: Click on nodes to view detailed information
4. **Path Finding**: Add shortest path visualization between nodes
5. **Cluster Detection**: Automatic identification of topic clusters
6. **Timeline View**: Temporal evolution of knowledge connections
7. **Export Options**: Export graph as PNG, SVG, or JSON
8. **Collaboration**: Share graph views with other users

### Technical Debt
1. GBrain client `get_semantic_graph()` method needs actual implementation
2. Consider Redis for distributed caching in production
3. Add error boundaries for better error handling
4. Implement proper loading states for large graphs

## Development

### Running the Backend API

```bash
cd /home/dyai/.wuphf
python3 main.py
```

The API will be available at `http://localhost:8001`

### Running the Frontend

```bash
cd /home/dyai/wuphf-agency-output/agent-dashboard
npm run dev
```

The dashboard will be available at `http://localhost:3000`

### Testing

#### Backend Tests
```bash
cd /home/dyai/.wuphf
python3 -m pytest tests/test_gbrain_semantic_graph.py -v
```

#### Frontend Tests
Note: Frontend tests require Jest and React Testing Library setup. Test structure is provided in `app/components/gbrain/__tests__/GBrainSemanticGraph.test.tsx`.

## Troubleshooting

### Common Issues

**Graph shows no nodes**
- Check that GBrain sources have data
- Verify API endpoint is accessible
- Check browser console for errors
- Try lowering the similarity threshold

**Performance issues**
- Reduce max_nodes slider value
- Increase similarity threshold
- Check if caching is working (look for `cached: true` in response)
- Consider using fewer data sources

**API connection errors**
- Verify backend server is running on port 8001
- Check CORS settings if accessing from different domain
- Review API logs for error messages

**Search not working**
- Verify search query has at least 2 characters
- Check that node labels contain the search term
- Clear search and try again

## Dependencies

### Backend
- FastAPI 0.135.1
- NumPy 2.2.6
- SciPy 1.16.3
- GBrain CLI (must be installed and accessible via PATH)

### Frontend
- Next.js 16.2.6
- React 19.2.4
- Cytoscape.js 3.33.4
- react-cytoscapejs 2.0.0
- cytoscape-fcose 2.2.0
- cytoscape-dagre 3.0.0
- Remixicon 4.9.1

## Contributing

When modifying the GBrain Semantic Graph feature:

1. Update this documentation for any user-facing changes
2. Add tests for new functionality
3. Test with different graph sizes and configurations
4. Verify performance implications of changes
5. Update API documentation if endpoint changes

## License

This feature is part of the WUPHF Agent Dashboard project.
