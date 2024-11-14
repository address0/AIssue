// src/app/project/[projectId]/info/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { getProjectInfo, getProjectFunctions, createProject, updateProjectFunctions } from '@/api/project';

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [projectFunctions, setProjectFunctions] = useState<FunctionDetail[]>([]);

  const [isFunctionEditMode, setIsFunctionEditMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedProjectInfo, setEditedProjectInfo] = useState<ProjectInfo | null>(null);
  const [editedFunctions, setEditedFunctions] = useState<FunctionDetail[]>([]);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const result = await getProjectInfo(projectId);
        setProjectInfo(result);
        setEditedProjectInfo(result); // 수정 가능한 데이터 초기화
      } catch (error) {
        console.error('Failed to fetch project info:', error);
      }
    };

    const fetchProjectFunctions = async () => {
      try {
        const functions = await getProjectFunctions(projectId);
        setProjectFunctions(functions);
        setEditedFunctions(functions); // 수정 가능한 함수 초기화
      } catch (error) {
        console.error('Failed to fetch project functions:', error);
      }
    };

    fetchProjectData();
    fetchProjectFunctions();
  }, [projectId]);

  const handleEditClick = async () => {
    if (isEditMode && editedProjectInfo) {
      try {
        // projectData 객체 생성 및 createProject 호출
        const projectData = {
          jiraId: projectId,
          name: editedProjectInfo.title,
          description: editedProjectInfo.description,
          // startDate: '2023-01-01', // 여기에 실제 시작일 데이터를 넣어야 함
          // endDate: '2023-12-31',   // 여기에 실제 종료일 데이터를 넣어야 함
          // techStack: 'JavaScript, React',
          feSkill: editedProjectInfo.feSkill,
          beSkill: editedProjectInfo.beSkill,
          infraSkill: editedProjectInfo.infraSkill,
          // projectImagePath: editedProjectInfo.projectImage || '', // 이미지 경로 지정
          deleteImage: false,
        };

        await createProject(projectData);
        setIsEditMode(false); // 저장 후 편집 모드 종료
        console.log('Project saved successfully');
        // window.location.reload()
        const updatedProjectInfo = await getProjectInfo(projectId);
        setProjectInfo(updatedProjectInfo);
      } catch (error) {
        console.error('Failed to save project:', error);
      }
    } else {
      setIsEditMode(true); // 편집 모드 시작
    }
  };

  const handleFunctionEditClick = async () => {
    if (isFunctionEditMode) {
      try {
        // title 또는 description이 비어 있지 않은 항목만 필터링
        const filteredFunctions = editedFunctions.filter(
          (func) => func.title.trim() !== '' || func.description.trim() !== ''
        );
  
        // 수정된 기능 목록을 updateProjectFunctions 함수로 전송
        await updateProjectFunctions(projectId, filteredFunctions);
        setProjectFunctions(filteredFunctions); // 화면에 업데이트된 목록 반영
        console.log('Project functions updated successfully');
      } catch (error) {
        console.error('Failed to update project functions:', error);
      }
    }
    setIsFunctionEditMode(!isFunctionEditMode); // 수정 모드 전환
  };



  const handleInputChange = (field: keyof ProjectInfo, value: string) => {
    if (editedProjectInfo) {
      setEditedProjectInfo({
        ...editedProjectInfo,
        [field]: value,
      });
    }
  };

  const handleFunctionChange = (index: number, field: keyof FunctionDetail, value: string) => {
    const updatedFunctions = [...editedFunctions];
    updatedFunctions[index] = {
      ...updatedFunctions[index],
      [field]: value,
    };
    setEditedFunctions(updatedFunctions);
  };

    // + 버튼을 눌러 새로운 기능 항목 추가
    const handleAddFunction = () => {
      setEditedFunctions([...editedFunctions, { title: '', description: '' }]);
    };

  if (!projectInfo || !editedProjectInfo) {
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
              <button onClick={handleEditClick} className="text-white bg-[#7498E5] px-4 py-2 rounded-lg">
                {isEditMode ? '저장' : '수정'}
              </button>
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
                {isEditMode ? (
                  <input
                    className="border border-gray-300 rounded p-1"
                    value={editedProjectInfo.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                  />
                ) : (
                  <p className="text-gray-800">{projectInfo.title}</p>
                )}

                <label className="text-gray-600 text-center font-semibold">주제</label>
                <div className="h-full border-l border-[#D9D9D9]"></div>
                {isEditMode ? (
                  <input
                    className="border border-gray-300 rounded p-1"
                    value={editedProjectInfo.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                  />
                ) : (
                  <p className="text-gray-800">{projectInfo.description}</p>
                )}

                <label className="text-gray-600 text-center font-semibold">Backend Skill</label>
                <div className="h-full border-l border-[#D9D9D9]"></div>
                {isEditMode ? (
                  <input
                    className="border border-gray-300 rounded p-1"
                    value={editedProjectInfo.beSkill}
                    onChange={(e) => handleInputChange('beSkill', e.target.value)}
                  />
                ) : (
                  <p className="text-gray-800">{projectInfo.beSkill}</p>
                )}

                <label className="text-gray-600 text-center font-semibold">Frontend Skill</label>
                <div className="h-full border-l border-[#D9D9D9]"></div>
                {isEditMode ? (
                  <input
                    className="border border-gray-300 rounded p-1"
                    value={editedProjectInfo.feSkill}
                    onChange={(e) => handleInputChange('feSkill', e.target.value)}
                  />
                ) : (
                  <p className="text-gray-800">{projectInfo.feSkill}</p>
                )}

                <label className="text-gray-600 text-center font-semibold">Infra Skill</label>
                <div className="h-full border-l border-[#D9D9D9]"></div>
                {isEditMode ? (
                  <input
                    className="border border-gray-300 rounded p-1"
                    value={editedProjectInfo.infraSkill}
                    onChange={(e) => handleInputChange('infraSkill', e.target.value)}
                  />
                ) : (
                  <p className="text-gray-800">{projectInfo.infraSkill}</p>
                )}
              </div>
            </div>
          </div>


          {/* 프로젝트 상세 섹션 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-[#54B2A3]">프로젝트 상세</h2>
              <button onClick={handleFunctionEditClick} className="text-white bg-[#54B2A3] px-4 py-2 rounded-lg">
                {isFunctionEditMode ? '저장' : '수정'}
              </button>
            </div>
            <div className="flex justify-center items-center">
              <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                <thead>
                  <tr>
                    <th className="border-b border-gray-200 px-4 py-2 text-left text-gray-600 w-1/3">기능명</th>
                    <th className="border-b border-gray-200 px-4 py-2 text-left text-gray-600 w-2/3">내용</th>
                  </tr>
                </thead>
                <tbody>
                  {editedFunctions.map((func, index) => (
                    <tr key={index}>
                      <td className="border-b border-gray-200 px-4 py-2 w-1/3">
                        {isFunctionEditMode ? (
                          <input
                            className="border border-gray-300 rounded p-1 w-full"
                            value={func.title}
                            onChange={(e) => handleFunctionChange(index, 'title', e.target.value)}
                          />
                        ) : (
                          func.title
                        )}
                      </td>
                      <td className="border-b border-gray-200 px-4 py-2 w-2/3">
                        {isFunctionEditMode ? (
                          <input
                            className="border border-gray-300 rounded p-1 w-full"
                            value={func.description}
                            onChange={(e) => handleFunctionChange(index, 'description', e.target.value)}
                          />
                        ) : (
                          func.description
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-center">
              {isFunctionEditMode && (
                <button
                  onClick={handleAddFunction}
                  className="mt-3 text-white bg-[#54B2A3] px-4 py-2 rounded-lg"
                >
                  + 
                </button>
              )}
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
