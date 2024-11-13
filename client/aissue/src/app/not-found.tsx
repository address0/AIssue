'use client'

import Image from 'next/image'

export default function NotFound() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-[#9EBDFF] text-white p-5">
      <div className="flex flex-col items-center animate-fadeIn">
        <Image
          src="/img/chatbot.png"
          alt="Logo"
          width={80}
          height={80}
          className="mb-6 transform transition-transform duration-300 hover:scale-110"
        />
        <p className="text-4xl font-extrabold mb-2">404</p>
        <p className="text-lg font-semibold">존재하지 않는 페이지입니다.</p>
        <p className="text-sm opacity-80 mt-4 text-center">
          잘못된 URL을 입력하셨거나, 페이지가 삭제되었습니다.
        </p>
      </div>
    </div>
  )
}
