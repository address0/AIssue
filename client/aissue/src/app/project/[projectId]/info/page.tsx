// src/app/project/[projectId]/info/page.tsx

'use client';

import React from 'react';

export default function InfoPage() {
  // Assuming we have a variable `projectImage` which contains the URL of the project image
  const projectImage = null; // Replace `null` with the actual project image URL if available

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-[#5B586E]">프로젝트 정보</h1>

      <div className="flex space-x-6">
        {/* Project Overview and Details Container */}
        <div className="flex-1 space-y-6">
          {/* Project Overview Section */}
          <div className="bg-white p-6 rounded-lg shadow-md relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-[#7498E5]">프로젝트 개요</h2>
              <button className="text-white bg-[#7498E5] px-4 py-2 rounded-lg">수정</button>
            </div>
            
            {/* Project Logo and Details */}
            <div className="flex items-center mb-4 space-x-8">
              <img
                src={projectImage ? projectImage : '/img/chatbot.png'}
                alt="프로젝트 로고"
                className="w-16 h-16"
              />
              
              {/* Project Details in Vertical Layout with Consistent Divider Position */}
              <div className="grid grid-cols-[auto_auto_1fr] gap-x-4 gap-y-4">
                {/* 프로젝트명 */}
                <label className="text-gray-600 text-center font-semibold">프로젝트명</label>
                <div className="h-full border-l border-[#D9D9D9]"></div>
                <p className="text-gray-800">Alsue</p>

                {/* 주제 */}
                <label className="text-gray-600 text-center font-semibold">주제</label>
                <div className="h-full border-l border-[#D9D9D9]"></div>
                <p className="text-gray-800">AI를 사용한 JIRA 관리 자동화 프로젝트</p>

                {/* 개발 기간 */}
                <label className="text-gray-600 text-center font-semibold">개발 기간</label>
                <div className="h-full border-l border-[#D9D9D9]"></div>
                <p className="text-gray-800">2024-10-14 ~ 2024-11-19</p>

                {/* Tech Stack */}
                <label className="text-gray-600 text-center font-semibold">Tech</label>
                <div className="h-full border-l border-[#D9D9D9]"></div>
                <div className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="bg-[#54B2A3] text-white px-2 py-1 rounded-full text-xs">BE</span>
                    <p className="text-gray-800">Spring Boot, Java</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-[#7498E5] text-white px-2 py-1 rounded-full text-xs">FE</span>
                    <p className="text-gray-800">React.js, Next.js</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-[#EE5858] text-white px-2 py-1 rounded-full text-xs">UX/UI</span>
                    <p className="text-gray-800">Figma, Adobe XD</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-[#929292] text-white px-2 py-1 rounded-full text-xs">INFRA</span>
                    <p className="text-gray-800">Docker, AWS</p>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Project Details Table */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4 text-[#54B2A3]">프로젝트 상세</h2>
            <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
              <thead>
                <tr>
                  <th className="border-b border-gray-200 px-4 py-2 text-left text-gray-600">기능명</th>
                  <th className="border-b border-gray-200 px-4 py-2 text-left text-gray-600">내용</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td className="border-b border-gray-200 px-4 py-2">기능{i + 1}</td>
                    <td className="border-b border-gray-200 px-4 py-2">기능 설명 여기에 추가작업합니다</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Members Section */}
        <div className="w-1/4 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4 text-center text-[#929292]">Members</h2>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-2 bg-gray-100 rounded-lg shadow-sm">
                <img src="/img/avatar.png" alt={`User ${i + 1} Avatar`} className="w-8 h-8 rounded-full" />
                <div>
                  <p className="font-semibold text-gray-700">user{i + 1}</p>
                  <p className="text-xs text-gray-500">BE / UX/UI</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
