// src/app/week/page.tsx
'use client';

import Sidebar from '@/components/(Navbar)/Sidebar/Sidebar';
import Link from 'next/link';
import { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import ChatModalGreen from '@/components/(Modal)/ChatModalGreen/page';
import '@/app/(Calender)/week/week.module.css';

const localizer = momentLocalizer(moment);

function CustomToolbar({ label }: { label: string }) {
  return (
    <div className="flex justify-center items-center py-2">
      <h2 className="text-2xl font-semibold text-[#54B2A3]">{'10월 4주차'}</h2>
    </div>
  );
}

export default function WeekPage() {
  const [isMonthView, setIsMonthView] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<string | null>(null);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const stories = [
    { id: 'story1', title: 'Story Title 1', tasks: [{ title: 'Task 1', start: new Date(2024, 10, 1, 10, 0), end: new Date(2024, 10, 1, 11, 0) }] },
    { id: 'story2', title: 'Story Title 2', tasks: [{ title: 'Task 2', start: new Date(2024, 10, 3, 12, 0), end: new Date(2024, 10, 3, 14, 0) }] },
  ];

  const events = selectedStory
    ? stories.find((story) => story.id === selectedStory)?.tasks || []
    : [];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-6">
        <div className="relative flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-[#54B2A3]">주간 업무 일정</h2>

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

        <div className="flex">
          {/* Calendar */}
          <div className="flex-1 border border-[#54B2A3] rounded-lg p-2 bg-[#FFFFFF] calendar-container">
            <Calendar
              localizer={localizer}
              events={events}
              defaultView="work_week"
              views={{ work_week: true }}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 'calc(100vh - 150px)' }}
              components={{
                toolbar: CustomToolbar,
              }}
              dayPropGetter={(date: Date) => ({
                style: { color: '#929292' }, // Day header color
              })}
              slotPropGetter={(date: Date) => ({
                style: { color: '#929292' }, // Time slot color
              })}
              formats={{
                dayFormat: (date: Date, culture: string, localizer: any) =>
                  localizer.format(date, 'ddd', culture), // Shorten days to Mon, Tue, etc.
                timeGutterFormat: (date: Date, culture: string, localizer: any) =>
                  localizer.format(date, 'h', culture), // Display time as 9, 10, 11, etc.
                agendaTimeFormat: 'h', // Ensures agenda view matches the short format
              }}
              min={new Date(2024, 10, 1, 9, 0)}
              max={new Date(2024, 10, 1, 18, 0)}
              scrollToTime={new Date(2024, 10, 1, 9, 0)} // Start the view at 9 AM
            />
          </div>
          {/* Story List Sidebar */}
          <div className="w-1/4 p-4 bg-[#F5F5F5] border-l border-gray-300">
            <h3 className="text-lg font-semibold text-[#54B2A3] mb-4 bg-[#C2F4EC] p-2 rounded-md text-center">Story List</h3>
            {stories.map((story) => (
              <div key={story.id} className="mb-4 p-3 bg-white rounded-lg shadow-sm border border-gray-200">
                <button
                  className="flex justify-between items-center w-full text-left"
                  onClick={() => setSelectedStory(story.id === selectedStory ? null : story.id)}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div>
                      <span className="font-semibold text-gray-700">{story.title}</span>
                      <p className="text-sm text-gray-500"># Issue Code / 4 hours</p>
                    </div>
                  </div>
                  <span className="text-gray-500">{story.id === selectedStory ? '▲' : '▼'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Chat icon button */}
        <button
          onClick={toggleChat}
          className="fixed bottom-8 right-8 w-12 h-12 rounded-full bg-[#54B2A3] flex items-center justify-center shadow-lg"
        >
          <img src="/img/chaticongreen.png" alt="Chat Icon" className="w-6 h-6" />
        </button>

        {isChatOpen && <ChatModalGreen onClose={toggleChat} />}
      </div>
    </div>
  );
}
