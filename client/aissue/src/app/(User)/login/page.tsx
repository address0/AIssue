'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Handle login logic
    console.log('Login:', { email, password });
  };

  const handleSignup = () => {
    // Handle signup logic
    console.log('Signup clicked');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
      <div className="flex flex-col items-center mb-6">
        <div className="flex items-center space-x-2">
          <Image src="/img/chatbot.png" alt="Logo" width={60} height={60} className="mb-4" />
          <h1 className="text-2xl font-bold text-teal-600 self-center">AIssue</h1>
        </div>
        <h2 className="text-lg" style={{ color: '#9EBDFF' }}>로그인</h2>
      </div>
        
        <div className="border-b border-gray-300 mb-6 w-full"></div>
        
        <div className="mb-4">
          <input
            type="email"
            placeholder="Jira e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        
        <div className="mb-6">
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        
        <button
          onClick={handleLogin}
          className="w-full bg-blue-400 text-white py-3 rounded mb-4 hover:bg-blue-500 transition-colors"
        >
          로그인
        </button>
        
        <button
          onClick={handleSignup}
          className="w-full border border-teal-500 text-teal-600 py-3 rounded hover:bg-teal-50 transition-colors"
        >
          회원가입
        </button>
      </div>
    </div>
  );
}
