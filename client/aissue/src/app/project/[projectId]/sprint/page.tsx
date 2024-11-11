// src/app/sprint/page.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Lottie from 'react-lottie-player'
import NoEpic from '@public/lottie/Animation - 1730424329200.json'
import LoadingImg from '@public/lottie/Animation - 1731310411267.json'

interface IssueData {
  pk: string,
  summary: string,
  description: string,
  issuetype: string,
  priority: null | string,
  parent: string,
  issuelink: null | string,
  storyPoint: null | string,
  manager: null | string
}

export default function SprintPage() {
  const [isSprintPage, setIsSprintPage] = useState(false)
  const [messages, setMessages] = useState<{ user: string; bot: string }[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement | null>(null)
  const [parsedData, setParsedData] = useState<IssueData[]>([])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleSubmit = async () => {
    if (!input) {
      window.alert('정확한 값을 입력해 주세요!')
      return
    }

    const userMessage = input
    setMessages((prev) => [...prev, { user: userMessage, bot: '' }])
    setInput('')
    setLoading(true)

    const response = await fetch('/project/[projectId]/sprint/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage }),
    })

    const data = await response.json()
    if (response.ok) {
      const resultMatch = data?.response?.match(/result:\s*(\[[\s\S]*?\])\s*}/);

      if (resultMatch) {
        console.log("response: TEXT")
        let jsonString = resultMatch[1];
        jsonString = jsonString.replace(/(\w+):/g, '"$1":')
        try {
          setParsedData(JSON.parse(jsonString))
        } catch (error) {
          console.error("JSON parsing failed:", error);
        }
      } else {
        try {
          console.log("response: JSON")
          const jsonData = JSON.parse(data?.response)
          setParsedData(jsonData?.result);
        } catch (error) {
          console.log("JSON 부분을 찾을 수 없습니다.");
        }
      }
      setMessages((prev) => {
        const newMessages = [...prev]
        newMessages[newMessages.length - 1].bot = data?.response
        return newMessages
      })
    } else {
      console.error(data.error)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef?.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  useEffect(() => {
    console.log(parsedData)
  },[parsedData])

  if (!isSprintPage) {
    return (
      <div className="flex min-h-screen h-screen overflow-hidden bg-gray-100 w-full">
        <div className="flex-1 p-6 flex flex-col items-center justify-center space-y-6 overflow-hidden">
          <div className="w-[60%] h-[50%] flex justify-center items-center">
            <Lottie
              loop
              animationData={NoEpic}
              play
              className="w-full h-full"
            />
          </div>
          <div className="text-center text-gray-500 space-y-2">
            <p>아직 생성된 에픽이 없어요.</p>
            <p>AI 컨설턴트와 함께 전체 에픽 목록을 생성해 볼까요?</p>
          </div>
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

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <div className="flex-1 p-6 overflow-hidden">
        <div className="flex justify-center mb-8">
          <h2 className="text-2xl text-gray-500 font-light text-center">
            AI와의 채팅을 통해 금주의 스프린트를 제작해 보세요{' '}
            <span role="img" aria-label="search">🔍</span>
          </h2>
        </div>

        {/* Chat Area */}
        <div className="flex flex-col space-y-4 mb-6 overflow-y-auto h-[70vh] w-[90%]">
          <div className="flex items-start space-x-4">
            <Image src="/img/chatbot.png" alt="Chatbot" width={50} height={50} />
            <div className="bg-[#B2E0D9] text-gray-700 p-4 rounded-[0px_20px_20px_20px]">
              <p>안녕하세요! 저는 에픽/이슈 생성을 도와주는 AI컨설턴트, AIssue입니다.</p>
              <p>스프린트 생성에 앞서, 전체 일정(에픽 목록) 생성을 도와 드리겠습니다.</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <Image src="/img/chatbot.png" alt="Chatbot" width={50} height={50} />
            <div className="bg-[#B2E0D9] text-gray-700 p-4 rounded-[0px_20px_20px_20px]">
              <p>먼저, 프로젝트의 이름(title)을 알려 주세요!</p>
            </div>
          </div>

          {/* User Messages and Bot Responses */}
          {messages?.map((msg, index) => (
            <div key={index} className="flex flex-col space-y-2">
              <div className="self-end max-w-xs p-3 bg-blue-300 text-gray-700 rounded-[20px_0px_20px_20px]">
                {msg?.user}
              </div>
              {msg?.bot && (
                <div className='flex items-start space-x-4'>
                  <Image src="/img/chatbot.png" alt="Chatbot" width={50} height={50} />
                  <div className='flex flex-col'>
                    <div className="self-start max-w-xs p-3 bg-[#B2E0D9] text-gray-700 rounded-[0px_20px_20px_20px]">
                      {parsedData?.length > 0 ? '생성된 이슈는 다음과 같습니다.' : msg?.bot}
                    </div>
                    {parsedData?.length > 0 && parsedData?.map((item, index) => (
                      <li className='text-lg text-gray-700 list-none' key={index}>{item?.summary}</li>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-start space-x-4">
              <Image src="/img/chatbot.png" alt="Chatbot" width={50} height={50} />
              <Lottie
                loop
                animationData={LoadingImg}
                play
                className="w-32"
              />
              <p className='text-gray-700'>Loading ...</p>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area Fixed to Bottom */}
        <div className="fixed bottom-5 left-[20rem] w-[70%] bg-white p-4 shadow-md flex items-center border-2 border-[#4D86FF] rounded-[10px]">
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
    </div>
  )
}