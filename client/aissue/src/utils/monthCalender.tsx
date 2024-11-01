// src/utils/calendarHelpers.tsx
import { format, isWithinInterval, parseISO } from 'date-fns';

export function renderCustomEvents(date: Date) {
  const events = [
    { startDate: '2024-10-01', endDate: '2024-10-05', label: 'Epic 1', color: 'bg-red-400' },
    { startDate: '2024-10-08', endDate: '2024-10-12', label: 'Epic 2', color: 'bg-green-400' },
    { startDate: '2024-10-15', endDate: '2024-10-19', label: 'Epic 3', color: 'bg-gray-400' },
    { startDate: '2024-10-22', endDate: '2024-10-26', label: 'Epic 4', color: 'bg-blue-400' },
  ];

  const event = events.find(event =>
    isWithinInterval(date, {
      start: parseISO(event.startDate),
      end: parseISO(event.endDate),
    })
  );

  return event ? (
    <div className={`absolute inset-0 flex items-center justify-center ${event.color} h-full rounded-lg`}>
      <span className="text-xs text-white font-semibold">{event.label}</span>
    </div>
  ) : null;
}

export function renderEpicList() {
  const epicList = [
    { id: 1, title: 'Epic 1', dateRange: '2024.10.01 - 2024.10.05', icon: '📌' },
    { id: 2, title: 'Epic 2', dateRange: '2024.10.08 - 2024.10.12', icon: '🚀' },
    { id: 3, title: 'Epic 3', dateRange: '2024.10.15 - 2024.10.19', icon: '🎉' },
    { id: 4, title: 'Epic 4', dateRange: '2024.10.22 - 2024.10.26', icon: '🔔' },
  ];

  return epicList.map(epic => (
    <li key={epic.id} className="flex items-center space-x-2 bg-white p-2 rounded-lg shadow">
      <div className="text-xl">{epic.icon}</div>
      <div>
        <p className="text-sm font-semibold">{epic.title}</p>
        <p className="text-xs text-gray-500">{epic.dateRange}</p>
      </div>
    </li>
  ));
}
