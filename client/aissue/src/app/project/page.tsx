'use client'

import { useQuery } from '@tanstack/react-query'
import { getProjectList } from '@/api/project'
import Link from 'next/link'

export default function ProjectPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['projectList'],
    queryFn: () => getProjectList(),
  })

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
          <Link href={`/project/${project}/info`} key={project}>
            <p className="px-8 py-4 rounded-lg bg-[#7498e5] font-semibold shadow-lg transition-transform duration-200 transform hover:scale-105 hover:bg-[#82e5d6]/80">
              {project}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
