"use client";

import React, {useEffect, useState} from "react";
import loadImg from "@public/lottie/Animation - 1731410863192.json"
import Lottie from "react-lottie-player";
import { getProjectInfo } from "@/api/project";
import { IssueData } from "@/app/project/[projectId]/sprint/page";
import Image from "next/image";

interface EpicModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
}

export default function EpicModal({
  isOpen,
  onClose,
  projectId
}: EpicModalProps) {
  const [Loading, setLoading] = useState<boolean>(false)
  const [isError, setIsError] = useState<boolean>(false)
  const [parsedData, setParsedData] = useState<IssueData[]>([])
  const [projectData, setProjectData] = useState<string>('')

  useEffect(() => {
    getProjectInfo(projectId)
    .then((data) => {
      console.log(data)
      setProjectData(data)
      handleCreateIssue(data)
    })
    .catch((error) => {
      console.log(error)
    })
  },[])

  if (!isOpen) return null

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleCreateIssue = async (projectData:string) => {
    setLoading(true)
    setIsError(false)
    console.log("project data: ", projectData)

    const response = await fetch('/project/[projectId]/sprint/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: `적절한 에픽을 8개 생성해 줘. 프로젝트에 대한 정보는 다음과 같아. \n
        ${projectData}` }),
    })

    const data = await response.json()
    if (response.ok) {
      console.log(data)
      const resultMatch = data?.response?.match(/result:\s*(\[[\s\S]*?\])\s*}/);

      if (resultMatch) {
        let jsonString = resultMatch[1];
        jsonString = jsonString.replace(/(\w+):/g, '"$1":')
        try {
          setParsedData(JSON.parse(jsonString))
        } catch (error) {
          console.error("JSON parsing failed:", error);
        }
      } else {
        try {
          const jsonData = JSON.parse(data?.response)
          setParsedData(jsonData?.result);
        } catch (error) {
          console.log("JSON 부분을 찾을 수 없습니다.");
          console.log(error)
          setIsError(true)
        }
      }
    } else {
      console.error(data.error)
    }
    setLoading(false)
  }

  return (
    <div className="fixed h-screen inset-0 bg-black bg-opacity-50 flex justify-center items-center"
    onClick={handleOverlayClick}>
      <div className="bg-white rounded-lg p-6 shadow-lg relative w-1/2 h-2/3 flex flex-col items-center text-lg text-gray-500">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-600 text-xl">
            X
        </button>
        {Loading ? (
          <>
            <Lottie
              loop
              animationData={loadImg}
              play
              className="w-full h-2/3"
            />
            <p>저장된 프로젝트 정보 기반으로</p>
            <p>AI가 에픽을 생성 중입니다 ...</p>
          </>
        ) : isError ? (
          <>
            <Image src="/img/sad_ai.png" alt="Chatbot" width={300} height={300} />
            <p>이슈 생성 중 오류가 발생했어요.</p>
            <button onClick={() => handleCreateIssue(projectData)}
            className="mt-4 w-36 h-10 bg-blue-500 text-white rounded">
              다시 시도하기
            </button>
          </>
        ) : parsedData?.map((item, index) => (
          <li key={index}>{item?.summary}</li>
        ))}
      </div>
    </div>
  )
}