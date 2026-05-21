'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import axios from 'axios';

interface DropResult {
  draggableId: string;
  type: string;
  source: {
    index: number;
    droppableId: string;
  };
  destination: {
    index: number;
    droppableId: string;
  } | null;
  reason?: string;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  phase: string;
  tags: string[];
  status: string;
  createdAt: string | null;
  updatedAt: string | null;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

const phaseColors = {
  seed: '#10b981',
  sprout: '#00f0ff',
  growth: '#f59e0b',
  flower: '#7c3aed',
  harvest: '#ef4444'
};

const initialColumns: Column[] = [
  {
    id: 'backlog',
    title: '📋 Backlog',
    tasks: []
  },
  {
    id: 'todo',
    title: '📝 To Do',
    tasks: []
  },
  {
    id: 'in-progress',
    title: '🚀 In Progress',
    tasks: []
  },
  {
    id: 'review',
    title: '👀 Review',
    tasks: []
  },
  {
    id: 'done',
    title: '✅ Done',
    tasks: []
  }
];

interface KanbanBoardProps {
  apiUrl: string;
}

export default function KanbanBoard({ apiUrl }: KanbanBoardProps) {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [selectedPhase, setSelectedPhase] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Load kanban data on mount
  useEffect(() => {
    loadKanbanData();
  }, []);

  const loadKanbanData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}/kanban/board`);
      if (response.data.status === 'success') {
        // Transform backend data to frontend format
        const transformedColumns = response.data.board.columns.map((col: any) => ({
          id: col.id,
          title: col.title,
          tasks: col.tasks.map((task: any) => ({
            id: task.id,
            title: task.title,
            description: task.description,
            phase: task.phase,
            tags: task.tags,
            status: task.status,
            createdAt: task.created_at,
            updatedAt: task.updated_at
          }))
        }));
        setColumns(transformedColumns);
      }
    } catch (error) {
      console.error('Failed to load kanban data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveKanbanData = async (newColumns: Column[]) => {
    try {
      // Transform to match backend schema
      const boardData = {
        columns: newColumns.map(col => ({
          id: col.id,
          title: col.title,
          tasks: col.tasks.map(task => ({
            id: task.id,
            title: task.title,
            description: task.description || null,
            phase: task.phase,
            tags: task.tags || [],
            status: task.status,
            created_at: task.createdAt || null,
            updated_at: task.updatedAt || null
          }))
        }))
      };

      await axios.post(`${apiUrl}/kanban/board`, boardData);
    } catch (error) {
      console.error('Failed to save kanban data:', error);
    }
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (destination.droppableId === source.droppableId && destination.index === destination.index) {
      return;
    }

    const sourceColumn = columns.find(col => col.id === source.droppableId);
    const destColumn = columns.find(col => col.id === destination.droppableId);

    if (!sourceColumn || !destColumn) return;

    const task = sourceColumn.tasks.find(task => task.id === draggableId);
    if (!task) return;

    // Remove from source
    const newSourceTasks = [...sourceColumn.tasks];
    newSourceTasks.splice(source.index, 1);

    // Add to destination
    const newDestTasks = [...destColumn.tasks];
    newDestTasks.splice(destination.index, 0, {
      ...task,
      status: destination.droppableId,
      updatedAt: new Date().toISOString()
    });

    const newColumns = columns.map(col => {
      if (col.id === source.droppableId) {
        return { ...col, tasks: newSourceTasks };
      }
      if (col.id === destination.droppableId) {
        return { ...col, tasks: newDestTasks };
      }
      return col;
    });

    setColumns(newColumns);
    saveKanbanData(newColumns);
  };

  const addTask = async (title: string, phase: string) => {
    try {
      const newTask = {
        id: `task-${Date.now()}`,
        title,
        description: null,
        phase,
        tags: [phase],
        status: 'backlog',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await axios.post(`${apiUrl}/kanban/task`, newTask);
      loadKanbanData();
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await axios.delete(`${apiUrl}/kanban/task/${taskId}`);
      loadKanbanData();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const syncGBrainToKanban = async () => {
    try {
      setSyncing(true);
      const response = await axios.post(`${apiUrl}/sync/kanban`);
      if (response.data.status === 'success') {
        loadKanbanData();
        alert('✅ GBrain → Kanban sync completed!');
      } else {
        alert(`❌ Sync failed: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Failed to sync:', error);
      alert('❌ Failed to sync GBrain to Kanban');
    } finally {
      setSyncing(false);
    }
  };

  const filteredTasks = (tasks: Task[]) => {
    if (selectedPhase === 'all') return tasks;
    return tasks.filter(task => task.phase === selectedPhase);
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-text-secondary">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p>Loading kanban board...</p>
      </div>
    );
  }

  return (
    <div className="card rounded-lg p-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-surface-light flex items-center justify-center">
            <span className="text-2xl">📋</span>
          </div>
          <div>
            <h3 className="text-text-secondary text-xs uppercase tracking-wider">Kanban Board</h3>
            <p className="text-text-primary">Task management</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedPhase}
            onChange={(e) => setSelectedPhase(e.target.value)}
            className="px-4 py-2 bg-surface border border-border rounded-lg text-text-primary"
          >
            <option value="all">All Phases</option>
            <option value="seed">Seed</option>
            <option value="sprout">Sprout</option>
            <option value="growth">Growth</option>
            <option value="flower">Flower</option>
            <option value="harvest">Harvest</option>
          </select>
          <button
            onClick={() => {
              const title = prompt('Task title:');
              if (title) {
                const phase = prompt('Phase (seed/sprout/growth/flower/harvest):', 'seed');
                if (phase && ['seed', 'sprout', 'growth', 'flower', 'harvest'].includes(phase)) {
                  addTask(title, phase);
                }
              }
            }}
            className="px-4 py-2 bg-primary text-black rounded-lg hover:opacity-80 transition-opacity"
            disabled={syncing}
          >
            + Add Task
          </button>
          <button
            onClick={syncGBrainToKanban}
            className="px-4 py-2 bg-secondary text-white rounded-lg hover:opacity-80 transition-opacity"
            disabled={syncing}
          >
            {syncing ? '🔄 Syncing...' : '🔄 Sync GBrain'}
          </button>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {columns.map(column => (
            <div key={column.id} className="tech-border rounded-lg bg-surface-light min-w-[280px]">
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-text-primary">{column.title}</h4>
                  <span className="text-xs px-2 py-1 bg-surface rounded text-text-muted">
                    {filteredTasks(column.tasks).length}
                  </span>
                </div>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`p-4 min-h-[200px] ${snapshot.isDraggingOver ? 'bg-surface' : ''}`}
                  >
                    {filteredTasks(column.tasks).map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            ref={provided.innerRef}
                            className={`p-3 rounded bg-surface border border-border mb-2 cursor-move ${
                              snapshot.isDragging ? 'shadow-lg shadow-primary/20' : ''
                            }`}
                            style={{
                              borderLeft: `4px solid ${phaseColors[task.phase as keyof typeof phaseColors] || '#999'}`
                            }}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="font-bold text-text-primary text-sm">{task.title}</h5>
                              <button
                                onClick={() => deleteTask(task.id)}
                                className="text-text-muted hover:text-error text-lg leading-none"
                              >
                                ×
                              </button>
                            </div>
                            {task.description && <p className="text-xs text-text-secondary mb-2">{task.description}</p>}
                            <div className="flex flex-wrap gap-1">
                              <span
                                className="text-xs px-2 py-1 rounded text-black"
                                style={{ backgroundColor: phaseColors[task.phase as keyof typeof phaseColors] || '#999' }}
                              >
                                {task.phase}
                              </span>
                              {task.tags?.map(tag => (
                                <span key={tag} className="text-xs px-2 py-1 bg-surface rounded text-text-secondary border border-border">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}