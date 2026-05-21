'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import SimpleGraph from './SimpleGraph';
import KanbanBoard from './KanbanBoard';
import { RiUploadLine, RiSearchLine, RiRefreshLine, RiDeleteBinLine, RiFileListLine, RiNodeTree, RiKanbanView } from '@remixicon/react';

interface FileUploadResult {
  status: string;
  filename: string;
  path: string;
  phase: string;
  timestamp: string;
  auto_import: boolean;
  import_result?: any;
}

interface Idea {
  slug: string;
  score?: number;
  snippet?: string;
  type?: string;
  date?: string;
  title?: string;
}

interface IdeenManagementProps {
  apiUrl: string;
}

export default function IdeenManagement({ apiUrl }: IdeenManagementProps) {
  const [uploadResults, setUploadResults] = useState<FileUploadResult[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhase, setSelectedPhase] = useState('seed');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'graph' | 'kanban'>('list');
  const [apiError, setApiError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setLoading(true);
    setError(null);

    for (const file of acceptedFiles) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('phase', selectedPhase);
      formData.append('auto_import', 'true');

      try {
        const response = await axios.post(`${apiUrl}/ingest/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        setUploadResults(prev => [...prev, response.data]);
        await loadIdeas();
      } catch (err: any) {
        setError(`Failed to upload ${file.name}: ${err.message}`);
      }
    }

    setLoading(false);
  }, [selectedPhase, apiUrl]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/markdown': ['.md'],
      'text/plain': ['.txt'],
      'application/json': ['.json'],
      'application/x-yaml': ['.yaml', '.yml'],
    }
  });

  const loadIdeas = async () => {
    try {
      setApiError(null);
      const response = await axios.get(`${apiUrl}/ideas/list`, {
        params: { phase: selectedPhase }
      });
      setIdeas(response.data.results || []);
    } catch (err: any) {
      console.error('Failed to load ideas:', err);
      setApiError(`Failed to connect to backend API (${apiUrl}).`);
    }
  };

  const searchIdeas = async () => {
    if (!searchQuery.trim()) {
      await loadIdeas();
      return;
    }

    try {
      const response = await axios.get(`${apiUrl}/ideas/search`, {
        params: {
          query: searchQuery,
          phase: selectedPhase
        }
      });
      setIdeas(response.data.results || []);
    } catch (err) {
      console.error('Failed to search ideas:', err);
    }
  };

  const deleteFile = async (filename: string) => {
    try {
      await axios.delete(`${apiUrl}/ingest/files/${filename}`);
      setUploadResults(prev => prev.filter(r => r.filename !== filename));
      await loadIdeas();
    } catch (err: any) {
      setError(`Failed to delete ${filename}: ${err.message}`);
    }
  };

  const loadFiles = async () => {
    try {
      const response = await axios.get(`${apiUrl}/ingest/files`);
      const files = response.data.files || [];
      const fileResults: FileUploadResult[] = files.map((file: any) => ({
        status: 'uploaded',
        filename: file.filename,
        path: file.path,
        phase: selectedPhase,
        timestamp: file.modified,
        auto_import: false
      }));
      setUploadResults(fileResults);
    } catch (err) {
      console.error('Failed to load files:', err);
    }
  };

  useEffect(() => {
    loadIdeas();
    loadFiles();
  }, [selectedPhase]);

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'seed': return 'text-success';
      case 'sprout': return 'text-primary';
      case 'growth': return 'text-warning';
      case 'flower': return 'text-secondary';
      case 'harvest': return 'text-error';
      default: return 'text-text-muted';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-surface border border-border flex items-center justify-center">
            <span className="text-3xl">🧠</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-glow">IDEEN MANAGEMENT</h1>
            <p className="text-text-secondary text-sm">Idea ingestion and management system</p>
          </div>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setViewMode('list')}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            viewMode === 'list'
              ? 'bg-primary text-black font-bold'
              : 'bg-surface border border-border text-text-secondary hover:border-primary'
          }`}
        >
          <RiFileListLine className="w-4 h-4" />
          List View
        </button>
        <button
          onClick={() => setViewMode('graph')}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            viewMode === 'graph'
              ? 'bg-primary text-black font-bold'
              : 'bg-surface border border-border text-text-secondary hover:border-primary'
          }`}
        >
          <RiNodeTree className="w-4 h-4" />
          Graph View
        </button>
        <button
          onClick={() => setViewMode('kanban')}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            viewMode === 'kanban'
              ? 'bg-primary text-black font-bold'
              : 'bg-surface border border-border text-text-secondary hover:border-primary'
          }`}
        >
          <RiKanbanView className="w-4 h-4" />
          Kanban Board
        </button>
      </div>

      {viewMode === 'list' && (
        <>
          {/* Upload Section */}
          <div className="card rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-surface-light flex items-center justify-center">
                <RiUploadLine className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-text-secondary text-xs uppercase tracking-wider">File Upload</h3>
                <p className="text-text-primary">Drag and drop files to ingest ideas</p>
              </div>
            </div>

            <div className="mb-4">
              <label className="flex items-center gap-2">
                <span className="text-text-secondary text-sm">Phase:</span>
                <select
                  value={selectedPhase}
                  onChange={(e) => setSelectedPhase(e.target.value)}
                  className="px-4 py-2 bg-surface border border-border rounded-lg text-text-primary"
                >
                  <option value="seed">Seed</option>
                  <option value="sprout">Sprout</option>
                  <option value="growth">Growth</option>
                  <option value="flower">Flower</option>
                  <option value="harvest">Harvest</option>
                </select>
              </label>
            </div>

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary bg-surface-light'
              }`}
            >
              <input {...getInputProps()} />
              {isDragActive ? (
                <p className="text-primary">📥 Drop the files here...</p>
              ) : (
                <p className="text-text-secondary">🖱️ Drag & drop files here, or click to select</p>
              )}
              <p className="text-text-muted text-xs mt-2">Supported: .md, .txt, .json, .yaml, .yml</p>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-error/10 border border-error/30 rounded-lg text-error text-sm">
                {error}
              </div>
            )}
            {apiError && (
              <div className="mt-4 p-3 bg-error/10 border border-error/30 rounded-lg text-error text-sm">
                {apiError}
              </div>
            )}

            {/* Upload Results */}
            {uploadResults.length > 0 && (
              <div className="mt-6">
                <h4 className="font-bold text-text-primary mb-4">Upload Results</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {uploadResults.map((result, index) => (
                    <div key={index} className="tech-border rounded-lg p-3 bg-surface-light flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-1 rounded ${
                          result.status === 'success' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                        }`}>
                          {result.status}
                        </span>
                        <span className="text-text-primary">{result.filename}</span>
                        {result.import_result?.status === 'success' && (
                          <span className="text-success text-sm">✓ Imported as {result.import_result.slug}</span>
                        )}
                      </div>
                      <button
                        onClick={() => deleteFile(result.filename)}
                        className="text-text-muted hover:text-error transition-colors"
                      >
                        <RiDeleteBinLine className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Ideas Search and List */}
          <div className="card rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-surface-light flex items-center justify-center">
                  <RiSearchLine className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-text-secondary text-xs uppercase tracking-wider">Ideas</h3>
                  <p className="text-text-primary">Search and browse ideas</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={searchIdeas}
                  className="px-4 py-2 bg-primary text-black rounded-lg hover:opacity-80 transition-opacity flex items-center gap-2"
                >
                  <RiSearchLine className="w-4 h-4" />
                  Search
                </button>
                <button
                  onClick={loadIdeas}
                  className="px-4 py-2 bg-surface border border-border rounded-lg hover:border-primary transition-colors flex items-center gap-2"
                >
                  <RiRefreshLine className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            </div>

            <div className="mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ideas..."
                onKeyPress={(e) => e.key === 'Enter' && searchIdeas()}
                className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-text-primary"
              />
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {ideas.length === 0 ? (
                <p className="text-text-muted text-center py-8">No ideas found</p>
              ) : (
                ideas.map((idea, index) => (
                  <div key={index} className="tech-border rounded-lg p-4 bg-surface-light">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-primary">{idea.slug}</span>
                      {idea.score && (
                        <span className="text-xs px-2 py-1 bg-surface rounded text-text-muted border border-border">
                          Score: {idea.score.toFixed(2)}
                        </span>
                      )}
                    </div>
                    {idea.title && <h4 className="text-text-primary font-bold mb-2">{idea.title}</h4>}
                    {idea.snippet && <p className="text-sm text-text-secondary mb-2">{idea.snippet}</p>}
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                      {idea.type && <span>{idea.type}</span>}
                      {idea.type && <span>|</span>}
                      {idea.date && <span>{new Date(idea.date).toLocaleDateString()}</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {viewMode === 'graph' && (
        <SimpleGraph apiUrl={`${apiUrl}/graph`} />
      )}

      {viewMode === 'kanban' && (
        <KanbanBoard apiUrl={apiUrl} />
      )}

      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card rounded-lg p-6 text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-text-primary">Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
}