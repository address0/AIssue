// src/app/project/[projectId]/team/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface Task {
  id: string;
  title: string;
  issueCode: string;
  hours: number;
  status: 'To Do' | 'In Progress' | 'Done';
}

const tasks: Task[] = [
  { id: '1', title: 'Issue Title 1', issueCode: '#12345', hours: 4, status: 'To Do' },
  { id: '2', title: 'Issue Title 2', issueCode: '#12346', hours: 4, status: 'To Do' },
  { id: '3', title: 'Issue Title 3', issueCode: '#12347', hours: 4, status: 'In Progress' },
  { id: '4', title: 'Issue Title 4', issueCode: '#12348', hours: 4, status: 'In Progress' },
  { id: '5', title: 'Issue Title 5', issueCode: '#12349', hours: 4, status: 'Done' },
];

const WorkLogPage = () => {
  const pathname = usePathname();
  const projectId = pathname.split('/')[2];
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUserName(sessionStorage.getItem('memberName'));
    }
  }, []);

  const categorizedTasks: { 'To Do': Task[]; 'In Progress': Task[]; 'Done': Task[] } = {
    'To Do': tasks.filter((task) => task.status === 'To Do'),
    'In Progress': tasks.filter((task) => task.status === 'In Progress'),
    'Done': tasks.filter((task) => task.status === 'Done'),
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="w-4/5 p-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">팀 프로젝트 스프린트 일정</h1>
          <div className="flex items-center space-x-2">
            <span className="text-gray-700">{userName}님</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {(['To Do', 'In Progress', 'Done'] as const).map((status) => {
            // 상태별 스타일 지정
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
                  {categorizedTasks[status].map((task) => (
                    <div key={task.id} className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-800">{task.title}</h3>
                        <p className="text-sm text-gray-500">{task.issueCode} / {task.hours} hours</p>
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
