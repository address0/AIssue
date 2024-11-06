/* eslint-disable */
// @ts-nocheck

import React, { useRef, useEffect, useState, ChangeEvent } from 'react'
import { Stomp } from '@stomp/stompjs'
import axios from 'axios'

interface ChatModalProps {
  onClose: () => void
  memberId: string | null
  projectId: string | null
  accessToken: string | null
  color: string
}

interface Message {
  memberId: string
  message: string
  memberName: string
}

export default function ChatModal({
  onClose,
  memberId,
  projectId,
  accessToken,
  color,
}: ChatModalProps) {
  const stompClient = useRef<Stomp.Client | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState<string>('')

  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    connect()
    fetchMessages()
    return () => disconnect()
  }, [])

  // messages가 업데이트될 때마다 스크롤을 맨 아래로 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value)
  }

  const connect = () => {
    const socket = new WebSocket('wss://k11a403.p.ssafy.io/api/ws')
    stompClient.current = Stomp.over(() => socket)

    stompClient.current.connect(
      { Authorization: `Bearer ${accessToken}` },
      () => {
        stompClient.current?.subscribe(
          `/sub/chatroom/${projectId}`,
          (message) => {
            const newMessage: Message = JSON.parse(message.body)
            setMessages((prevMessages) => [...prevMessages, newMessage])
          },
        )
      },
      (error) => {
        console.error('WebSocket connection error:', error)
      },
    )
  }

  const disconnect = () => {
    if (stompClient.current) {
      stompClient.current.disconnect()
    }
  }

  const fetchMessages = () => {
    return axios
      .get<Message[]>(`https://k11a403.p.ssafy.io/api/chat/${projectId}`, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((response) => {
        setMessages(response.data)
      })
  }

  const sendMessage = () => {
    if (stompClient.current && inputValue) {
      const body = {
        jiraProjectKey: projectId,
        memberId: memberId,
        message: inputValue,
      }

      stompClient.current.send(
        '/pub/message',
        { Authorization: `Bearer ${accessToken}` },
        JSON.stringify(body),
      )
      setInputValue('')
    }
  }

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-end z-50"
      onClick={handleOverlayClick}
    >
      <div
        className="bg-white rounded-lg shadow-lg w-[35vw] h-[60vh] p-4 m-4 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">채팅</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="flex flex-col h-full bg-white overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {messages.map((chat, index) => (
                <div
                  key={index}
                  className={`flex ${
                    memberId && String(chat.memberId) === String(memberId)
                      ? 'justify-end'
                      : 'justify-start'
                  } mb-2`}
                >
                  <div
                    className={`max-w-xs p-3 rounded-lg ${
                      memberId && String(chat.memberId) === String(memberId)
                        ? `bg-[${color}] text-white`
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {String(chat.memberId) === String(memberId) ? null : (
                      <p className="text-xs font-bold">{chat.memberName}</p>
                    )}
                    <p className="text-sm">{chat.message}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="flex items-center border-t p-2">
              <input
                type="text"
                placeholder="팀원들과 채팅하기..."
                className={`flex-1 px-3 py-2 text-sm border border-[${color}] rounded-lg focus:outline-none`}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    sendMessage()
                  }
                }}
                style={{
                  borderColor: `${color}`,
                  borderRadius: '8px',
                }}
              />
              <button
                onClick={sendMessage}
                className="ml-2 flex items-center justify-center p-2 h-full"
              >
                <img
                  src="/img/chatsendgreen.png"
                  alt="Send"
                  className="w-6 h-6"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
