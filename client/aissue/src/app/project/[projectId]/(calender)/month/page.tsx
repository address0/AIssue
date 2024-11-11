'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import ChatModal from '@/components/(Modal)/ChatModal/page'
import styles from '@/app/(Calender)/month/month.module.css'
import { useParams } from 'next/navigation'
import axios from 'axios'
import { usePathname } from 'next/navigation'

interface Epic {
  id: string
  title: string
  start: string
  end: string
}

const epicColors = [
  'bg-[#FFDDC1]',
  'bg-[#D3E5FF]',
  'bg-[#C1FFD6]',
  'bg-[#FFD6FF]',
]

export default function MonthPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const [isMonthView, setIsMonthView] = useState(true)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [selectedStory, setSelectedStory] = useState<string | null>(null)
  const [monthOffset, setMonthOffset] = useState(0)
  const [epics, setEpics] = useState<Epic[]>([])
  const [userName, setUserName] = useState<string | null>(null) // 사용자 이름 상태 추가

  useEffect(() => {
    // 클라이언트 측에서만 sessionStorage 접근
    if (typeof window !== 'undefined') {
      setUserName(sessionStorage.getItem('memberName'))
    }
  }, [])

  const accessToken = sessionStorage.getItem('accessToken')
  const memberId = sessionStorage!.getItem('memberId')
  const pathname = usePathname()
  const projectId = pathname.split('/')[2]
  const currentDate = new Date()
  const today = new Date()
  const { userId } = useParams()

  useEffect(() => {
    if (projectId && userId) {
      fetchEpics()
    }
  }, [monthOffset, projectId, userId])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        setMonthOffset((prev) => prev + 1)
      } else if (event.key === 'ArrowLeft') {
        setMonthOffset((prev) => prev - 1)
      }
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const fetchEpics = async () => {
    try {
      const response = await axios.get(
        `/projects/${projectId}/${userId}/month`,
        {
          params: { monthOffset },
        },
      )
      setEpics(response.data)
    } catch (error) {
      console.error('Error fetching epics:', error)
    }
  }

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen)
  }

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
    const baseDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + monthOffset,
      1,
    )
    const year = baseDate.getFullYear()
    const month = baseDate.getMonth()
    const { daysInMonth, firstDayOfMonth } = getMonthData(year, month)

    return (
      <div key={monthOffset} className={styles.monthContainer}>
        <div className={styles.monthHeader}>
          <button
            className={styles.arrowButton}
            onClick={() => setMonthOffset(monthOffset - 1)}
          >
            <img src="/img/leftarrow.png" alt="Previous Month" />
          </button>
          <h3 className={`${styles.monthTitle} font-semibold`}>{`${year}년 ${
            month + 1
          }월`}</h3>
          <button
            className={styles.arrowButton}
            onClick={() => setMonthOffset(monthOffset + 1)}
          >
            <img src="/img/rightarrow.png" alt="Next Month" />
          </button>
        </div>
        <div className={styles.weekdaysContainer}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
            (day, index) => (
              <div
                key={index}
                className={`${styles.weekday} ${
                  index === 0 ? styles.sunday : ''
                } ${index === 6 ? styles.saturday : ''}`}
              >
                {day}
              </div>
            ),
          )}
        </div>

        <div className={styles.calendarContainer}>
          {Array.from({ length: firstDayOfMonth }).map((_, index) => (
            <div key={`empty-${index}`} className={styles.calendarDay}></div>
          ))}
          {Array.from({ length: daysInMonth }, (_, index) => {
            const day = index + 1
            const date = new Date(year, month, day)
            const isToday =
              day === today.getDate() &&
              month === today.getMonth() &&
              year === today.getFullYear()
            const isSelected =
              selectedDate?.getDate() === day &&
              selectedDate?.getMonth() === month &&
              selectedDate?.getFullYear() === year
            const isPastDate = date < today && !isToday

            const dayEpics = epics.filter(
              (epic) =>
                date >= new Date(epic.start) && date <= new Date(epic.end),
            )

            return (
              <div
                key={`day-${year}-${month}-${day}`}
                className={`${styles.calendarDay} ${
                  isToday ? styles.today : ''
                } ${isSelected ? styles.selected : ''} ${
                  isPastDate ? styles.disabled : ''
                }`}
                onClick={() => !isPastDate && handleDayClick(day, month, year)}
              >
                {isToday ? '오늘' : day}
                {dayEpics.map((epic, idx) => (
                  <div
                    key={epic.id}
                    className={`${styles.epicBar} ${
                      epicColors[idx % epicColors.length]
                    }`}
                    title={epic.title}
                    style={{ marginTop: '2px' }}
                  />
                ))}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="flex-1 p-6">
        <div className="relative flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-[#7498E5]">
            월별 프로젝트 일정
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
            <span className="text-gray-700">{userName}님</span>
          
          </div>
        </div>

        <div className="flex space-x-4">
          <div style={{ width: '70%', minWidth: '700px' }}>
            {renderMonth(monthOffset)}
          </div>
          <div
            style={{ width: '30%', minWidth: '300px' }}
            className="bg-gray-50 p-4 rounded-lg shadow-lg"
          >
            <h3 className="text-lg font-semibold text-[#7498E5] mb-4 bg-[#9EBDFF66] p-2 rounded-md text-center">
              Epic List
            </h3>
            {epics.map((epic, idx) => (
              <div
                key={epic.id}
                className={`mb-4 p-3 rounded-lg shadow-sm border border-gray-200 ${
                  epicColors[idx % epicColors.length]
                }`}
              >
                <div
                  className="flex justify-between items-center w-full text-left"
                  onClick={() =>
                    setSelectedStory(epic.id === selectedStory ? null : epic.id)
                  }
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        epicColors[idx % epicColors.length]
                      }`}
                    ></div>
                    <div>
                      <span className="font-semibold text-gray-700">
                        {epic.title}
                      </span>
                      <p className="text-sm text-gray-500">
                        {`${new Date(
                          epic.start,
                        ).toLocaleDateString()} - ${new Date(
                          epic.end,
                        ).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={toggleChat}
          className="fixed bottom-8 right-8 w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center shadow-lg"
        >
          <img src="/img/chaticon.png" alt="Chat Icon" className="w-6 h-6" />
        </button>

        {isChatOpen && (
          <ChatModal
            onClose={toggleChat}
            memberId={memberId}
            projectId={projectId}
            accessToken={accessToken}
            color={'#7498E5'}
          />
        )}
      </div>
    </div>
  )
}
