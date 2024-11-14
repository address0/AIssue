'use client'

import { useQuery } from '@tanstack/react-query'
import { getProjectList, getProjectInfo } from '@/api/project'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

export default function ProjectPage() {
  const router = useRouter()

  const memberId =
    typeof window !== 'undefined' ? sessionStorage.getItem('memberId') : null

  const { data, isLoading } = useQuery({
    queryKey: ['projectList', memberId],
    queryFn: () => getProjectList(),
  })

  const handleProjectClick = useCallback(
    async (projectId: string) => {
      try {
        // 프로젝트 정보를 서버에서 가져오고, 반환된 데이터와 ID를 콘솔에 출력하여 확인합니다.
        const projectInfo = await getProjectInfo(projectId)
        console.log('Project ID:', projectId)
        sessionStorage.setItem('projectId', projectId)
        console.log('Project Info:', projectInfo)

        if (projectInfo && projectInfo.isCompleted) {
          // 프로젝트 정보가 존재하고 완료된 경우 info 페이지로 이동
          router.push(`/project/${projectId}/info`)
        } else {
          // 프로젝트 정보가 없거나 완료되지 않은 경우 기본 페이지로 이동
          router.push(`/project/${projectId}`)
        }
      } catch (error) {
        console.error('Failed to fetch project info:', error)
        // 에러 발생 시 기본 페이지로 이동
        router.push(`/project/${projectId}`)
      }
    },
    [router],
  )

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-white">
        프로젝트 목록을 불러오는 중입니다.
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-10 text-white">
      <p className="text-xl text-[#7498e5]">안녕하세요</p>
      <p className="text-3xl font-bold mb-8 text-[#7498e5]">
        프로젝트 목록 중 하나를 골라주세요
      </p>
      <div className="flex flex-col items-center gap-y-4">
        {data.map((project: string) => (
          <button
            key={project} // 프로젝트 ID를 key로 사용
            onClick={() => handleProjectClick(project)} // 클릭 시 해당 프로젝트로 이동
            className="px-8 py-4 rounded-lg bg-[#7498e5] font-semibold shadow-lg transition-transform duration-200 transform hover:scale-105 hover:bg-[#82e5d6]/80"
          >
            {project} {/* 프로젝트 이름을 버튼 텍스트로 표시 */}
          </button>
        ))}
      </div>
    </div>
  )
}
