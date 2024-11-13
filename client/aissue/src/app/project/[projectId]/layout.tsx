// src/app/project/[projectId]/layout.tsx

'use client'

import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { getProjectList, getProjectInfo } from '@/api/project'
import { useState } from 'react'
import ChatBotModal from '@/components/(Modal)/ChatBotModal/page'
import ChatModal from '@/components/(Modal)/ChatModal/page'

interface Message {
  text: string
  isUser: boolean
}

export default function ProjectLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { data, isLoading } = useQuery({
    queryKey: ['projectList'],
    queryFn: () => getProjectList(),
  })

  const pathname = usePathname()
  const router = useRouter()
  const projectId = pathname.split('/')[2]
  const currentPath = pathname.split('/')[3]
  const accessToken =
    typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null
  const memberId =
    typeof window !== 'undefined' ? sessionStorage.getItem('memberId') : null
  const userName = sessionStorage.getItem('memberName')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isProjectChatOpen, setIsProjectChatOpen] = useState(false)

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen)
  const [chatBotMessages, setChatBotMessages] = useState<Message[]>([
    {
      text: '안녕하세요. JIRA에 관해 궁금한 게 있으면 뭐든지 물어보세요.',
      isUser: false,
    },
  ])
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen)
  }

  const toggleProjectChat = () => {
    setIsProjectChatOpen(!isProjectChatOpen)
  }

  // 프로젝트 선택 시 프로젝트 완료 여부에 따라 페이지를 이동하도록 수정
  const handleProjectSelect = async (selectedProjectId: string) => {
    setDropdownOpen(false)
    try {
      const projectInfo = await getProjectInfo(selectedProjectId) // 프로젝트 정보를 가져옴
      if (projectInfo && projectInfo.isCompleted) {
        // 프로젝트가 완료된 경우 info 페이지로 이동
        router.push(`/project/${selectedProjectId}/info`)
      } else {
        // 프로젝트가 완료되지 않은 경우 기본 페이지로 이동
        router.push(`/project/${selectedProjectId}`)
      }
    } catch (error) {
      console.error("Failed to fetch project info:", error)
      // 에러 발생 시 기본 페이지로 이동
      router.push(`/project/${selectedProjectId}`)
    }
  }

  if (isLoading) {
    return <div>프로젝트 목록을 불러오는 중입니다.</div>
  }

  return (
    <>
      {/* currentPath가 'info'일 때는 overflow-hidden을 제거 */}
      <div
        className={`flex h-screen ${
          currentPath !== 'info' ? 'overflow-hidden' : ''
        }`}
      >
        {/* Sidebar */}
        <div className="flex flex-col p-6 gap-4 text-disabled-dark font-bold w-[20.625rem] bg-white shadow-lg">
          <div className="flex flex-col py-6 gap-y-2 justify-center items-center">
            <div className="flex flex-col items-center space-y-4 mb-6">
              <Image
                src="/img/chatbot.png"
                alt="Team Project Icon"
                width={40}
                height={40}
              />
              <div className="relative flex flex-col justify-center items-center font-normal">
                <p>
                  안녕하세요, <span className="font-bold">{userName}</span>님
                </p>
                <p
                  onClick={toggleDropdown}
                  className="text-black font-semibold cursor-pointer"
                >
                  <span className="font-normal">현재 프로젝트 : </span>
                  {projectId ? `#${projectId}` : 'Project 선택'}
                </p>

                {/* Dropdown for Project Selection */}
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
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col gap-3 mb-20 text-sm">
            <button
              type="button"
              onClick={() => router.push(`/project/${projectId}/sprint`)}
              className={`p-6 rounded-xl text-center ${
                currentPath === 'sprint'
                  ? 'bg-[#7498e5] text-white'
                  : 'hover:bg-base-50'
              }`}
            >
              AI 스프린트 생성
            </button>
            <button
              type="button"
              onClick={() => router.push(`/project/${projectId}/worklog`)}
              className={`p-6 rounded-xl text-center ${
                currentPath === 'worklog'
                  ? 'bg-[#7498e5] text-white'
                  : 'hover:bg-base-50'
              }`}
            >
              전체 업무 로그
            </button>
            <button
              type="button"
              onClick={() => router.push(`/project/${projectId}/month`)}
              className={`p-6 rounded-xl text-center ${
                currentPath === 'month' || currentPath === 'week'
                  ? 'bg-[#7498e5] text-white'
                  : 'hover:bg-base-50'
              }`}
            >
              프로젝트 일정
            </button>
            <button
              type="button"
              onClick={() => router.push(`/project/${projectId}/summary`)}
              className={`p-6 rounded-xl text-center
              ${
                currentPath === 'summary'
                  ? 'bg-[#7498e5] text-white'
                  : 'hover:bg-base-50'
              }`}
            >
              채팅 회고록
            </button>
            <button
              type="button"
              onClick={() => router.push(`/project/${projectId}/info`)}
              className={`p-6 rounded-xl text-center ${
                currentPath === 'info'
                  ? 'bg-[#7498e5] text-white'
                  : 'hover:bg-base-50'
              }`}
            >
              프로젝트 정보
            </button>
          </div>

          {/* Logout Button */}
          <button
            onClick={() => router.push('/login')}
            className="w-full text-center text-black bg-[#EEEEEE] hover:bg-[#9EBDFF66] py-2 rounded-[20px]"
            style={{ borderRadius: '10px' }}
          >
            프로젝트 나가기
          </button>
        </div>

        {/* Main Content */}
        <div className="w-full overflow-y-auto">{children}</div>

        {/* ChatBot Modal Trigger */}
        <button
          onClick={toggleChat}
          className="fixed bottom-8 right-24 rounded-full object-fill flex items-center justify-center shadow-lg"
        >
          <Image
            src="/img/chatbot.png"
            alt="Team Project Icon"
            width={50}
            height={50}
          />
        </button>

        <button
          onClick={toggleProjectChat}
          className="fixed bottom-8 right-8 w-12 h-12 rounded-full bg-[#54B2A3] flex items-center justify-center shadow-lg"
        >
          <Image
            src="/img/chaticongreen.png"
            alt="Chat Icon"
            width={24}
            height={24}
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
