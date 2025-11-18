export const formatPercentage = (value) => `${Math.round(value ?? 0)}%`;

export const formatTimeline = (estimate) => {
  if (!estimate) return 'Timeline not available';
  if (typeof estimate === 'string') return estimate;

  const { weeks, note } = estimate;
  const duration = weeks ? `${weeks} week${weeks > 1 ? 's' : ''}` : 'Flexible timeline';
  return note ? `${duration} • ${note}` : duration;
};

export const formatDate = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
};

export const groupTasksByStatus = (tasks = []) =>
  tasks.reduce(
    (acc, task) => {
      const status = task.status || 'todo';
      acc[status] = [...(acc[status] || []), task];
      return acc;
    },
    { todo: [], 'in-progress': [], blocked: [], done: [] },
  );

