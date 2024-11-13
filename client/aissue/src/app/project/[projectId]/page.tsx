// src/app/project/[projectId]/projectDetailPage.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProject } from '@/api/project';
import Image from 'next/image';

interface TechStack {
  beSkill: string[];
  feSkill: string[];
  infraSkill: string[];
  etc: string[];
}

export default function ProjectDetailPage({
  params,
}: {
  params: {
    projectId: string;
  };
}) {
  const { projectId } = params;
  const router = useRouter(); // useRouter 훅 사용

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newTech, setNewTech] = useState('');
  const [techStack, setTechStack] = useState<TechStack>({
    beSkill: [],
    feSkill: [],
    infraSkill: [],
    etc: [],
  });
  const [isButtonActive, setIsButtonActive] = useState(false);
  const [projectImage, setProjectImage] = useState<File | null>(null);
  const [step, setStep] = useState(1); // 현재 단계 추적

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    checkButtonState(newName, description);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newDescription = e.target.value;
    setDescription(newDescription);
    checkButtonState(name, newDescription);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setProjectImage(file);
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setStartDate(e.target.value);
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setEndDate(e.target.value);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  const handleNewTechChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTech(e.target.value);
  };

  const addTechStack = () => {
    if (selectedCategory && newTech) {
      setTechStack((prevStack) => {
        const updatedStack = { ...prevStack };
        if (selectedCategory === 'Backend') {
          updatedStack.beSkill = [...updatedStack.beSkill, newTech];
        } else if (selectedCategory === 'Frontend') {
          updatedStack.feSkill = [...updatedStack.feSkill, newTech];
        } else if (selectedCategory === 'Infra') {
          updatedStack.infraSkill = [...updatedStack.infraSkill, newTech];
        } else if (selectedCategory === 'Etc') {
          updatedStack.etc = [...updatedStack.etc, newTech];
        }
        return updatedStack;
      });
      setNewTech('');
    }
  };

  const checkButtonState = (name: string, description: string) => {
    setIsButtonActive(Boolean(name && description));
  };

  const handleNextStep = () => {
    if (step === 1 && isButtonActive) {
      setStep(2); // 첫 번째 단계 완료 후 다음 단계로 이동
    } else if (step === 2) {
      submitProject(); // 최종 제출
    }
  };

  const submitProject = async () => {
    try {
      await createProject({
        jiraId: projectId,
        name,
        description,
        startDate,
        endDate,
        techStack: techStack.etc.join(', '), // "Etc"는 techStack으로 전달
        feSkill: techStack.feSkill.join(', '),
        beSkill: techStack.beSkill.join(', '),
        infraSkill: techStack.infraSkill.join(', '),
        projectImagePath: projectImage || '',
        deleteImage: false,
      });
      alert('프로젝트가 성공적으로 생성되었습니다.');
      router.push(`/project/${projectId}/info`); // 프로젝트 생성 후 페이지 이동
    } catch (error) {
      console.error('프로젝트 생성 중 오류 발생:', error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-10 rounded-lg shadow-md w-full max-w-lg">
        {step === 1 ? (
          <>
            {/* 첫 번째 단계: 프로젝트명, 주제, 이미지 입력 */}
            <div className="flex flex-col items-center text-center mb-6">
              <Image src="/img/chatbot.png" alt="Chatbot Icon" width={50} height={50} />
              <p className="text-[#54B2A3] font-semibold mt-2">
                안녕하세요, JIRA Sprint 관리 서비스 AIssue입니다. 프로젝트 관리에 앞서, 정보를 입력해 주세요.
              </p>
            </div>
            <div className="flex space-x-6">
              {/* 프로젝트 이미지 업로드 */}
              <div className="bg-[#D9D9D9] p-6 rounded-lg text-center relative flex justify-center items-center">
                <label htmlFor="file-input" className="cursor-pointer block">
                  <Image src='/img/camera.png' alt="Upload Project" width={50} height={50} className="mx-auto" />
                </label>
                <input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {projectImage && (
                  <button
                    onClick={() => setProjectImage(null)}
                    className="absolute top-2 right-2 text-red-500 border border-red-500 px-2 py-1 rounded-lg text-xs"
                  >
                    사진 삭제
                  </button>
                )}
              </div>
              {/* 프로젝트명 및 주제 입력 */}
              <div className="flex-1" id="project">
                <label className="block text-[#54B2A3] font-semibold mb-2">프로젝트명</label>
                <input
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  placeholder="프로젝트명 입력"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#54B2A3]"
                />
                <label className="block text-[#54B2A3] font-semibold mt-4 mb-2">주제</label>
                <textarea
                  value={description}
                  onChange={handleDescriptionChange}
                  placeholder="프로젝트 주제 입력"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#54B2A3] resize-none"
                  rows={4}
                />
              </div>
            </div>
          </>
        ) : (
          <>
            {/* 두 번째 단계: 개발 일정 및 기술 스택 입력 */}
            <div className="flex flex-col items-center text-center mb-6">
              <Image src="/img/chatbot.png" alt="Chatbot Icon" width={50} height={50} />
              <p className="text-[#54B2A3] font-semibold mt-2">
                감사합니다. 다음으로, 개발 일정과 포지션 별 기술 스택을 입력해 주세요.
              </p>
            </div>
            <div>
              <label className="block text-[#54B2A3] font-semibold mb-2">개발 일정</label>
              <input
                type="date"
                value={startDate}
                onChange={handleStartDateChange}
                placeholder="개발 시작일 입력"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#54B2A3] mb-4"
              />
              <input
                type="date"
                value={endDate}
                onChange={handleEndDateChange}
                placeholder="개발 종료일 입력"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#54B2A3]"
              />
            </div>
            <div className="mt-4">
              <label className="block text-[#54B2A3] font-semibold mb-2">기술 스택</label>
              <div className="flex items-center space-x-2 mb-4">
                <select
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-[#54B2A3]"
                >
                  <option value="">포지션 선택</option>
                  {['Backend', 'Frontend', 'Infra', 'Etc'].map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={newTech}
                  onChange={handleNewTechChange}
                  placeholder="프레임워크 및 개발 도구 입력"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#54B2A3]"
                />
                <button onClick={addTechStack} className="ml-2">
                  <Image src="/img/plusstackbtn.png" alt="Add Tech Stack" width={24} height={24} />
                </button>
              </div>
              <div className="mt-4">
                {Object.entries(techStack).map(([position, techs]) => (
                  <div key={position} className="mb-2">
                    <p className="text-[#54B2A3] font-semibold mb-1">{position}</p>
                    {techs.map((tech: string, i: number) => (
                      <p key={i} className="text-gray-700 text-sm border-b border-gray-300 pb-1 mb-1">
                        {tech}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <button
          onClick={handleNextStep}
          className={`w-full mt-6 py-2 rounded-lg text-white font-semibold transition-colors ${
            isButtonActive ? 'bg-[#54B2A3] hover:bg-[#449F92]' : 'bg-[#D9D9D9] cursor-not-allowed'
          }`}
          disabled={!isButtonActive && step === 1}
        >
          {step === 1 ? '다음 단계' : '프로젝트 생성'}
        </button>
      </div>
    </div>
  );
}
