import { useState } from 'react';
import Image from 'next/image';

interface JiraModalProps {
  onClose: () => void;
}

export default function JiraModal({ onClose }: JiraModalProps) {
  // 여러 이미지 경로 및 설명을 배열로 준비
  const slides = [
    {
      image: '/img/step1.png',
    },
    {
      image: '/img/step2.png',
    },
    {
      image: '/img/step3.png',
    },
    {
    image: '/img/step4.png',
    },
    {
    image: '/img/step5.png',
    },
    {
    image: '/img/step6.png',
    },
    {
    image: '/img/step7.png',
    },
    {
    image: '/img/step8.png',
    },
    {
    image: '/img/step9.png',
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? slides.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[90%] max-w-[800px] shadow-lg relative"> {/* 모달 크기 조정 */}
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500">
          X
        </button>
        <h2 className="text-center font-bold text-lg mb-4">Jira API Token 조회하기</h2>
        <div className="flex items-center justify-center">
          <button onClick={prevSlide} className="mr-2">
            <Image src="/img/signleftarrow.png" alt="Previous" width={70} height={70} />
          </button>
          <div className="flex flex-col items-center">
            {/* 이미지 크기를 더 크게 조정 */}
            <img 
              src={slides[currentIndex].image} 
              alt="Jira Guide" 
              className="rounded-lg mb-2 w-full max-w-[80%]" 
            />
        
          </div>
          <button onClick={nextSlide} className="ml-2">
            <Image src="/img/signrightarrow.png" alt="Next" width={70} height={70} />
          </button>
        </div>
      </div>
    </div>
  );
}
