'use client';

import { useQuery } from '@tanstack/react-query';
import { getProjectList, getProjectInfo } from '@/api/project';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export default function ProjectPage() {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ['projectList'],
    queryFn: () => getProjectList(),
  });

  const handleProjectClick = useCallback(
    async (projectId: string) => {
      try {
        const projectInfo = await getProjectInfo(projectId); // 요청해서 프로젝트 정보를 받아옴
        if (projectInfo.isCompleted) {
          router.push(`/project/${projectId}/info`); // 완료된 경우 info 페이지로 이동
        } else {
          router.push(`/project/${projectId}`); // 완료되지 않은 경우 기본 페이지로 이동
        }
      } catch (error) {
        console.error("Failed to fetch project info:", error);
      }
    },
    [router]
  );
  

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-white">
        프로젝트 목록을 불러오는 중입니다.
      </div>
    );
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
            key={project}
            onClick={() => handleProjectClick(project)}
            className="px-8 py-4 rounded-lg bg-[#7498e5] font-semibold shadow-lg transition-transform duration-200 transform hover:scale-105 hover:bg-[#82e5d6]/80"
          >
            {project}
          </button>
        ))}
      </div>
    </div>
  );
}
