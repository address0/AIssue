'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/(Navbar)/Sidebar/Sidebar'
import Link from 'next/link'
import ChatModalGreen from '@/components/(Modal)/ChatModalGreen/page'
import styles from '@/app/(Calender)/week/week.module.css'

interface Task {
  title: string
  start: Date
  end: Date
}

interface Story {
  id: string
  title: string
  tasks: Task[]
}

export default function WeekPage() {
  const [isMonthView, setIsMonthView] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [selectedStory, setSelectedStory] = useState<string | null>(null)

  const today = new Date()
  const currentMonth = today.toLocaleString('default', { month: 'long' })
  const currentWeek = Math.ceil((today.getDate() + (new Date(today.getFullYear(), today.getMonth(), 1).getDay())) / 7)
  const currentHour = today.getHours()
  
  // Match currentDay with the format in daysOfWeek array ('Mon', 'Tue', etc.)
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const currentDay = dayNames[today.getDay()]

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  const hours = Array.from({ length: 10 }, (_, i) => i + 9) // Hours from 9AM to 6PM

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen)
  }

  const stories: Story[] = [
    {
      id: 'story1',
      title: 'Story Title 1',
      tasks: [
        {
          title: 'Task 1',
          start: new Date(2024, 9, 7, 10, 0),
          end: new Date(2024, 9, 7, 12, 0),
        },
        {
          title: 'Task 2',
          start: new Date(2024, 9, 8, 9, 0),
          end: new Date(2024, 9, 8, 10, 30),
        },
      ],
    },
    {
      id: 'story2',
      title: 'Story Title 2',
      tasks: [
        {
          title: 'Task 1',
          start: new Date(2024, 9, 9, 13, 0),
          end: new Date(2024, 9, 9, 15, 0),
        },
      ],
    },
  ]

  const getTasksForDay = (day: string) => {
    const dayIndex = daysOfWeek.indexOf(day)
    return stories.flatMap(story =>
      story.tasks.filter(
        task =>
          task.start.getDay() - 1 === dayIndex &&
          task.start.getDate() === task.end.getDate()
      )
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-6 overflow-hidden">
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

        <div className="flex space-x-4">
          {/* Calendar section with custom border */}
          <div style={{ width: '70%', minWidth: '700px', border: '2px solid #54B2A3' }} className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex justify-center">
              <h3 className="text-2xl font-semibold text-[#54B2A3]">
                {`${currentMonth} ${currentWeek}주차`}
              </h3>
            </div>

            <div className="grid grid-cols-6 gap-0 relative">
              {/* Time labels along the left side with top padding for alignment */}
              <div className="flex flex-col pt-2">
                {hours.map(hour => (
                  <div key={hour} className="text-center font-semibold text-gray-500 h-12 flex items-center justify-center">
                    {`${hour}:00`}
                  </div>
                ))}
              </div>

              {/* Days of the week */}
              {daysOfWeek.map(day => (
                <div key={day} className="flex flex-col relative">
                  {/* Highlight today's column */}
                  <div className={`text-center font-semibold text-gray-500 mb-1 ${day === currentDay ? 'bg-red-400 bg-opacity-80' : ''}`}>
                    {day}
                  </div>
                  <div className={`border-l border-r border-b h-full ${day === currentDay ? 'bg-red-400 bg-opacity-20' : ''}`}>
                    {hours.map(hour => (
                      <div key={hour} className="border-t h-12 relative">
                        {day === currentDay && hour === currentHour && (
                          <div className="absolute top-0 left-0 w-full border-t-2 border-red-500"></div>
                        )}
                        {getTasksForDay(day)
                          .filter(task => task.start.getHours() === hour)
                          .map((task, idx) => (
                            <div
                              key={idx}
                              className="absolute top-0 left-0 w-full bg-[#54B2A3] text-white rounded-md text-sm p-1"
                              style={{
                                top: (task.start.getMinutes() / 60) * 100 + '%',
                                height:
                                  ((task.end.getTime() - task.start.getTime()) / 1000 / 60 / 60) * 100 + '%',
                              }}
                            >
                              {task.title}
                            </div>
                          ))}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Story List Sidebar */}
          <div style={{ width: '30%', minWidth: '300px' }} className="bg-gray-50 p-4 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-[#54B2A3] mb-4 bg-[#C2F4EC] p-2 rounded-md text-center">
              Story List
            </h3>
            {stories.map((story) => (
              <div
                key={story.id}
                className="mb-4 p-3 bg-white rounded-lg shadow-sm border border-gray-200"
              >
                <button
                  className="flex justify-between items-center w-full text-left"
                  onClick={() =>
                    setSelectedStory(
                      story.id === selectedStory ? null : story.id
                    )
                  }
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div>
                      <span className="font-semibold text-gray-700">
                        {story.title}
                      </span>
                      <p className="text-sm text-gray-500">
                        # Issue Code / 4 hours
                      </p>
                    </div>
                  </div>
                  <span className="text-gray-500">
                    {story.id === selectedStory ? '▲' : '▼'}
                  </span>
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
  )
}
