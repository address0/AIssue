'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/(Navbar)/Sidebar/Sidebar'
import Link from 'next/link'
import ChatModal from '@/components/(Modal)/ChatModal/page'
import styles from '@/app/(Calender)/month/month.module.css'
import Button from '@/components/Button/Button'

export default function MonthPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const [isClient, setIsClient] = useState(false)
  const [isMonthView, setIsMonthView] = useState(true)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [selectedStory, setSelectedStory] = useState<string | null>(null)
  const [monthOffset, setMonthOffset] = useState(0) // New state for month offset
  const currentDate = new Date()
  const today = new Date()

  const stories = [
    {
      id: 'story1',
      title: 'Story Title 1',
      tasks: [
        {
          title: 'Task 1',
          start: new Date(2024, 10, 1, 10, 0),
          end: new Date(2024, 10, 1, 11, 0),
        },
      ],
    },
    {
      id: 'story2',
      title: 'Story Title 2',
      tasks: [
        {
          title: 'Task 2',
          start: new Date(2024, 10, 3, 12, 0),
          end: new Date(2024, 10, 3, 14, 0),
        },
      ],
    },
  ]

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen)
  }

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleDayClick = (day: number, month: number, year: number) => {
    const clickedDate = new Date(year, month, day, 12, 0, 0)
    if (clickedDate >= today) {
      setSelectedDate(clickedDate)
    }
  }

  const getMonthData = (year: number, month: number) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDayOfMonth = new Date(year, month, 1).getDay()
    return { daysInMonth, firstDayOfMonth }
  }

  const renderMonth = (monthOffset: number) => {
    const baseDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + monthOffset, 1)
    const year = baseDate.getFullYear()
    const month = baseDate.getMonth()
    const { daysInMonth, firstDayOfMonth } = getMonthData(year, month)

    return (
      <div key={monthOffset} className={styles.monthContainer}>
        <div className={styles.monthHeader}>
          <button className={styles.arrowButton} onClick={() => setMonthOffset(monthOffset - 1)}>
            <img src="/img/leftarrow.png" alt="Previous Month" />
          </button>
          <h3 style={{ color: '#4D86FF' }} className="font-semibold">
            {`${month + 1}월`}
          </h3>

          <button className={styles.arrowButton} onClick={() => setMonthOffset(monthOffset + 1)}>
            <img src="/img/rightarrow.png" alt="Next Month" />
          </button>
        </div>

        <div className={styles.weekdaysContainer}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
            <div key={index} className={`${styles.weekday} ${index === 0 ? styles.sunday : ""} ${index === 6 ? styles.saturday : ""}`}>
              {day}
            </div>
          ))}
        </div>

        <div className={styles.calendarContainer}>
          {Array.from({ length: firstDayOfMonth }).map((_, index) => (
            <div key={`empty-${index}`} className={styles.calendarDay}></div>
          ))}
          {Array.from({ length: daysInMonth }, (_, index) => {
            const day = index + 1
            const date = new Date(year, month, day)
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
            const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === month && selectedDate?.getFullYear() === year
            const isPastDate = date < today && !isToday

            return (
              <div
                key={`day-${year}-${month}-${day}`}
                className={`${styles.calendarDay} ${isToday ? styles.today : ""} ${isSelected ? styles.selected : ""} ${isPastDate ? styles.disabled : ""}`}
                onClick={() => !isPastDate && handleDayClick(day, month, year)}
              >
                {isToday ? "오늘" : day}
                <div className={`${styles.epicBar} ${styles[`epicColor${day % 4 + 1}`]}`} />
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-6">
        <div className="relative flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-[#7498E5]">
            월별 프로젝트 일정
          </h2>

          <div className="absolute left-1/2 transform -translate-x-1/2 flex">
            <Link href="/month">
              <button
                onClick={() => setIsMonthView(true)}
                className={`px-4 py-2 font-medium text-sm ${isMonthView ? 'bg-[#7498E5] text-white' : 'bg-white text-[#54B2A3]'} rounded-l-lg`}
              >
                Month
              </button>
            </Link>
            <Link href="/week">
              <button
                onClick={() => setIsMonthView(false)}
                className={`px-4 py-2 font-medium text-sm ${!isMonthView ? 'bg-[#54B2A3] text-white' : 'bg-white text-[#7498E5]'} rounded-r-lg`}
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
          <div style={{ width: '70%', minWidth: '700px' }}> {/* Calendar section with fixed width */}
            {renderMonth(monthOffset)} {/* Pass the monthOffset to render the correct month */}
          </div>
          <div style={{ width: '30%', minWidth: '300px' }} className="bg-gray-50 p-4 rounded-lg shadow-lg"> {/* Story list section with fixed width */}
            <h3 className="text-lg font-semibold text-[#7498E5] mb-4 bg-[#9EBDFF66] p-2 rounded-md text-center">
              Story List
            </h3>
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

        <button onClick={toggleChat} className="fixed bottom-8 right-8 w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center shadow-lg">
          <img src="/img/chaticon.png" alt="Chat Icon" className="w-6 h-6" />
        </button>

        {isChatOpen && <ChatModal onClose={toggleChat} />}
      </div>
    </div>
  )
}
