"use client";

import React, {useEffect, useState} from "react";
import loadImg from "@public/lottie/Animation - 1731410863192.json"
import Lottie from "react-lottie-player";
import { getProjectInfo } from "@/api/project";
import Image from "next/image";

interface EpicModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
}

interface EpicData {
  summary: string,
  description: string,
  issuetype: string,
  priority: string,
  startDate: string,
  endDate: string,
}

export default function EpicModal({
  isOpen,
  onClose,
  projectId
}: EpicModalProps) {
  const [Loading, setLoading] = useState<boolean>(false)
  const [isError, setIsError] = useState<boolean>(false)
  // const [editIndex, setEditIndex] = useState<number | null>(null);
  // const [editItem, setEditItem] = useState<EpicData | null>(null);
  const [parsedData, setParsedData] = useState<EpicData[]>([
    {
        "summary": "[BE] OAuth 기반 회원탈퇴 구현",
        "description": "Spring Boot를 사용하여 OAuth 인증 및 회원탈퇴 기능 구현",
        "issuetype": "Epic",
        "priority": "High",
        "startDate": "2024-11-30",
        "endDate": "2024-12-14"
    },
    {
        "summary": "[BE] 회원 정보 관리 구현",
        "description": "Spring Boot를 활용하여 데이터베이스와 연동되는 회원 정보 관리 기능 개발",
        "issuetype": "Epic",
        "priority": "High",
        "startDate": "2024-12-01",
        "endDate": "2024-12-14"
    },
    {
        "summary": "[BE] 프로젝트 관리 API 개발",
        "description": "Spring Boot로 프로젝트 관리를 위한 API 개발",
        "issuetype": "Epic",
        "priority": "Medium",
        "startDate": "2024-12-02",
        "endDate": "2024-12-16"
    },
    {
        "summary": "[FE] WebRTC 기반 회의 기능 프론트엔드 개발",
        "description": "React를 사용하여 WebRTC 기술로 실시간 비디오 회의 기능 구현",
        "issuetype": "Epic",
        "priority": "Highest",
        "startDate": "2024-12-05",
        "endDate": "2024-12-20"
    },
    {
        "summary": "[FE] 사용자 인터페이스 개발",
        "description": "React를 이용한 사용자 친화적 인터페이스 설계 및 개발",
        "issuetype": "Epic",
        "priority": "High",
        "startDate": "2024-12-06",
        "endDate": "2024-12-21"
    },
    {
        "summary": "[Infra] AWS 인프라 구성",
        "description": "AWS를 이용하여 안정적인 인프라 구성 및 유지보수",
        "issuetype": "Epic",
        "priority": "Medium",
        "startDate": "2024-12-07",
        "endDate": "2024-12-22"
    },
    {
        "summary": "[BE] 실시간 데이터 처리 기능",
        "description": "Spring Boot와 AWS를 활용한 실시간 데이터 처리 기능 구현",
        "issuetype": "Epic",
        "priority": "High",
        "startDate": "2024-12-10",
        "endDate": "2024-12-25"
    },
    {
        "summary": "[UX/UI] 반응형 웹 디자인 개발",
        "description": "React와 CSS를 사용한 반응형 웹 디자인 구현",
        "issuetype": "Epic",
        "priority": "Medium",
        "startDate": "2024-12-15",
        "endDate": "2024-12-30"
    }
])
  const [projectData, setProjectData] = useState<string>('')

//   const parsedData:EpicData[] = [
//     {
//         "summary": "[BE] OAuth 기반 회원탈퇴 구현",
//         "description": "Spring Boot를 사용하여 OAuth 인증 및 회원탈퇴 기능 구현",
//         "issuetype": "에픽",
//         "priority": "High",
//         "startDate": "2024-11-30",
//         "endDate": "2024-12-14"
//     },
//     {
//         "summary": "[BE] 회원 정보 관리 구현",
//         "description": "Spring Boot를 활용하여 데이터베이스와 연동되는 회원 정보 관리 기능 개발",
//         "issuetype": "에픽",
//         "priority": "High",
//         "startDate": "2024-12-01",
//         "endDate": "2024-12-14"
//     },
//     {
//         "summary": "[BE] 프로젝트 관리 API 개발",
//         "description": "Spring Boot로 프로젝트 관리를 위한 API 개발",
//         "issuetype": "에픽",
//         "priority": "Medium",
//         "startDate": "2024-12-02",
//         "endDate": "2024-12-16"
//     },
//     {
//         "summary": "[FE] WebRTC 기반 회의 기능 프론트엔드 개발",
//         "description": "React를 사용하여 WebRTC 기술로 실시간 비디오 회의 기능 구현",
//         "issuetype": "에픽",
//         "priority": "Highest",
//         "startDate": "2024-12-05",
//         "endDate": "2024-12-20"
//     },
//     {
//         "summary": "[FE] 사용자 인터페이스 개발",
//         "description": "React를 이용한 사용자 친화적 인터페이스 설계 및 개발",
//         "issuetype": "에픽",
//         "priority": "High",
//         "startDate": "2024-12-06",
//         "endDate": "2024-12-21"
//     },
//     {
//         "summary": "[Infra] AWS 인프라 구성",
//         "description": "AWS를 이용하여 안정적인 인프라 구성 및 유지보수",
//         "issuetype": "에픽",
//         "priority": "Medium",
//         "startDate": "2024-12-07",
//         "endDate": "2024-12-22"
//     },
//     {
//         "summary": "[BE] 실시간 데이터 처리 기능",
//         "description": "Spring Boot와 AWS를 활용한 실시간 데이터 처리 기능 구현",
//         "issuetype": "에픽",
//         "priority": "High",
//         "startDate": "2024-12-10",
//         "endDate": "2024-12-25"
//     },
//     {
//         "summary": "[UX/UI] 반응형 웹 디자인 개발",
//         "description": "React와 CSS를 사용한 반응형 웹 디자인 구현",
//         "issuetype": "에픽",
//         "priority": "Medium",
//         "startDate": "2024-12-15",
//         "endDate": "2024-12-30"
//     }
// ]

  useEffect(() => {
    getProjectInfo(projectId)
    .then((data) => {
      setProjectData(data)
      handleCreateIssue(data, 'epic')
    })
    .catch((error) => {
      console.log(error)
    })
  },[])

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // 수정 함수
  // const handleEdit = (index: number) => {
  //   setEditIndex(index);
  //   setEditItem(parsedData[index]);
  // };

  // // 수정 완료 함수
  // const handleUpdate = (index: number) => {
  //   const updatedItems = parsedData.map((item, i) => (i === index ? editItem : item));
  //   setParsedData(updatedItems);
  //   setEditIndex(null);
  //   setEditItem(null);
  // };

  // // 삭제 함수
  // const handleDelete = (index: number) => {
  //   const updatedItems = parsedData.filter((_, i) => i !== index);
  //   setParsedData(updatedItems);
  // };

  const handleCreateIssue = async (projectData:string, type: string) => {
    setLoading(true)
    setIsError(false)
    console.log(projectData)

    const response = await fetch('/project/[projectId]/sprint/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: `적절한 에픽을 8개 생성해 줘. 프로젝트에 대한 정보는 다음과 같아. \n
        ${JSON.stringify(projectData, null, 2)}`,
        type: type }),
    })

    const data = await response.json()
    console.log(data)
    if (response.ok) {
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

  useEffect(() => {
    if (parsedData) {
      console.log(parsedData)
    }
  }, [parsedData])

  const addItem = () => {
    const newItem: EpicData = {
      priority: 'Medium', // 새로운 항목의 우선순위, 필요에 따라 변경
      summary: `새로운 항목 ${parsedData.length + 1}`,
      issuetype: "Epic",
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      description: '새로운 항목의 설명입니다.',
    };

    setParsedData([...parsedData, newItem]); // 새로운 항목 추가
  };

  if (!isOpen) return null

  return (
    <div className="fixed h-screen inset-0 bg-black bg-opacity-50 flex justify-center items-center"
    onClick={handleOverlayClick}>
      <div className={`bg-white rounded-lg p-6 shadow-lg relative flex flex-col items-center text-lg transition-all duration-300 text-gray-500 ${!Loading && !isError ? 'w-1/2 h-4/5' : 'w-1/3 h-1/2'}`}>
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
            <button onClick={() => handleCreateIssue(projectData, 'epic')}
            className="mt-4 w-36 h-10 bg-blue-500 text-white rounded">
              다시 시도하기
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center w-full h-full">
            <h1 className="text-lg font-bold text-[#54B2A3] my-2">AI 컨설턴트가 생성한 에픽 목록입니다.</h1>
            <div className="w-5/6 grow overflow-y-auto">
              {parsedData?.map((item, index) => (
                <li key={index}
                className="w-full h-20 list-none border rounded border-[#54B2A3] my-2 p-2 relative">
                  <div className="flex items-center my-1">
                    <img src={`/img/${item?.priority}.png`} alt="priority_img"
                    className="w-6" />
                    <p className="text-sm font-bold text-[#54B2A3]">{item?.summary}<span className="text-gray-500 text-xs font-normal ml-4">{item?.startDate} - {item?.endDate}</span></p>
                  </div>
                  <p className="text-sm ml-2">{item?.description}</p>
                  <div className="absolute top-2 right-2 flex space-x-2">
                    <button className="bg-blue-400 text-xs w-12 h-6 rounded text-white">수정</button>
                    <button className="bg-red-400 text-xs w-12 h-6 rounded text-white">삭제</button>
                  </div>
                </li>
              ))}
              <button className="w-28 h-10 rounded bg-[#54B2A3] text-2xl text-white font-bold" onClick={addItem}>+</button>
            </div>
            <button className="w-40 h-16 my-4 bg-[#4D86FF] text-base font-bold text-white rounded" onClick={onClose}>에픽 목록 저장하기</button>
          </div>
        )}
      </div>
    </div>
  )
}