"use client";

import React from "react";
import loadImg from "@public/lottie/Animation - 1731410863192.json"
import Lottie from "react-lottie-player";

interface EpicModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function EpicModal({
  isOpen,
  onClose
}: EpicModalProps) {

  if (!isOpen) return null

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
    onClick={handleOverlayClick}>
      <div className="bg-white rounded-lg p-6 shadow-lg relative w-1/2 h-2/3 flex flex-col items-center justify-center text-lg text-gray-500">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-600 text-xl">
            X
        </button>
        <Lottie
          loop
          animationData={loadImg}
          play
          className="w-full h-2/3"
        />
        <p>저장된 프로젝트 정보 기반으로</p>
        <p>AI가 에픽을 생성 중입니다 ...</p>
      </div>
    </div>
  )
}