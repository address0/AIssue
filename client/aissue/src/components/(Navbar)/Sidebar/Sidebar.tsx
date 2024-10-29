// src/components/Sidebar.tsx
import Image from 'next/image';

export default function Sidebar() {
  return (
    <div className="w-64 bg-white p-4 flex flex-col justify-between min-h-screen">
      {/* Project Icon and Name */}
      <div className="flex flex-col items-center space-y-2 mb-6">
        <Image src="/img/teamprofile.png" alt="Team Project Icon" width={40} height={40} />
        <span className="text-black font-semibold">Team / Project name</span>
      </div>
      
      {/* Navigation Buttons */}
      <nav className="flex flex-1 flex-col items-center space-y-4 justify-evenly">
        <button className="w-full text-center text-black hover:bg-[#9EBDFF66] py-2">AI 스프린트 생성</button>
        <button className="w-full text-center text-black hover:bg-[#9EBDFF66] py-2">전체 업무 로그</button>
        <button className="w-full text-center text-black hover:bg-[#9EBDFF66] py-2">프로젝트 일정</button>
        <button className="w-full text-center text-black hover:bg-[#9EBDFF66] py-2">외부 API 연동</button>
        <button className="w-full text-center text-black hover:bg-[#9EBDFF66] py-2">프로젝트 정보</button>
      </nav>

      {/* Exit Project Button */}
      <button 
        className="w-full mt-4 text-center text-black bg-[#EEEEEE] hover:bg-[#9EBDFF66] py-2 rounded-[20px]"
        style={{ borderRadius: '20px' }}
      >
        프로젝트 나가기
      </button>
    </div>
  );
}
