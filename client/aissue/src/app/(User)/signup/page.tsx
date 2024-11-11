'use client'

import axios from 'axios'
import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signUp } from '@/api/user/index'
import JiraModal from '@/components/(Modal)/JiraModal/page' // JiraModal 컴포넌트 추가

export default function SignupPage() {
  const [email, setEmail] = useState<string>('')
  const [apiToken, setApiToken] = useState<string>('')
  const [name, setName] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [signupStep, setSignupStep] = useState<number>(1)
  const [jiraError, setJiraError] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false) // 모달 상태 추가
  const router = useRouter()

  const handleSignup = () => {
    console.log(email, password, apiToken, name)
    signupSubmit()
  }

  const handleSignupStep = (step: number) => () => {
    setSignupStep(step)
  }

  const signupSubmit = async () => {
    try {
      console.log(email, password, apiToken, name)
      const res = await signUp(email, password, apiToken, name)
      sessionStorage.setItem('accessToken', res.accessToken)
      sessionStorage.setItem('refreshToken', res.refreshToken)
      sessionStorage.setItem('memberId', res.memberId)
      sessionStorage.setItem('memberName', res.memberName)
      router.push('/project')
    } catch (error) {
      console.log(error)
      if (axios.isAxiosError(error)) {
        if (
          error.response?.data.message ===
          'Jira 인증 정보가 잘못되었습니다. email또는 jiraAPIKey를 확인해주세요.'
        ) {
          setJiraError(
            'Jira 인증 정보가 잘못되었습니다. Jira e-mail또는 Jira API Token을 확인해주세요.',
          )
          setSignupStep(1)
        } else if (
          error.response?.data.message === '이미 존재하는 회원입니다.'
        ) {
          setJiraError('이미 존재하는 회원입니다.')
          setSignupStep(1)
        }
      }
    }
  }

  const openModal = () => {
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: '#9EBDFF' }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && signupStep === 1) {
          handleSignupStep(2)()
        }
      }}
    >
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg relative">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 text-teal-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Logo and Title */}
        <div className="flex flex-col items-center mb-6">
          <Image src="/img/chatbot.png" alt="Logo" width={60} height={60} />
          <h1 className="text-2xl font-bold text-teal-600">AIssue</h1>
        </div>

        <h2 className="text-lg text-teal-600 text-center mb-6">회원가입</h2>
        {signupStep === 1 && (
          <>
            <div className="space-y-4">
              {jiraError && (
                <p className="text-red-500 text-center">{jiraError}</p>
              )}
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
                <span
                  className="text-blue-500 cursor-pointer"
                  onClick={openModal} // 모달 열기
                >
                  Jira API Token은 어디서 보나요?
                </span>
              </p>
            </div>
            <button
              onClick={handleSignupStep(2)}
              className="w-full mt-6 border border-teal-500 text-teal-600 py-3 rounded hover:bg-teal-50 transition-colors"
            >
              다음
            </button>
          </>
        )}
        {signupStep === 2 && (
          <>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border border-teal-400 rounded focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
              <input
                type="password"
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-teal-400 rounded focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>

            {/* Signup Button */}
            <button
              onClick={handleSignup}
              className="w-full mt-6 border border-teal-500 text-teal-600 py-3 rounded hover:bg-teal-50 transition-colors"
            >
              회원가입
            </button>
          </>
        )}

        {/* JiraModal 컴포넌트 */}
        {isModalOpen && (
          <JiraModal onClose={closeModal} />
        )}
      </div>
    </div>
  )
}
