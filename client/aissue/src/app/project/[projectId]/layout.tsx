'use client'

import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { getProjectList, getProjectInfo } from '@/api/project'
import { useState } from 'react'
import ChatBotModal from '@/components/(Modal)/ChatBotModal/page'
import ChatModal from '@/components/(Modal)/ChatModal/page'
import { logOut } from '@/api/user'
import LottieAnimation from '@/components/LottieAnimation/LottieAnimation'
import animationData from '@public/lottie/Animation - 1731821799004.json'

interface Message {
  text: string
  isUser: boolean
}

export default function ProjectLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const memberId =
    typeof window !== 'undefined' ? sessionStorage.getItem('memberId') : null

  const { data, isLoading } = useQuery({
    queryKey: ['projectList', memberId],
    queryFn: () => getProjectList(),
  })

  const pathname = usePathname()
  const router = useRouter()
  const projectId = pathname.split('/')[2]
  const currentPath = pathname.split('/')[3]
  const accessToken =
    typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null

  const userName =
    typeof window !== 'undefined' ? sessionStorage.getItem('memberName') : null

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isProjectChatOpen, setIsProjectChatOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen)
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen)
  }

  const toggleProjectChat = () => {
    setIsProjectChatOpen(!isProjectChatOpen)
  }
  
  const [chatBotMessages, setChatBotMessages] = useState<Message[]>([
    {
      text: '안녕하세요. JIRA에 관해 궁금한 게 있으면 뭐든지 물어보세요.',
      isUser: false,
    },
  ])

  const handleLogout = async () => {
    try {
      await logOut()
      sessionStorage.clear()
      router.push('/login')
    } catch (error) {
      console.error('로그아웃에 에러가 생겼습니다.', error)
    }
  }

  const handleProjectSelect = async (selectedProjectId: string) => {
    setDropdownOpen(false)
    try {
      const projectInfo = await getProjectInfo(selectedProjectId)
      if (projectInfo && projectInfo.isCompleted) {
        router.push(`/project/${selectedProjectId}/info`)
      } else {
        router.push(`/project/${selectedProjectId}`)
      }
    } catch (error) {
      console.error('Failed to fetch project info:', error)
      router.push(`/project/${selectedProjectId}`)
    }
  }

  if (isLoading) {
    return <div>프로젝트 목록을 불러오는 중입니다.</div>
  }

  const navigationItems = [
    { name: 'AI 스프린트 생성', path: 'sprint' },
    { name: '전체 업무 로그', path: 'worklog' },
    { name: '프로젝트 일정', path: 'month' },
    { name: '채팅 회고록', path: 'summary' },
    { name: '프로젝트 정보', path: 'info' },
  ]

  return (
    <>
      <div className="flex h-screen">
        {/* Sidebar */}
        <div
          className={`${
            isSidebarOpen ? 'w-[20.625rem]' : 'w-0'
          } transition-all duration-300 fixed top-0 left-0 h-screen bg-white shadow-lg overflow-hidden z-50 lg:w-[20.625rem] lg:static lg:transition-none`}
        >
          <div className="flex flex-col p-6 gap-4 text-disabled-dark font-bold">
            {/* User Info */}
            <div className="py-6">
              <div className="flex flex-col items-center mb-6">
                <Image
                  src="/img/chatbot.png"
                  alt="Team Project Icon"
                  width={40}
                  height={40}
                />
                <p>
                  안녕하세요, <span className="font-bold">{userName}</span>님
                </p>
                <p
                  onClick={toggleDropdown}
                  className="text-black font-semibold cursor-pointer"
                >
                  <span className="font-normal">현재 프로젝트: </span>
                  {projectId ? `#${projectId}` : 'Project 선택'}
                </p>
                {dropdownOpen && (
                  <div className="absolute z-10 mt-2 w-48 bg-white rounded-md shadow-lg">
                    {data?.map((project: string) => (
                      <button
                        key={project}
                        onClick={() => handleProjectSelect(project)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-bold"
                      >
                        #{project}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Links */}
            <div className="flex flex-col gap-3 mb-20 text-sm">
              {navigationItems.map((item) => (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => {
                    router.push(`/project/${projectId}/${item.path}`);
                    setIsSidebarOpen(false); // 메뉴 클릭 시 사이드바 닫기
                  }}
                  className={`p-6 rounded-xl text-left ${
                    currentPath === item.path
                      ? 'bg-[#7498e5] text-white'
                      : 'hover:bg-base-50'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full text-center text-black bg-[#EEEEEE] hover:bg-[#9EBDFF66] py-2 rounded-[20px]"
            >
              프로젝트 나가기
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full overflow-y-auto flex flex-col bg-gray-100">
          {/* Hamburger Menu for Small Screens */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 bg-gray-200 rounded-md fixed top-4 left-4 z-50"
          >
            {/* <Image
              src="/img/hamburger-menu.png"
              alt="Menu"
              width={24}
              height={24}
            /> */}
             <LottieAnimation animationData={animationData} width={24} height={24} />
          </button>

          {/* Children Content */}
          {children}
        </div>
        {/* ChatBot Modal Trigger */}
        <button
          onClick={toggleChat}
          className="fixed bottom-16 right-16 lg:bottom-8 lg:right-24 p-4 rounded-full shadow-lg z-50"
        >
          <Image
            src="/img/chatbot.png"
            alt="ChatBot"
            width={48}
            height={48}
            className="rounded-full"
          />
        </button>

        {/* Chat Modal Trigger */}
        <button
          onClick={toggleProjectChat}
          className="fixed bottom-16 right-8 lg:bottom-8 lg:right-8 p-4 rounded-full shadow-lg z-50"
        >
          <Image
            src="/img/chaticon.png"
            alt="Chat"
            width={48}
            height={48}
            className="rounded-full"
          />
        </button>


        {isProjectChatOpen && (
          <ChatModal
            onClose={toggleProjectChat}
            memberId={memberId}
            projectId={projectId}
            accessToken={accessToken}
            color={'#54B2A3'}
          />
        )}

        {/* ChatBot Modal */}
        {isChatOpen && (
          <ChatBotModal
            onClose={toggleChat}
            chatBotMessages={chatBotMessages}
            setChatBotMessages={setChatBotMessages}
          />
        )}
      </div>
    </>
  )
}
