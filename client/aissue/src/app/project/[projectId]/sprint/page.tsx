// src/app/sprint/page.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'

import Lottie from 'react-lottie-player'
import lottieJson from '@public/lottie/Animation - 1730424329200.json'

export default function SprintPage() {
  const [isSprintPage, setIsSprintPage] = useState(false)
  const [input, setInput] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleSubmit = () => {
    console.log('Question submitted:', input)
    setInput('')
  }

  if (!isSprintPage) {
    // Initial UI before switching to SprintPage
    return (
      <div className="flex min-h-screen h-screen overflow-hidden bg-gray-100 w-full">
        {/* Initial Content */}
        <div className="flex-1 p-6 flex flex-col items-center justify-center space-y-6 overflow-hidden">
          {/* Lottie Animation */}
          <div className="w-[60%] h-[50%] flex justify-center items-center">
            <Lottie
              loop
              animationData={lottieJson}
              play
              className="w-full h-full"
            />
          </div>

          {/* Text */}
          <div className="text-center text-gray-500 space-y-2">
            <p>아직 생성된 에픽이 없어요.</p>
            <p>AI 컨설턴트와 함께 전체 에픽 목록을 생성해 볼까요?</p>
          </div>
          {/* Button */}
          <button
            onClick={() => setIsSprintPage(true)}
            className="bg-purple-500 text-white px-6 py-3 rounded-lg"
          >
            에픽 생성하기
          </button>
        </div>
      </div>
    )
  }

  // SprintPage UI after clicking "에픽생성하기"
  return (
    <div className="flex min-h-screen h-screen overflow-hidden bg-gray-100">
      {/* Sidebar */}

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-hidden">
        {/* Centered Header */}
        <div className="flex justify-center mb-8">
          <h2 className="text-2xl text-gray-500 font-light text-center">
            AI와의 채팅을 통해 금주의 스프린트를 제작해 보세요{' '}
            <span role="img" aria-label="search">
              🔍
            </span>
          </h2>
        </div>

        {/* Chat Area */}
        <div className="flex items-start space-x-4 mb-6">
          <Image src="/img/chatbot.png" alt="Chatbot" width={50} height={50} />
          <div className="bg-[#B2E0D9] text-gray-700 p-3 rounded-[20px]">
            안녕하세요! 어떤 스프린트를 만들까요?
          </div>
        </div>

        {/* Suggested Questions */}
        <div className="flex space-x-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-md text-center">
            <p>추천 질문 1</p>
            <button className="bg-blue-300 text-white px-4 py-2 mt-2 rounded">
              질문하기
            </button>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md text-center">
            <p>추천 질문 2</p>
            <button className="bg-blue-300 text-white px-4 py-2 mt-2 rounded">
              질문하기
            </button>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md text-center">
            <p>추천 질문 3</p>
            <button className="bg-blue-300 text-white px-4 py-2 mt-2 rounded">
              질문하기
            </button>
          </div>
        </div>
      </div>

      {/* Input Area Fixed to Bottom, Centered, and Adjusted for Sidebar */}
      <div className="fixed bottom-[5%] left-[20rem] w-[70%] bg-white p-4 shadow-md flex items-center border-2 border-[#4D86FF] rounded-[10px]">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSubmit()
            }
          }}
          placeholder="AI에게 질문 입력하기 ..."
          className="flex-1 border-none focus:outline-none"
        />

        <button
          onClick={handleSubmit}
          className="ml-4 bg-blue-300 text-white p-3 rounded-full"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-9H9V7h2v2zm0 4H9v-2h2v2z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
