'use client';
import Lottie from "react-lottie-player";
import lottieJson from '@public/lottie/Animation - 1730162499899.json';

export default function Home() {
  return (
    <div className="w-screen h-screen bg-blue-300 flex items-center justify-center overflow-hidden">
      <div className="flex items-center gap-8">
        <div className="w-3/4 h-3/4 max-w-md max-h-md">
          <Lottie loop animationData={lottieJson} play className="w-full h-full" />
        </div>
        <div className="animate-pulse text-left">
          <h2 className="text-blue-700 text-xl">주니어(아이) 개발자 전용 업무 자동화 서비스</h2>
          <h1 className="text-white font-bold text-4xl">AIssue</h1>
        </div>
      </div>
    </div>
  );
}
