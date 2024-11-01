// src/app/week/page.tsx
'use client';

import Sidebar from '@/components/(Navbar)/Sidebar/Sidebar';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import ChatModalGreen from '@/components/(Modal)/ChatModalGreen/page';


const localizer = momentLocalizer(moment);

export default function WeekPage() {
  const [isMonthView, setIsMonthView] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname === '/week') {
      setIsMonthView(false);
    }
  }, []);

  const events = [
    {
      title: 'Team Meeting',
      start: new Date(2024, 10, 1, 10, 0),
      end: new Date(2024, 10, 1, 11, 0),
    },
    {
      title: 'Project Deadline',
      start: new Date(2024, 10, 3, 12, 0),
      end: new Date(2024, 10, 3, 14, 0),
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-6">
      <div className="relative flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-[#54B2A3]">주간 업무 일정</h2>

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


        {/* react-big-calendar을 주간 캘린더로 설정 */}
        <Calendar
          localizer={localizer}
          events={events}
          defaultView="week"
          startAccessor="start"
          endAccessor="end"
          style={{ height: 'calc(100vh - 150px)' }} // 상단 바 높이에 맞춰 조정
        />

        {/* Chat icon button */}
        <button
          onClick={toggleChat}
          className="fixed bottom-8 right-8 w-12 h-12 rounded-full bg-[#54B2A3] flex items-center justify-center shadow-lg"
        >
          <img src="/img/chaticongreen.png" alt="Chat Icon" className="w-6 h-6" />
        </button>

        {/* Chat Modal - conditionally rendered */}
        {isChatOpen && <ChatModalGreen onClose={toggleChat} />}
      </div>
    </div>
  );
}
