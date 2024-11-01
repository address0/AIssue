// src/app/month/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Sidebar from '@/components/(Navbar)/Sidebar/Sidebar';
import { renderCustomEvents, renderEpicList } from '@/utils/monthCalender';
import '@/app/(Calender)/month/month.module.css';
import Link from 'next/link';
import ChatModal from '@/components/(Modal)/ChatModal/page';


export default function MonthPage() {
  const [value, setValue] = useState<Date | [Date, Date] | null>(new Date());
  const [isClient, setIsClient] = useState(false);
  const [isMonthView, setIsMonthView] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };
 

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleDateChange = (date: Date | [Date, Date] | null) => {
    setValue(date);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-6">
      <div className="relative flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-[#7498E5]">월별 프로젝트 일정</h2>

          {/* 가운데 고정된 버튼 */}
          <div className="absolute left-1/2 transform -translate-x-1/2 flex">
            <Link href="/month">
              <button
                onClick={() => setIsMonthView(true)}
                className={`px-4 py-2 font-medium text-sm ${
                  isMonthView ? 'bg-[#7498E5] text-white' : 'bg-white text-[#54B2A3]'
                } rounded-l-lg`}
              >
                Month
              </button>
            </Link>
            <Link href="/week">
              <button
                onClick={() => setIsMonthView(false)}
                className={`px-4 py-2 font-medium text-sm ${
                  !isMonthView ? 'bg-[#54B2A3] text-white' : 'bg-white text-[#7498E5]'
                } rounded-r-lg`}
              >
                Week
              </button>
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-gray-700">User1님</span>
            <div className="bg-gray-300 w-10 h-5 rounded-full flex items-center">
              <div className="bg-white w-4 h-4 rounded-full ml-1 transition-transform"></div>
            </div>
          </div>
        </div>
        <div className="flex space-x-4">
          {isClient && (
            <Calendar
              onChange={(date) => handleDateChange(date as Date | [Date, Date] | null)}
              value={value}
              tileContent={({ date, view }) => view === 'month' && renderCustomEvents(date)}
              className="custom-calendar w-full flex-grow basis-4/5 border-2 border-[#4D86FF] rounded-lg p-4 bg-white shadow-lg"
            />
          )}
          <div className="flex-grow basis-1/5 bg-gray-50 p-4 rounded-lg shadow-lg">
            <h3 className="text-blue-500 font-semibold mb-4">Epic List</h3>
            <ul className="space-y-3">
              {renderEpicList()}
            </ul>
          </div>
        </div>

        {/* Chat icon button */}
        <button
          onClick={toggleChat}
          className="fixed bottom-8 right-8 w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center shadow-lg"
        >
          <img src="/img/chaticon.png" alt="Chat Icon" className="w-6 h-6" />
        </button>

        {/* Chat Modal - conditionally rendered */}
        {isChatOpen && <ChatModal onClose={toggleChat} />}
            
      </div>
    </div>
  );
}
