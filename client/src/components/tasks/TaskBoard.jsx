import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Circle, PauseCircle, Plus } from 'lucide-react';
import { groupTasksByStatus } from '../../utils/formatters';

const statusMeta = {
  todo: { label: 'Todo', icon: Circle },
  'in-progress': { label: 'In Progress', icon: PauseCircle },
  blocked: { label: 'Blocked', icon: PauseCircle },
  done: { label: 'Done', icon: CheckCircle2 },
};

const TaskColumn = ({ title, tasks, onStatusChange }) => (
  <div className="flex flex-1 flex-col gap-4 rounded-2xl border border-white/5 bg-white/5 p-4">
    <div>
      <p className="text-xs uppercase tracking-[0.3em] text-text-muted">{title}</p>
      <p className="text-sm text-text-muted">{tasks.length} tasks</p>
    </div>
    <div className="space-y-3">
      {tasks.map((task) => (
        <div key={task.id} className="rounded-2xl border border-white/10 bg-background/60 p-4 text-sm text-text-primary">
          <p className="font-medium text-white">{task.title}</p>
          {task.detail && <p className="mt-1 text-xs text-text-muted">{task.detail}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-text-muted">
            <select
              value={task.status}
              onChange={(event) => onStatusChange(task.id, event.target.value)}
              className="rounded-full border border-white/5 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.4em]"
            >
              {Object.entries(statusMeta).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.label}
                </option>
              ))}
            </select>
            {task.priority && (
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.4em] text-white">
                {task.priority}
              </span>
            )}
          </div>
        </div>
      ))}
      {!tasks.length && <p className="rounded-xl border border-dashed border-white/10 p-4 text-center text-xs text-text-muted">No tasks</p>}
    </div>
  </div>
);

const TaskBoard = ({ tasks = [], onTasksChange }) => {
  const [localTasks, setLocalTasks] = useState(tasks);
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const grouped = useMemo(() => groupTasksByStatus(localTasks), [localTasks]);

  const updateTaskStatus = (taskId, status) => {
    const updated = localTasks.map((task) => (task.id === taskId ? { ...task, status } : task));
    setLocalTasks(updated);
    onTasksChange?.(updated);
  };

  const addTask = () => {
    const title = newTask.trim();
    if (!title) return;

    const task = {
      id: `manual-${Date.now()}`,
      title,
      status: 'todo',
      priority: 'medium',
      source: 'manual',
    };

    const updated = [task, ...localTasks];
    setLocalTasks(updated);
    onTasksChange?.(updated);
    setNewTask('');
  };

  return (
    <div className="card-surface space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Tasks</p>
          <h2 className="text-2xl font-semibold text-white">AI Task Board</h2>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.3em] text-text-muted">
          <CheckCircle2 className="h-4 w-4 text-success" />
          synced
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/5 bg-white/5 p-3 text-sm text-text-muted">
        <input
          value={newTask}
          onChange={(event) => setNewTask(event.target.value)}
          placeholder="Add a manual task"
          className="flex-1 rounded-full border border-white/5 bg-background/60 px-4 py-2 text-sm text-white focus:outline-none"
        />
        <button
          type="button"
          onClick={addTask}
          className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-crimson-soft transition hover:translate-y-[-2px]"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <TaskColumn title="Todo" tasks={grouped.todo} onStatusChange={updateTaskStatus} />
        <TaskColumn title="In Progress" tasks={grouped['in-progress']} onStatusChange={updateTaskStatus} />
        <TaskColumn title="Blocked" tasks={grouped.blocked} onStatusChange={updateTaskStatus} />
        <TaskColumn title="Done" tasks={grouped.done} onStatusChange={updateTaskStatus} />
      </div>
    </div>
  );
};

export default TaskBoard;

