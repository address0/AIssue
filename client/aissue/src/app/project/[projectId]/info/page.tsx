// src/app/project/[projectId]/info/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { getProjectInfo, getProjectFunctions } from '@/api/project';

interface FunctionDetail {
  title: string;
  description: string;
}

interface Member {
  name: string;
  role: string;
}

interface ProjectInfo {
  projectImage?: string;
  title: string;
  description: string;
  beSkill: string;
  feSkill: string;
  infraSkill: string;
  members: Member[];
}

export default function InfoPage({
  params,
}: {
  params: {
    projectId: string;
  };
}) {
  const { projectId } = params;
  const [projectInfo, setProjectInfo] = useState<ProjectInfo | null>(null);
  const [projectFunctions, setProjectFunctions] = useState<FunctionDetail[]>([]);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const result = await getProjectInfo(projectId);
        setProjectInfo(result);
      } catch (error) {
        console.error('Failed to fetch project info:', error);
      }
    };

    const fetchProjectFunctions = async () => {
      try {
        const functions = await getProjectFunctions(projectId);
        setProjectFunctions(functions);
      } catch (error) {
        console.error('Failed to fetch project functions:', error);
      }
    };

    fetchProjectData();
    fetchProjectFunctions();
  }, [projectId]);

  if (!projectInfo) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-[#5B586E]">프로젝트 정보</h1>

      <div className="flex space-x-6">
        <div className="flex-1 space-y-6">
          {/* 프로젝트 개요 섹션 */}
          <div className="bg-white p-6 rounded-lg shadow-md relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-[#7498E5]">프로젝트 개요</h2>
              <button className="text-white bg-[#7498E5] px-4 py-2 rounded-lg">수정</button>
            </div>

            <div className="flex items-center mb-4 space-x-8">
              <img
                src={projectInfo.projectImage || '/img/chatbot.png'}
                alt="프로젝트 로고"
                className="w-16 h-16"
              />
              <div className="grid grid-cols-[auto_auto_1fr] gap-x-4 gap-y-4">
                <label className="text-gray-600 text-center font-semibold">프로젝트명</label>
                <div className="h-full border-l border-[#D9D9D9]"></div>
                <p className="text-gray-800">{projectInfo.title}</p>

                <label className="text-gray-600 text-center font-semibold">주제</label>
                <div className="h-full border-l border-[#D9D9D9]"></div>
                <p className="text-gray-800">{projectInfo.description}</p>

                <label className="text-gray-600 text-center font-semibold">Backend Skill</label>
                <div className="h-full border-l border-[#D9D9D9]"></div>
                <p className="text-gray-800">{projectInfo.beSkill}</p>

                <label className="text-gray-600 text-center font-semibold">Frontend Skill</label>
                <div className="h-full border-l border-[#D9D9D9]"></div>
                <p className="text-gray-800">{projectInfo.feSkill}</p>

                <label className="text-gray-600 text-center font-semibold">Infra Skill</label>
                <div className="h-full border-l border-[#D9D9D9]"></div>
                <p className="text-gray-800">{projectInfo.infraSkill}</p>
              </div>
            </div>
          </div>

          {/* 프로젝트 상세 섹션 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4 text-[#54B2A3]">프로젝트 상세</h2>
            <div className="flex justify-center items-center">
            <table
                className="min-w-full border border-gray-200 rounded-lg overflow-hidden"
                key="carousel-content-table"
              >
                <thead>
                  <tr>
                    <th className="border-b border-gray-200 px-4 py-2 text-left text-gray-600">기능명</th>
                    <th className="border-b border-gray-200 px-4 py-2 text-left text-gray-600">내용</th>
                  </tr>
                </thead>
                <tbody>
                  {projectFunctions.map((func, index) => (
                    <tr key={index}>
                      <td className="border-b border-gray-200 px-4 py-2">{func.title}</td>
                      <td className="border-b border-gray-200 px-4 py-2">{func.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 멤버 섹션 */}
        <div className="w-1/4 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4 text-center text-[#929292]">Members</h2>
          <div className="space-y-4">
            {projectInfo.members.length > 0 ? (
              projectInfo.members.map((member, index) => (
                <div key={index} className="flex items-center space-x-3 p-2 bg-gray-100 rounded-lg shadow-sm">
                  <img src="/img/avatar.png" alt={`${member.name} Avatar`} className="w-8 h-8 rounded-full" />
                  <div>
                    <p className="font-semibold text-gray-700">{member.name}</p>
                    <p className="text-xs text-gray-500">{member.role || "BE / UX/UI"}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No members found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
