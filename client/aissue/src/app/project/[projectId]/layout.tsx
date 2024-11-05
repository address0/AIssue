'use client'

import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { getProjectList } from '@/api/project'
import { useState } from 'react'
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
  const userName = sessionStorage.getItem('memberName')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen)

  const handleProjectSelect = (selectedProjectId: string) => {
    setDropdownOpen(false)
    router.push(`/project/${selectedProjectId}/sprint`)
  }
  if (isLoading) {
    return <div>프로젝트 목록을 불러오는 중입니다.</div>
  }
  return (
    <>
      <div className="flex">
        <div className="flex flex-col p-6 gap-4 text-disabled-dark font-bold w-[20.625rem]">
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
                {dropdownOpen && (
                  <div className="absolute z-10 mt-44 w-48 bg-white rounded-md shadow-lg">
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
          <div className="flex flex-col gap-3 mb-20 text-sm">
            <button
              type="button"
              onClick={() => router.push(`/project/${projectId}/sprint`)}
              className={`p-6 rounded-xl text-left
              ${
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
              className={`p-6 rounded-xl text-left
              ${
                currentPath === 'worklog'
                  ? 'bg-[#7498e5] text-white'
                  : 'hover:bg-base-50'
              }`}
            >
              전체 업무 로그
            </button>
            <button
              type="button"
              onClick={() => router.push(`/project/${projectId}/calender`)}
              className={`p-6 rounded-xl text-left
              ${
                currentPath === 'calender'
                  ? 'bg-[#7498e5] text-white'
                  : 'hover:bg-base-50'
              }`}
            >
              프로젝트 일정
            </button>
            <button
              type="button"
              onClick={() => router.push(`/project/${projectId}/otherapi`)}
              className={`p-6 rounded-xl text-left
              ${
                currentPath === 'otherapi'
                  ? 'bg-[#7498e5] text-white'
                  : 'hover:bg-base-50'
              }`}
            >
              외부 API 연동
            </button>
            <button
              type="button"
              onClick={() => router.push(`/project/${projectId}/info`)}
              className={`p-6 rounded-xl text-left
                ${
                  currentPath === 'info'
                    ? 'bg-[#7498e5] text-white'
                    : 'hover:bg-base-50'
                }`}
            >
              프로젝트 정보
            </button>
          </div>
          <button
            onClick={() => router.push('/login')}
            className="w-full text-center text-black bg-[#EEEEEE] hover:bg-[#9EBDFF66] py-2 rounded-[20px]"
            style={{ borderRadius: '10px' }}
          >
            프로젝트 나가기
          </button>
        </div>
        <div className="w-full">{children}</div>
      </div>
    </>
  )
}
