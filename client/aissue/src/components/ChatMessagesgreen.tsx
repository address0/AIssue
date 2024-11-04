// src/components/(Modal)/ChatModal/ChatMessages.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

interface ChatMessage {
  chatMessageId: number;
  chatRoomId: number;
  senderId: number;
  content: string;
  createdAt: string;
  isRead: string;
}

interface ChatMessagesProps {
  chatRoomId: number;
  userId: number | null;
}

// 기본 URL 설정
axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

const ChatMessages: React.FC<ChatMessagesProps> = ({ chatRoomId, userId }) => {
  const [chatDetails, setChatDetails] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`/chatrooms/${chatRoomId}/messages`);
        setChatDetails(response.data);
      } catch (error) {
        console.error("Failed to load chat messages", error);
      }
    };

    fetchMessages();
  }, [chatRoomId]);

  const handleSend = async () => {
    if (inputValue.trim() !== "") {
      try {
        const newMessage = {
          user_id: userId,
          message_content: inputValue,
        };
        await axios.post(`/chatrooms/${chatRoomId}/messages`, newMessage);

        setChatDetails((prevMessages) => [
          ...prevMessages,
          {
            chatMessageId: Date.now(),
            chatRoomId,
            senderId: userId || 0,
            content: inputValue,
            createdAt: new Date().toISOString(),
            isRead: "false",
          },
        ]);

        setInputValue("");
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      } catch (error) {
        console.error("Failed to send message", error);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* 채팅 메시지 목록 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {chatDetails.map((chat) => (
          <div key={chat.chatMessageId} className={`flex ${chat.senderId === userId ? "justify-end" : "justify-start"} mb-2`}>
            <div className={`max-w-xs p-3 rounded-lg ${chat.senderId === userId ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"}`}>
              <p className="text-sm">{chat.content}</p>
              <span className="text-xs text-gray-500">{new Date(chat.createdAt).toLocaleTimeString()}</span>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* 메시지 입력창 */}
      <div className="flex items-center border-t p-2">
        <input
          type="text"
          placeholder="팀원들과 채팅하기..."
          className="flex-1 px-3 py-2 text-sm border border-[#54B2A3] rounded-lg focus:outline-none"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          style={{
            borderColor: '#54B2A3',
            borderRadius: '8px'
          }}
        />
        <button onClick={handleSend} className="ml-2 flex items-center justify-center p-2 h-full">
          <img src="/img/chatsendgreen.png" alt="Send" className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default ChatMessages;
