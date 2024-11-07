// src/app/project/[projectId]/info/page.tsx

'use client';

import React from 'react';

export default function InfoPage() {
  return (
    <div className="p-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-6 text-[#5B586E]">프로젝트 정보</h1>

      {/* 프로젝트 및 멤버 컨테이너 */}
      <div className="flex space-x-6">
        
        {/* 프로젝트 개요 및 상세 정보 컨테이너 */}
        <div className="flex-1 space-y-6">
          {/* 프로젝트 개요와 프로젝트 상세를 포함하는 div */}
          <div className="space-y-6">
            {/* 프로젝트 개요 섹션 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4 text-[#7498E5]">프로젝트 개요</h2>
              <div className="flex items-center space-x-6 mb-4">
                <img src="/img/instagram-icon.png" alt="프로젝트 로고" className="w-16 h-16" />
                <div>
                  <h2 className="text-lg font-semibold">AI를 사용한 JIRA 관리 자동화 프로젝트</h2>
                  <p className="text-gray-600">주제: Alsue</p>
                  <p className="text-gray-600">개발 기간: 2024-10-14 ~ 2024-11-19</p>
                </div>
              </div>
              <div className="flex space-x-2 mt-2">
                <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs">BE</span>
                <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs">FE</span>
                <span className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs">UX/UI</span>
                <span className="bg-gray-500 text-white px-2 py-1 rounded-full text-xs">INFRA</span>
                <span className="bg-blue-700 text-white px-2 py-1 rounded-full text-xs">Next.js</span>
                <span className="bg-pink-500 text-white px-2 py-1 rounded-full text-xs">Docker</span>
              </div>
            </div>

            {/* 프로젝트 상세 정보 테이블 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4 text-[#54B2A3]">프로젝트 상세</h2>
              <table className="min-w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border-b-2 border-gray-200 px-4 py-2 text-left text-gray-600">기능명</th>
                    <th className="border-b-2 border-gray-200 px-4 py-2 text-left text-gray-600">내용</th>
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
        </div>

        {/* 멤버 대시보드 */}
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
