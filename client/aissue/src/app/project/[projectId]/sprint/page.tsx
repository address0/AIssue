// src/app/sprint/page.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Lottie from 'react-lottie-player'
import NoEpic from '@public/lottie/Animation - 1730424329200.json'
import LoadingImg from '@public/lottie/Animation - 1731310411267.json'
import FindEpicImg from '@public/lottie/Animation - 1731658876737.json'
import EpicModal from '@/components/(Modal)/EpicModal/page'
import { getEpics } from '@/api/issue'

export interface IssueData {
  pk: string,
  summary: string,
  description: string,
  issuetype: string,
  priority: null | string,
  parent: null | string,
  issuelink: null | string,
  storyPoint: null | string,
  manager: null | string
}

interface SprintData {
  type: string
  message: string
}

export default function SprintPage({
  params,
}: {
  params: {
    projectId: string;
  };
}) {
  const { projectId } = params;
  const [isSprintPage, setIsSprintPage] = useState<boolean>(false)
  const [isFindEpic, setIsFindEpic] = useState<boolean>(true)
  const [messages, setMessages] = useState<{ user: string; bot: string }[]>([])
  const [input, setInput] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement | null>(null)
  const [parsedData, setParsedData] = useState<IssueData[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0)
  const [showEpicModal, setShowEpicModal] = useState<boolean>(false)
  const [animate, setAnimate] = useState<boolean>(false);
  const [initialMessageSent, setInitialMessageSent] = useState<boolean>(false);
  const [inputList, setInputList] = useState<SprintData[]>([])

  const questions = [
    '이번 주차의 에픽 목록은 다음과 같습니다. 추가로 작업할 기능이 있다면 알려 주세요.',
    '다음으로, 아직 끝내지 못한 작업이 있다면 알려 주세요.',
    '마지막으로, 수정해야 할 버그 목록이 있다면 알려 주세요.',
    '감사합니다. 이번 주차의 스프린트와 스토리 목록을 생성하겠습니다!'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleSubmit = () => {
    if (!input) {
      window.alert('정확한 값을 입력해 주세요!')
      return
    }

    const userMessage = input
    setMessages((prev) => [...prev, { user: userMessage, bot: '' }])
    setInputList((prev) => [...prev, {type: 'user', message: userMessage}])
    setInput('')

    setTimeout(() => {
      const botMessage = questions[currentQuestionIndex];
      setMessages((prev) => [...prev, { user: '', bot: botMessage }]);
      setCurrentQuestionIndex(prev => prev + 1);
      setAnimate(true);
      if (currentQuestionIndex === questions.length - 1) {
        handleCreateIssue();
      }
    }, 1000)
  }

  const handleCreateIssue = async () => {
    setLoading(true)

    const response = await fetch('/project/[projectId]/sprint/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: "AIssue라는 이름의 JIRA 이슈 및 스프린트 자동 생성 애플리케이션을 만들 거야. 적절한 에픽을 8개 생성해 줘." }),
    })

    const data = await response.json()
    
    if (response.ok) {
      const resultMatch = data?.response?.match(/result:\s*(\[[\s\S]*?\])\s*}/);

      if (resultMatch) {
        let jsonString = resultMatch[1];
        jsonString = jsonString.replace(/(\w+):/g, '"$1":')
        try {
          setParsedData(JSON.parse(jsonString))
        } catch (error) {
          console.error("JSON parsing failed:", error);
        }
      } else {
        try {
          const jsonData = JSON.parse(data?.response)
          setParsedData(jsonData?.result);
        } catch (error) {
          console.log("JSON 부분을 찾을 수 없습니다.");
          console.log(error)
        }
      }
    } else {
      console.error(data.error)
    }
    setLoading(false)
  }

  const handleEpicModal = () => {
    setShowEpicModal(!showEpicModal)
  }

  useEffect(() => {
    getEpics(projectId)
    .then((data) => {
      if (data?.length > 0) {
        setIsSprintPage(true)
      }
      setIsFindEpic(false)
    })
    .catch((error) => {
      console.log(error)
      setIsFindEpic(false)
    })
  }, [])

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages])

  useEffect(() => {
    console.log(parsedData)
  },[parsedData])

  useEffect(() => {
    if (initialMessageSent) {
      const timer = setTimeout(() => {
      if (currentQuestionIndex < questions.length) {
          const botMessage = questions[currentQuestionIndex];
          setMessages((prev) => [...prev, { user: '', bot: botMessage }]);
          setCurrentQuestionIndex(prev => prev + 1);
          setAnimate(true);
      }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [initialMessageSent]);

  useEffect(() => {
    if (messages.length === 0) {
        setInitialMessageSent(true);
      }
  }, [messages]);

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => setAnimate(false), 500); // 애니메이션이 끝난 후 상태 초기화
      return () => clearTimeout(timer);
    }
  }, [animate])

  if (isFindEpic) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen h-screen overflow-hidden bg-gray-100 w-full">
        <Lottie
          loop
          animationData={FindEpicImg}
          play
          className="w-2/3 h-2/3"
        />
        <p className='text-xl text-gray-600'>프로젝트 에픽 조회 중...</p>
      </div>
    )
  }

  else if (!isSprintPage) {
    return (
      <div className="flex min-h-screen h-screen overflow-hidden bg-gray-100 w-full">
        <div className="flex-1 p-6 flex flex-col items-center justify-center overflow-hidden">
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
            onClick={() => setShowEpicModal(true)}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg"
          >
            에픽 생성하기
          </button>
          <button
            onClick={() => setIsSprintPage(true)}
            className="bg-purple-500 text-white px-6 py-3 rounded-lg"
          >
            스프린트 생성하기
          </button>
          {showEpicModal && (
            <EpicModal isOpen={showEpicModal} onClose={handleEpicModal} projectId={projectId} />
          )}
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
        <div className="flex flex-col space-y-4 mb-6 overflow-y-auto h-[70vh] w-[90%] animate-fadeIn">
          <div className="flex items-start space-x-4">
            <Image src="/img/chatbot.png" alt="Chatbot" width={50} height={50} />
            <div className="bg-[#B2E0D9] text-gray-700 p-4 rounded-[0px_20px_20px_20px]">
              <p>안녕하세요! 저는 에픽/이슈 생성을 도와주는 AI컨설턴트, AIssue입니다.</p>
              <p>프로젝트의 작업 내용 및 일정에 맞춰, 이번 주 스프린트를 제작하겠습니다.</p>
            </div>
          </div>

          {/* User Messages and Bot Responses */}
          {messages?.map((msg, index) => (
            <div key={index} className="flex flex-col space-y-2 animate-fadeIn">
              {msg.user && (
                <div className="self-end max-w-xs p-3 bg-blue-300 text-gray-700 rounded-[20px_0px_20px_20px]">
                  {msg?.user}
                </div>
              )}
              {msg.bot && (
                <div className='flex items-start space-x-4 animate-fadeIn'>
                  <Image src="/img/chatbot.png" alt="Chatbot" width={50} height={50} />
                  <div className="self-start max-w-xs p-3 bg-[#B2E0D9] text-gray-700 rounded-[0px_20px_20px_20px]">
                    {msg?.bot}
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
          {parsedData?.length > 0 && (
            <div className="mt-4 p-4 bg-white rounded shadow">
              <h3 className="text-lg">생성된 이슈 목록:</h3>
              <ul className="list-disc pl-5">
                {parsedData.map((issue) => (
                  <li key={issue.pk}>
                    <strong>{issue.summary}</strong>
                  </li>
                ))}
              </ul>
            </div>
          )}
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