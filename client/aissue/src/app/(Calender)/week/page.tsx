// src/app/month/page.tsx
'use client';

import Sidebar from '@/components/(Navbar)/Sidebar/Sidebar';


export default function WeekPage() {
  

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-blue-500">주간 프로젝트 일정</h2>
          <div className="flex items-center space-x-2">
            <span className="text-gray-700">User님</span>
            <div className="bg-gray-300 w-10 h-5 rounded-full flex items-center">
              <div className="bg-white w-4 h-4 rounded-full ml-1 transition-transform"></div>
            </div>
          </div>
        </div>
 
      </div>
    </div>
  );
}
