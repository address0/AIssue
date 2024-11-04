// src/components/ChatModal.tsx
"use client";

import React, { useEffect, useState } from "react";
import ChatMessages from "@/components/ChatMessages";

interface ChatModalProps {
  onClose: () => void;
}

export default function ChatModal({ onClose }: ChatModalProps) {
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userIdString = localStorage.getItem("userId");
      setUserId(userIdString ? Number(userIdString) : null);
    }
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-end bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-[35vw] h-[60vh] p-4 m-4 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">채팅</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-hidden">
          <ChatMessages chatRoomId={1} userId={userId} /> {/* 예시로 chatRoomId를 1로 설정 */}
        </div>
      </div>
    </div>
  );
}
