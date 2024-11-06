'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ChatModal from '@/components/(Modal)/ChatModal/page'
import { usePathname } from 'next/navigation'

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
  const [weekOffset, setWeekOffset] = useState(0) // 주차 오프셋 상태 추가
  const [userName, setUserName] = useState<string | null>(null)

  useEffect(() => {
    // 클라이언트 측에서만 sessionStorage 접근
    if (typeof window !== 'undefined') {
      setUserName(sessionStorage.getItem('memberName'))
    }
  }, [])

  const today = new Date()
  const currentWeekDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + weekOffset * 7
  )
  const currentMonth = currentWeekDate.toLocaleString('default', { month: 'long' })
  const currentWeek = Math.ceil(
    (currentWeekDate.getDate() +
      new Date(currentWeekDate.getFullYear(), currentWeekDate.getMonth(), 1).getDay()) / 7,
  )

  const accessToken = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null
  const memberId = typeof window !== 'undefined' ? sessionStorage.getItem('memberId') : null
  const pathname = usePathname()
  const projectId = pathname.split('/')[2]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const currentDay = dayNames[today.getDay()]

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  const hours = Array.from({ length: 10 }, (_, i) => i + 9)

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen)
  }

  const stories: Story[] = [
    {
      id: 'story1',
      title: 'Sample Story 1',
      tasks: [
        { title: 'Task 1', start: new Date(2024, 9, 10, 9, 0), end: new Date(2024, 9, 10, 10, 30) },
        { title: 'Task 2', start: new Date(2024, 9, 10, 13, 0), end: new Date(2024, 9, 10, 14, 30) },
      ],
    },
    {
      id: 'story2',
      title: 'Sample Story 2',
      tasks: [
        { title: 'Task A', start: new Date(2024, 9, 11, 10, 0), end: new Date(2024, 9, 11, 12, 0) },
      ],
    },
  ]

  const getTasksForDay = (day: string) => {
    const dayIndex = daysOfWeek.indexOf(day)
    return stories.flatMap((story) =>
      story.tasks.filter(
        (task) =>
          task.start.getDay() - 1 === dayIndex &&
          task.start.getDate() === task.end.getDate(),
      ),
    )
  }

  // 오늘 날짜가 현재 주차에 포함되는지 여부 확인
  const isTodayInCurrentWeek = () => {
    const startOfWeek = new Date(currentWeekDate)
    startOfWeek.setDate(currentWeekDate.getDate() - currentWeekDate.getDay() + 1)
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 4)

    return today >= startOfWeek && today <= endOfWeek
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="flex-1 p-6 overflow-hidden">
        <div className="relative flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-[#54B2A3]">
            주간 업무 일정
          </h2>

          <div className="absolute left-1/2 transform -translate-x-1/2 flex">
            <Link href={`/project/${projectId}/month`}>
              <button
                onClick={() => setIsMonthView(true)}
                className={`px-4 py-2 font-medium text-sm ${
                  isMonthView
                    ? 'bg-[#7498E5] text-white'
                    : 'bg-white text-[#54B2A3]'
                } rounded-l-lg`}
              >
                Month
              </button>
            </Link>
            <Link href={`/project/${projectId}/week`}>
              <button
                onClick={() => setIsMonthView(false)}
                className={`px-4 py-2 font-medium text-sm ${
                  !isMonthView
                    ? 'bg-[#54B2A3] text-white'
                    : 'bg-white text-[#7498E5]'
                } rounded-r-lg`}
              >
                Week
              </button>
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-gray-700">{userName}님</span> {/* 사용자 이름 적용 */}
            
          </div>
        </div>

        <div className="flex space-x-4">
          <div
            style={{
              width: '70%',
              minWidth: '700px',
              border: '2px solid #54B2A3',
            }}
            className="bg-white p-4 rounded-lg shadow-md"
          >
            <div className="flex justify-center items-center space-x-2">
              <button
                onClick={() => setWeekOffset(weekOffset - 1)}
                style={{ width: '24px', height: '24px' }}
              >
                <img src="/img/weekleftarrow.png" alt="Previous Week" style={{ width: '100%', height: '100%' }} />
              </button>

              <h3 className="text-2xl font-semibold text-[#54B2A3] mx-2">
                {`${currentMonth} ${currentWeek}주차`}
              </h3>

              <button
                onClick={() => setWeekOffset(weekOffset + 1)}
                style={{ width: '24px', height: '24px' }}
              >
                <img src="/img/weekrightarrow.png" alt="Next Week" style={{ width: '100%', height: '100%' }} />
              </button>
            </div>

            <div className="grid grid-cols-6 gap-0 relative">
              <div className="flex flex-col pt-2">
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="text-center font-semibold text-gray-500 h-12 flex items-center justify-center"
                  >
                    {`${hour}:00`}
                  </div>
                ))}
              </div>

              {daysOfWeek.map((day) => (
                <div key={day} className="flex flex-col relative">
                  <div
                    className={`text-center font-semibold text-gray-500 mb-1 ${
                      isTodayInCurrentWeek() && day === currentDay ? 'bg-red-400 bg-opacity-80' : ''
                    }`}
                  >
                    {day}
                    {isTodayInCurrentWeek() && day === currentDay && (
                      <span className="text-sm text-gray-600 ml-1">
                        {`${today.getMonth() + 1}/${today.getDate()}`}
                      </span>
                    )}
                  </div>
                  <div
                    className={`border-l border-r border-b h-full ${
                      isTodayInCurrentWeek() && day === currentDay ? 'bg-red-400 bg-opacity-20' : ''
                    }`}
                  >
                    {hours.map((hour) => (
                      <div key={hour} className="border-t h-12 relative">
                        {isTodayInCurrentWeek() && day === currentDay && hour === today.getHours() && (
                          <div className="absolute top-0 left-0 w-full border-t-2 border-red-500"></div>
                        )}
                        {getTasksForDay(day)
                          .filter((task) => task.start.getHours() === hour)
                          .map((task, idx) => (
                            <div
                              key={idx}
                              className="absolute top-0 left-0 w-full bg-[#54B2A3] text-white rounded-md text-sm p-1"
                              style={{
                                top: (task.start.getMinutes() / 60) * 100 + '%',
                                height:
                                  ((task.end.getTime() - task.start.getTime()) /
                                    1000 /
                                    60 /
                                    60) *
                                    100 +
                                  '%',
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

          <div
            style={{ width: '30%', minWidth: '300px' }}
            className="bg-gray-50 p-4 rounded-lg shadow-lg"
          >
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
                      story.id === selectedStory ? null : story.id,
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

        <button
          onClick={toggleChat}
          className="fixed bottom-8 right-8 w-12 h-12 rounded-full bg-[#54B2A3] flex items-center justify-center shadow-lg"
        >
          <img src="/img/chaticongreen.png" alt="Chat Icon" className="w-6 h-6" />
        </button>

        {isChatOpen && (
          <ChatModal
            onClose={toggleChat}
            memberId={memberId}
            projectId={projectId}
            accessToken={accessToken}
            color={'#54B2A3'}
          />
        )}
      </div>
    </div>
  )
}
