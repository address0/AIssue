// src/app/sprint/page.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Sidebar from '@/components/(Navbar)/Sidebar/Sidebar';

export default function SprintPage() {
  const [input, setInput] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = () => {
    console.log('Question submitted:', input);
    setInput('');
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl text-gray-500 font-light">
            AI와의 채팅을 통해 금주의 스프린트를 제작해 보세요 <span role="img" aria-label="search">🔍</span>
          </h2>
        
        </div>

      


        {/* Input Area */}
        <div className="flex items-center bg-white p-4 rounded-lg shadow-md">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="AI에게 질문 입력하기 ..."
            className="flex-1 border-none focus:outline-none"
          />
          <button onClick={handleSubmit} className="ml-4 bg-blue-300 text-white p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-9H9V7h2v2zm0 4H9v-2h2v2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
