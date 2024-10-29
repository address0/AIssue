// src/utils/calendarHelpers.tsx
import { format } from 'date-fns';

export function renderEvents(date: Date) {
  const events = [
    { date: '2024-10-01', label: 'Epic 1', color: 'bg-red-400' },
    { date: '2024-10-08', label: 'Epic 2', color: 'bg-green-400' },
    { date: '2024-10-15', label: 'Epic 3', color: 'bg-gray-400' },
    { date: '2024-10-22', label: 'Epic 4', color: 'bg-blue-400' },
  ];

  const event = events.find(event => format(new Date(event.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));

  return event ? (
    <div className={`text-white rounded-full px-2 py-1 text-xs ${event.color}`}>
      {event.label}
    </div>
  ) : null;
}

export function renderEpicList() {
  const epicList = [
    { id: 1, title: 'Epic 1', dateRange: '2024.10.01 - 2024.10.05' },
    { id: 2, title: 'Epic 2', dateRange: '2024.10.08 - 2024.10.12' },
    { id: 3, title: 'Epic 3', dateRange: '2024.10.15 - 2024.10.19' },
    { id: 4, title: 'Epic 4', dateRange: '2024.10.22 - 2024.10.26' },
  ];

  return epicList.map(epic => (
    <li key={epic.id} className="flex items-center space-x-2 bg-white p-2 rounded-lg shadow">
      <div className="bg-blue-500 w-2 h-2 rounded-full"></div>
      <div>
        <p className="text-sm font-semibold">{epic.title}</p>
        <p className="text-xs text-gray-500">{epic.dateRange}</p>
      </div>
    </li>
  ));
}
