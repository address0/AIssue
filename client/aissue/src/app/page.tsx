'use client';
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Lottie from "react-lottie-player";
import lottieJson from '@public/lottie/Animation - 1730162499899.json';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/login");
    }, 2000); // 1초 후에 이동

    return () => clearTimeout(timer); // 컴포넌트가 언마운트될 때 타이머 정리
  }, [router]);

  return (
    <div className="w-screen h-screen bg-blue-300 flex items-center justify-center overflow-hidden">
      <div className="flex items-center gap-8">
        <div className="w-3/4 h-3/4 max-w-md max-h-md">
          <Lottie loop animationData={lottieJson} play className="w-full h-full" />
        </div>
        <div className="animate-pulse text-left">
          <h2 className="text-blue-700 text-xl">주니어(아이) 개발자 전용 업무 자동화 서비스 zz</h2>
          <h1 className="text-white font-bold text-4xl">AIssue</h1>
        </div>
      </div>
    </div>
  );
}
