// src/app/month/page.tsx
'use client';

import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Sidebar from '@/components/(Navbar)/Sidebar/Sidebar';
import { renderEvents, renderEpicList } from '@/utils/monthCalender';

export default function MonthPage() {
  const [value, setValue] = useState<Date | [Date, Date] | null>(new Date());

  const handleDateChange = (date: Date | [Date, Date] | null) => {
    setValue(date);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-blue-500">월별 프로젝트 일정</h2>
          <div className="flex items-center space-x-2">
            <span className="text-gray-700">User님</span>
            <div className="bg-gray-300 w-10 h-5 rounded-full flex items-center">
              <div className="bg-white w-4 h-4 rounded-full ml-1 transition-transform"></div>
            </div>
          </div>
        </div>
        <div className="flex space-x-4">
          {/* Calendar with 80% width */}
          <div className="flex-grow basis-4/5 border-2 border-[#4D86FF] rounded-lg p-4 bg-white shadow-lg">
            <Calendar
              onChange={(date) => handleDateChange(date as Date | [Date, Date] | null)}
              value={value}
              tileContent={({ date, view }) => view === 'month' && renderEvents(date)}
              className="w-full"
            />
          </div>


          {/* Epic List with 20% width */}
          <div className="flex-grow basis-1/5 bg-gray-50 p-4 rounded-lg shadow-lg">
            <h3 className="text-blue-500 font-semibold mb-4">Epic List</h3>
            <ul className="space-y-3">
              {renderEpicList()}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
