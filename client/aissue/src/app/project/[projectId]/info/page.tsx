'use client';

import React, { useState, useEffect } from 'react';
import { getProjectInfo, getProjectFunctions, createProject, updateProjectFunctions } from '@/api/project';

interface FunctionDetail {
  title: string;
  description: string;
}

interface ProjectInfo {
  projectImage?: string;
  title: string;
  description: string;
  beSkill: string;
  feSkill: string;
  infraSkill: string;
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
  const [isFunctionEditMode, setIsFunctionEditMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedProjectInfo, setEditedProjectInfo] = useState<ProjectInfo | null>(null);
  const [editedFunctions, setEditedFunctions] = useState<FunctionDetail[]>([]);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const result = await getProjectInfo(projectId);
        setProjectInfo(result);
        setEditedProjectInfo(result);
      } catch (error) {
        console.error('Failed to fetch project info:', error);
      }
    };

    const fetchProjectFunctions = async () => {
      try {
        const functions = await getProjectFunctions(projectId);
        setEditedFunctions(functions);
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
        const projectData = {
          jiraId: projectId,
          name: editedProjectInfo.title,
          description: editedProjectInfo.description,
          feSkill: editedProjectInfo.feSkill,
          beSkill: editedProjectInfo.beSkill,
          infraSkill: editedProjectInfo.infraSkill,
          deleteImage: false,
        };

        await createProject(projectData);
        setIsEditMode(false);
        const updatedProjectInfo = await getProjectInfo(projectId);
        setProjectInfo(updatedProjectInfo);
      } catch (error) {
        console.error('Failed to save project:', error);
      }
    } else {
      setIsEditMode(true);
    }
  };

  const handleFunctionEditClick = async () => {
    if (isFunctionEditMode) {
      try {
        const filteredFunctions = editedFunctions.filter(
          (func) => func.title.trim() !== '' || func.description.trim() !== ''
        );
        await updateProjectFunctions(projectId, filteredFunctions);
        setEditedFunctions(filteredFunctions);
      } catch (error) {
        console.error('Failed to update project functions:', error);
      }
    }
    setIsFunctionEditMode(!isFunctionEditMode);
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

  const handleAddFunction = () => {
    setEditedFunctions([...editedFunctions, { title: '', description: '' }]);
  };

  if (!projectInfo || !editedProjectInfo) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-[#5B586E]">프로젝트 정보</h1>

      <div className="flex flex-col lg:flex-row lg:space-x-6">
        <div className="flex-1 space-y-4 md:space-y-6">
          {/* 프로젝트 개요 섹션 */}
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-[#7498E5]">프로젝트 개요</h2>
              <button
                onClick={handleEditClick}
                className="text-white bg-[#7498E5] px-3 py-2 md:px-4 md:py-2 rounded-lg"
              >
                {isEditMode ? '저장' : '수정'}
              </button>
            </div>

            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
              <img
                src={projectInfo.projectImage || '/img/chatbot.png'}
                alt="프로젝트 로고"
                className="w-16 h-16"
              />
              <div className="grid grid-cols-1 md:grid-cols-[auto_auto_1fr] gap-x-4 gap-y-4 w-full">
                {(['title', 'description', 'beSkill', 'feSkill', 'infraSkill'] as const).map(
                  (field, idx) => (
                    <React.Fragment key={idx}>
                      <label className="text-[#7498E5] text-left md:text-center font-semibold">
                        {field === 'title'
                          ? '프로젝트명'
                          : field === 'description'
                          ? '주제'
                          : `${field.split('Skill')[0]} Skill`}
                      </label>
                      <div className="hidden md:block h-full border-l border-[#D9D9D9]"></div>
                      {isEditMode ? (
                        <input
                          className="border border-gray-300 rounded p-2 w-full"
                          value={editedProjectInfo[field] || ''}
                          onChange={(e) =>
                            handleInputChange(field, e.target.value)
                          }
                        />
                      ) : (
                        <p className="text-gray-800">{projectInfo[field]}</p>
                      )}
                    </React.Fragment>
                  )
                )}
              </div>
            </div>
          </div>

          {/* 프로젝트 상세 섹션 */}
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-[#54B2A3]">프로젝트 상세</h2>
              <button
                onClick={handleFunctionEditClick}
                className="text-white bg-[#54B2A3] px-3 py-2 md:px-4 md:py-2 rounded-lg"
              >
                {isFunctionEditMode ? '저장' : '수정'}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg">
                <thead>
                  <tr>
                    <th className="border-b px-4 py-2 text-left text-gray-600 w-1/3">기능명</th>
                    <th className="border-b px-4 py-2 text-left text-gray-600 w-2/3">내용</th>
                  </tr>
                </thead>
                <tbody>
                  {editedFunctions.map((func, index) => (
                    <tr key={index}>
                      <td className="border-b px-4 py-2">
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
                      <td className="border-b px-4 py-2">
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
            {isFunctionEditMode && (
              <div className="flex justify-center mt-3">
                <button
                  onClick={handleAddFunction}
                  className="text-white bg-[#54B2A3] px-3 py-2 rounded-lg"
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
