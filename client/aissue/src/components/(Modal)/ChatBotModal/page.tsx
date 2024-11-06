import React, { useRef, useState, ChangeEvent, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { postChatBot } from '@/api/gptChatBot'

interface Message {
  text: string
  isUser: boolean
}

interface ChatBotModalProps {
  onClose: () => void
  chatBotMessages: Message[]
  setChatBotMessages: React.Dispatch<React.SetStateAction<Message[]>>
}

export default function ChatBotModal({
  onClose,
  chatBotMessages,
  setChatBotMessages,
}: ChatBotModalProps) {
  const [inputValue, setInputValue] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const mutation = useMutation({
    mutationFn: postChatBot,
    onMutate: () => {
      setChatBotMessages((prev) => [
        ...prev,
        { text: '대답을 생성 중입니다...', isUser: false },
      ])
    },
    onSuccess: (data) => {
      setChatBotMessages((prev) => [
        ...prev.slice(0, -1),
        { text: data, isUser: false },
      ])
      setInputValue('')
    },
    onError: () => {
      setChatBotMessages((prev) => [
        ...prev,
        { text: '오류가 발생했습니다. 다시 시도해 주세요.', isUser: false },
      ])
    },
  })

  const sendMessage = () => {
    if (inputValue.trim()) {
      setChatBotMessages((prev) => [
        ...prev,
        { text: inputValue, isUser: true },
      ])
      mutation.mutate(inputValue)
    }
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value)
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatBotMessages])

  // ESC 키가 눌렸을 때 모달을 닫는 함수
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
          <h2 className="text-lg font-semibold">챗봇</h2>
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
              {chatBotMessages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.isUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg ${
                      message.isUser
                        ? 'bg-blue-500 text-white text-right'
                        : 'bg-gray-200 text-left'
                    } max-w-xs`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="flex items-center border-t p-2">
              <input
                type="text"
                placeholder="챗봇에게 질문하기..."
                className="flex-1 px-3 py-2 text-sm border border-[#7498E5] rounded-lg focus:outline-none"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    sendMessage()
                  }
                }}
                style={{
                  borderColor: `#7498E5`,
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
