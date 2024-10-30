// src/app/signup/page.tsx
'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [apiToken, setApiToken] = useState('');
  const router = useRouter();

  const handleSignup = () => {
    // 회원가입 로직을 처리하거나 다음 단계로 이동
    console.log('Signup:', { email, apiToken });
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#9EBDFF' }}>
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg relative">
        {/* Back Button */}
        <button onClick={() => router.back()} className="absolute top-4 left-4 text-teal-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Logo and Title */}
        <div className="flex flex-col items-center mb-6">
          <Image src="/img/chatbot.png" alt="Logo" width={60} height={60} />
          <h1 className="text-2xl font-bold text-teal-600">AIssue</h1>
        </div>

        <h2 className="text-lg text-teal-600 text-center mb-6">회원가입</h2>

        {/* Form */}
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Jira e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-teal-400 rounded focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
          <input
            type="text"
            placeholder="Jira API Token"
            value={apiToken}
            onChange={(e) => setApiToken(e.target.value)}
            className="w-full p-3 border border-teal-400 rounded focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
          <p className="text-xs text-gray-500 text-center">
            <span className="text-blue-500 cursor-pointer">Jira API Token은 어디서 보나요?</span>
          </p>
        </div>

        {/* Signup Button */}
        <button
          onClick={handleSignup}
          className="w-full mt-6 border border-teal-500 text-teal-600 py-3 rounded hover:bg-teal-50 transition-colors"
        >
          다음
        </button>
      </div>
    </div>
  );
}
