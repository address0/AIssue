
'use client';

import { useState } from 'react';

import Sidebar from '@/components/(Navbar)/Sidebar/Sidebar';

export default function MonthPage() {


  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl text-gray-500 font-light">
            월간달력
          </h2>
        
        </div>

      


      </div>
    </div>
  );
}
