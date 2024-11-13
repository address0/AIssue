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

  // const parsedData:IssueData[] = [
  //     {
  //         "pk": "1",
  //         "summary": "[BE] 쇼핑카트 기능 개발",
  //         "description": "사용자가 상품을 장바구니에 추가하고 관리할 수 있는 백엔드 로직 구현",
  //         "issuetype": `{
  //             "name": "Epic"
  //         }`,
  //         "priority": "high",
  //         "parent": null,
  //         "issuelink": null,
  //         "storyPoint": null,
  //         "manager": null
  //     },
  //     {
  //         "pk": "2",
  //         "summary": "[FE] 대시보드 UI 구축",
  //         "description": "관리자와 사용자 대시보드 프론트엔드 디자인 및 구현",
  //         "issuetype": `{
  //             "name": "Epic"
  //         }`,
  //         "priority": "medium",
  //         "parent": null,
  //         "issuelink": null,
  //         "storyPoint": null,
  //         "manager": null
  //     },
  //     {
  //         "pk": "3",
  //         "summary": "[Infra] 클라우드 인프라 설계",
  //         "description": "애플리케이션 호스팅을 위한 클라우드 인프라 설계 및 구축",
  //         "issuetype": `{
  //             "name": "Epic"
  //         }`,
  //         "priority": "high",
  //         "parent": null,
  //         "issuelink": null,
  //         "storyPoint": null,
  //         "manager": null
  //     },
  //     {
  //         "pk": "4",
  //         "summary": "[BE] REST API 개발",
  //         "description": "시스템의 다양한 기능을 위한 RESTful API 개발",
  //         "issuetype": `{
  //             "name": "Epic"
  //         }`,
  //         "priority": "high",
  //         "parent": null,
  //         "issuelink": null,
  //         "storyPoint": null,
  //         "manager": null
  //     },
  //     {
  //         "pk": "5",
  //         "summary": "[UX/UI] 모바일 앱 디자인",
  //         "description": "사용자 인터랙션 및 경험을 고려한 모바일 앱 디자인",
  //         "issuetype": `{
  //             "name": "Epic"
  //         }`,
  //         "priority": "medium",
  //         "parent": null,
  //         "issuelink": null,
  //         "storyPoint": null,
  //         "manager": null
  //     },
  //     {
  //         "pk": "6",
  //         "summary": "[FE] 결제 시스템 통합",
  //         "description": "여러 결제 게이트웨이와의 통합을 통한 결제 시스템 구현",
  //         "issuetype": `{
  //             "name": "Epic"
  //         }`,
  //         "priority": "low",
  //         "parent": null,
  //         "issuelink": null,
  //         "storyPoint": null,
  //         "manager": null
  //     },
  //     {
  //         "pk": "7",
  //         "summary": "[BE] 사용자 인증 및 권한 관리",
  //         "description": "인증 및 사용자 권한 관리 시스템 개발",
  //         "issuetype": `{
  //             "name": "Epic"
  //         }`,
  //         "priority": "high",
  //         "parent": null,
  //         "issuelink": null,
  //         "storyPoint": null,
  //         "manager": null
  //     },
  //     {
  //         "pk": "8",
  //         "summary": "[Infra] 데이터 백업 및 복구 전략 수립",
  //         "description": "데이터 보안과 복구를 위한 전략 수립 및 실행",
  //         "issuetype": `{
  //             "name": "Epic"
  //         }`,
  //         "priority": "medium",
  //         "parent": null,
  //         "issuelink": null,
  //         "storyPoint": null,
  //         "manager": null
  //     },
  //     {
  //         "pk": "9",
  //         "summary": "[FE+BE] 실시간 데이터 처리",
  //         "description": "웹 및 모바일에서 실시간 데이터 업데이트 기능 구현",
  //         "issuetype": `{
  //             "name": "Epic"
  //         }`,
  //         "priority": "high",
  //         "parent": null,
  //         "issuelink": null,
  //         "storyPoint": null,
  //         "manager": null
  //     },
  //     {
  //         "pk": "10",
  //         "summary": "[UX/UI] 반응형 웹 디자인",
  //         "description": "다양한 디바이스에서의 사용자 경험 최적화를 위한 반응형 웹 디자인",
  //         "issuetype": `{
  //             "name": "Epic"
  //         }`,
  //         "priority": "low",
  //         "parent": null,
  //         "issuelink": null,
  //         "storyPoint": null,
  //         "manager": null
  //     }
  // ]

  useEffect(() => {
    getProjectInfo(projectId)
    .then((data) => {
      setProjectData(data)
      handleCreateIssue(data)
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

  const handleCreateIssue = async (projectData:string) => {
    setLoading(true)
    setIsError(false)
    console.log(projectData)

    const response = await fetch('/project/[projectId]/sprint/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: `적절한 에픽을 8개 생성해 줘. 프로젝트에 대한 정보는 다음과 같아. \n
        ${JSON.stringify(projectData, null, 2)}` }),
    })

    // const response = await fetch('/project/[projectId]/sprint/chat', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ message: `AIssue라는 이름의 JIRA 이슈 및 스프린트 자동 생성 애플리케이션을 만들 거야. 적절한 에픽을 10개 생성해 줘.` }),
    // })

    const data = await response.json()
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

  if (!isOpen) return null

  return (
    <div className="fixed h-screen inset-0 bg-black bg-opacity-50 flex justify-center items-center"
    onClick={handleOverlayClick}>
      <div className="bg-white rounded-lg p-6 shadow-lg relative w-1/2 h-3/4 flex flex-col items-center text-lg text-gray-500">
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
        ) : (
          <div className="flex flex-col items-center w-full h-full">
            <h1 className="text-lg font-bold text-[#54B2A3] my-2">AI 컨설턴트가 생성한 에픽 목록입니다.</h1>
            <div className="w-4/5 grow overflow-y-auto">
              {parsedData?.map((item, index) => (
                <li key={index}
                className="w-full h-20 list-none border rounded border-[#54B2A3] my-2 p-2">
                  <div className="flex items-center">
                    <img src={`/img/${item?.priority}.png`} alt="priority_img"
                    className="w-8" />
                    <p className="text-sm font-bold text-[#54B2A3]">{item?.summary}</p>
                  </div>
                  <p className="text-sm ml-2">{item?.description}</p>

                </li>
              ))}
            </div>
            <button>확인</button>
          </div>
        )}
      </div>
    </div>
  )
}