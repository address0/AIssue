// src/app/project/[projectId]/team/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getWeeklyStories } from '@/api/project';

interface Issue {
  id: string;
  title: string;
  status: 'To Do' | 'In Progress' | 'Done';
}

const WorkLogPage = () => {
  const pathname = usePathname();
  const projectId = pathname.split('/')[2];
  const [userName, setUserName] = useState<string | null>(null);
  const [categorizedIssues, setCategorizedIssues] = useState<{
    'To Do': Issue[];
    'In Progress': Issue[];
    'Done': Issue[];
  }>({
    'To Do': [],
    'In Progress': [],
    'Done': [],
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUserName(sessionStorage.getItem('memberName'));
    }
  }, []);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const stories = await getWeeklyStories(projectId);
        console.log(stories);
        
        const categorized = {
          'To Do': stories.filter((story) => story.status === 'To Do'),
          'In Progress': stories.filter((story) => story.status === 'In Progress'),
          'Done': stories.filter((story) => story.status === 'Done'),
        };
        setCategorizedIssues(categorized);
      } catch (error) {
        console.error('Failed to fetch issues:', error);
      }
    };

    fetchIssues();
  }, [projectId]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="w-4/5 p-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">{projectId} 프로젝트 스프린트 일정</h1>
          <div className="flex items-center space-x-2">
            <span className="text-gray-700">{userName}님</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {(['To Do', 'In Progress', 'Done'] as const).map((status) => {
            let headerStyle = '';
            let bgStyle = '';
            if (status === 'To Do') {
              headerStyle = 'text-[#33675F]';
              bgStyle = 'bg-[#B2E0D9]';
            } else if (status === 'In Progress') {
              headerStyle = 'text-[#F60000]';
              bgStyle = 'bg-[#FACACA]';
            } else if (status === 'Done') {
              headerStyle = 'text-[#000000]';
              bgStyle = 'bg-[#C0C0C0]';
            }

            return (
              <div key={status} className={`p-4 rounded-lg shadow-md ${bgStyle}`}>
                <h2 className={`text-xl font-semibold mb-4 text-center ${headerStyle}`}>
                  {status}
                </h2>
                <div className="space-y-4">
                  {categorizedIssues[status].map((issue) => (
                    <div
                      key={issue.id}
                      className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between"
                    >
                      <div>
                        <h3 className="font-semibold text-gray-800">{issue.title}</h3>
                        <p className="text-sm text-gray-500">{issue.id}</p>
                      </div>
                      <img src="/img/avatar.png" alt="Avatar" className="w-6 h-6" />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WorkLogPage;
