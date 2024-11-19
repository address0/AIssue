// src/app/sprint/page.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Lottie from 'react-lottie-player'
import NoEpic from '@public/lottie/Animation - 1730424329200.json'
import LoadingImg from '@public/lottie/Animation - 1731310411267.json'
import FindEpicImg from '@public/lottie/Animation - 1731658876737.json'
import EpicModal from '@/components/(Modal)/EpicModal/page'
import { getEpics } from '@/api/issue'
import { getProjectInfo } from "@/api/project";
import { postIssues } from "@/api/issue";
import Swal from 'sweetalert2';
import { IssueData } from '@/components/(Modal)/EpicModal/page'

interface FetchedEpics {
  summary: string,
  description: string,
  id: number,
  key: string,
  priority: null | string,
  issuetype: string,
  start_at?: string,
  end_at?: string,
  assignee?: string,
  status?: null | string
}

interface SprintData {
  type: string
  message: string
}

interface RoleData {
  title: string,
  name: string,
}

interface MessageData {
  type: string,
  detail: string[]
}


export default function SprintPage({
  params,
}: {
  params: {
    projectId: string;
  };
}) {
  const { projectId } = params;
  const [isSprintPage, setIsSprintPage] = useState<boolean>(false)
  const [isFindEpic, setIsFindEpic] = useState<boolean>(true)
  const [messages, setMessages] = useState<{ user: string; bot: string }[]>([])
  const [input, setInput] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement | null>(null)
  const [parsedStory, setParsedStory] = useState<IssueData[]>([])
  const [parsedSubTask, setParsedSubTask] = useState<IssueData[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0)
  const [showEpicModal, setShowEpicModal] = useState<boolean>(false)
  const [animate, setAnimate] = useState<boolean>(false);
  const [initialMessageSent, setInitialMessageSent] = useState<boolean>(false);
  const [inputList, setInputList] = useState<string[]>([])
  const [epics, setEpics] = useState<FetchedEpics[]>([])
  const [isInputDisabled, setIsInputDisabled] = useState<boolean>(false)
  const [isCreatingStory, setIsCreatingStory] = useState<boolean>(false)
  const [isCreatingSubTask, setIsCreatingSubTask] = useState<boolean>(false)
  const [projectInfo, setProjectInfo] = useState('')
  const userName =  typeof window !== 'undefined' ? sessionStorage.getItem('memberName') : null
  const [prompt, setPrompt] = useState<MessageData[]>([])
  const [userRole, setUserRole] = useState<string>('')
  // const [editIndex, setEditIndex] = useState<number | null>(null);
  // const [editItem, setEditItem] = useState<IssueData | null>(null);

  const questions:SprintData[] = [
    { type: '담당',
      message: `${userName}님이 이번 주 담당한 역할을 선택해 주세요.`
    },
    { type: '추가 기능',
      message: '이번 주차의 에픽 목록은 다음과 같습니다. 추가로 작업할 기능이 있다면 알려 주세요.'
    },
    { type: '추가 작업 내용',
      message: '다음으로, 아직 끝내지 못한 작업이 있다면 알려 주세요.'
    },
    { type: '버그 수정',
      message: '마지막으로, 수정해야 할 버그 목록이 있다면 알려 주세요.'
    },
    { type: '',
      message: '감사합니다. 이번 주차의 스프린트와 스토리 목록을 생성하겠습니다!'
    },
    { type: '세부 구현 사항',
      message: '제공해 드린 스토리 목록을 바탕으로, 세부 구현 사항을 자유롭게 말씀해 주세요.'
    },
    { type: '버그 세부 수정',
      message: '버그 수정 사항에 대해 자세히 설명해 주세요.'
    },
    { type: '',
      message: '감사합니다. 해당 정보를 바탕으로 하위 이슈를 생성하겠습니다!'
    },
  ];

  const role:RoleData[] = [
    {
      title: '[FE]',
      name: 'Frontend',
    },
    {
      title: '[BE]',
      name: 'Backend',
    },
    {
      title: '[UX/UI]',
      name: 'UX/UI Design',
    },
    {
      title: '[DB]',
      name: 'Database',
    },
    {
      title: '[INFRA]',
      name: 'Infra',
    },
    {
      title: '[EM]',
      name: 'Embedded',
    },
    {
      title: '[MOBILE]',
      name: 'Mobile',
    },
  ]

  const showStorySuccessModal = () => {
    Swal.fire({
      title: '스토리 등록 완료',
      text: 'JIRA sprint 스토리 생성이 완료되었습니다. 이제 하위 이슈를 생성하겠습니다.',
      icon: 'success',
      confirmButtonText: '확인'
    }).then((result) => {
      if (result.isConfirmed) {
        nextQuestion()
      }
    });
  };

  const showSubtaskSuccessModal = () => {
    Swal.fire({
      title: '서브 태스크 등록 완료',
      text: 'JIRA sprint Sub-task 생성이 완료되었습니다. 지금 sprint를 보러 갈까요?',
      icon: 'success',
      confirmButtonText: '확인'
    });
  };

  const fetchIssues = async (issueData: IssueData[], type:string) => {
    if (type === 'Story') {
      setIsCreatingStory(true)
    } else {
      setIsCreatingSubTask(true)
    }
    setIsCreatingStory(true)
    try {
      const response = await postIssues({
        project: projectId,
        issues: issueData
      });
      console.log(response);
      if (response?.code === '200') {
        if (type === 'Story') {
          showStorySuccessModal()
        } else {
          showSubtaskSuccessModal()
        }
      }
      
    } catch (error) {
      console.error(error);
      console.log({
        project: projectId,
        issues: parsedStory
      })
    }
    if (type === 'Story') {
      setIsCreatingStory(false)
    } else {
      setIsCreatingSubTask(false)
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleSubmit = () => {
    if (!input) {
      window.alert('정확한 값을 입력해 주세요!')
      return
    }
    setInputList((prev) => [...prev, userMessage])
    const userMessage = input
    setMessages((prev) => [...prev, { user: userMessage, bot: '' }])
    setInput('')
  }

  const nextQuestion = () => {
    setInputList([])
    setTimeout(() => {
      const botMessage = questions[currentQuestionIndex]?.message;
      setMessages((prev) => [...prev, { user: '', bot: botMessage }]);
      setCurrentQuestionIndex(prev => prev + 1);
      setAnimate(true);
      if (currentQuestionIndex === 4) {
        handleCreateStory(epics, projectInfo);
      } else if (currentQuestionIndex === 7) {
        handleCreateSubtask(epics, parsedStory, projectInfo)
      }
    }, 500)
  }

  const addPrompt = (type: string, role?:string) => {
    if (type === '담당' && role) {
      setPrompt((prev) => [...prev, {type: questions[currentQuestionIndex - 1]?.type, detail: [role]}])
    } else {
      setPrompt((prev) => [...prev, {type: type, detail:inputList}])
    }
    nextQuestion()
  }

  // const handleEdit = (index: number, type:string) => {
  //   setEditIndex(index);
  //   if (type === 'story') {
  //     setEditItem(parsedStory[index]);
  //   } else {
  //     setEditItem(parsedSubTask[index]);
  //   }
  // };

  // const handleUpdate = (index: number, type:string) => {
  //   if (editItem) {
  //     if (type === 'story') {
  //       const updatedItems = parsedStory.map((item, i) => (i === index ? editItem : item));
  //       setParsedStory(updatedItems);
  //     } else {
  //       const updatedItems = parsedSubTask.map((item, i) => (i === index ? editItem : item));
  //       setParsedSubTask(updatedItems);
  //     }
  //   }
  //   setEditIndex(null);
  //   setEditItem(null);
  // };

  const handleDelete = (index: number, type:string) => {
    if (type === 'story') {
      const updatedItems = parsedStory.filter((_, i) => i !== index);
      setParsedStory(updatedItems);
    } else {
      const updatedItems = parsedSubTask.filter((_, i) => i !== index);
      setParsedSubTask(updatedItems);
    }
  };

  useEffect(() => {
    console.log(prompt)
  }, [prompt])


  const handleCreateStory = async (epicData:FetchedEpics[], projectData:string) => {
    setLoading(true)

    const response = await fetch('/project/[projectId]/sprint/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: `적절한 이슈 스토리를 3개 생성해 줘. 프로젝트 기술과 기능에 대한 정보는 다음과 같아. \n
        ${JSON.stringify(projectData, null, 2)} \n
        그리고, 현재 프로젝트의 에픽 정보는 다음과 같아. \n
        ${JSON.stringify(epicData, null, 2)} \n
        이번 주차에 구현해야 할 추가 기능: ${prompt[1]?.detail} \n
        아직 끝내지 못한 작업 내용: ${prompt[2]?.detail} \n
        수정해야 하는 버그 목록: ${prompt[3]?.detail} \n
        마지막으로, 이번 주 내가 담당한 부분은 ${prompt[0]?.detail}야. 이슈 summary에 항상 ${prompt[0]?.detail}를 붙이고 내가 진행할 업무에 대해서 스토리를 생성해 줘.`,
        type: 'story'
       }),
    })

    const data = await response.json()
    console.log(data)
    
    if (response.ok) {
      const resultMatch = data?.response?.match(/result:\s*(\[[\s\S]*?\])\s*}/);

      if (resultMatch) {
        let jsonString = resultMatch[1];
        jsonString = jsonString.replace(/(\w+):/g, '"$1":')
        try {
          setParsedStory(JSON.parse(jsonString))
        } catch (error) {
          console.error("JSON parsing failed:", error);
        }
      } else {
        try {
          const cleanedResponse = data?.response.replace(/```json|```/g, '').trim();
          const jsonData = JSON.parse(cleanedResponse)
          setParsedStory(jsonData?.result);
        } catch (error) {
          console.log("JSON 부분을 찾을 수 없습니다.");
          console.log(error)
        }
      }
    } else {
      console.error(data.error)
    }
    setLoading(false)
  }

  const handleCreateSubtask = async (epicData:FetchedEpics[], storyData:IssueData[], projectData:string) => {
    setLoading(true)

    const response = await fetch('/project/[projectId]/sprint/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: `스토리와 프로젝트 정보에 기반한 sub-task를 5개 생성해 줘. 프로젝트 기술과 기능에 대한 정보는 다음과 같아. \n
        ${JSON.stringify(projectData, null, 2)} \n
        그리고, 현재 프로젝트의 에픽 정보는 다음과 같아. \n
        ${JSON.stringify(epicData, null, 2)} \n
        그리고, 이를 기반으로 현재 생성된 스토리 정보는 다음과 같아. \n
        ${JSON.stringify(storyData, null, 2)} \n
        세부 구현 사항: ${prompt[5]?.detail} \n
        버그 스토리 관련 세부 정보: ${prompt[5]?.detail} \n
        마지막으로, 이번 주 내가 담당한 부분은 ${prompt[0]?.detail}야. 하위 이슈 summary에 항상 ${prompt[0]?.detail}를 붙이고 내가 담당한 스토리를 기반으로 하위 이슈를 생성해 줘.`,
        type: 'sub-task'
       }),
    })

    const data = await response.json()
    console.log(data)
    
    if (response.ok) {
      const resultMatch = data?.response?.match(/result:\s*(\[[\s\S]*?\])\s*}/);

      if (resultMatch) {
        let jsonString = resultMatch[1];
        jsonString = jsonString.replace(/(\w+):/g, '"$1":')
        try {
          setParsedSubTask(JSON.parse(jsonString))
        } catch (error) {
          console.error("JSON parsing failed:", error);
        }
      } else {
        try {
          const cleanedResponse = data?.response.replace(/```json|```/g, '').trim();
          const jsonData = JSON.parse(cleanedResponse)
          setParsedSubTask(jsonData?.result);
        } catch (error) {
          console.log("JSON 부분을 찾을 수 없습니다.");
          console.log(error)
        }
      }
    } else {
      console.error(data.error)
    }
    setLoading(false)
  }

  const handleEpicModal = () => {
    setShowEpicModal(!showEpicModal)
  }

  useEffect(() => {
    getProjectInfo(projectId)
    .then((data) => {
      setProjectInfo(data)
    })
    .catch((error) => {
      console.log(error)
    })
  }, [])

  useEffect(() => {
    getEpics(projectId)
    .then((data) => {
      if (data?.length > 0) {
        setIsSprintPage(true)
        setEpics(data)
      }
      setIsFindEpic(false)
      console.log(data)
    })
    .catch((error) => {
      console.log(error)
      setIsFindEpic(false)
    })
    console.log(role)
  }, [])

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, parsedStory, parsedSubTask, loading])

  useEffect(() => {
    console.log(parsedStory)
  },[parsedStory, parsedSubTask])

  useEffect(() => {
    if (initialMessageSent) {
      const timer = setTimeout(() => {
      if (currentQuestionIndex < questions.length) {
          const botMessage = questions[currentQuestionIndex]?.message;
          setMessages((prev) => [...prev, { user: '', bot: botMessage }]);
          setCurrentQuestionIndex(prev => prev + 1);
          setAnimate(true);
          setIsInputDisabled(false)
      }
      }, 3000);
      setIsInputDisabled(true)
      return () => {
        clearTimeout(timer);
        setIsInputDisabled(false)
      };
    }
  }, [initialMessageSent]);

  useEffect(() => {
    if (messages.length === 0) {
        setInitialMessageSent(true);
      }
  }, [messages]);

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => setAnimate(false), 500)
      return () => clearTimeout(timer);
    }
  }, [animate])

  if (isFindEpic) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen h-screen overflow-hidden bg-gray-100 w-full">
        <Lottie
          loop
          animationData={FindEpicImg}
          play
          className="w-2/3 h-2/3"
        />
        <p className='text-xl text-gray-600'>프로젝트 에픽 조회 중...</p>
      </div>
    )
  }

  else if (!isSprintPage) {
    return (
      <div className="flex min-h-screen h-screen overflow-hidden bg-gray-100 w-full">
        <div className="flex-1 p-6 flex flex-col items-center justify-center overflow-hidden">
          <div className="w-[60%] h-[50%] flex justify-center items-center">
            <Lottie
              loop
              animationData={NoEpic}
              play
              className="w-full h-full"
            />
          </div>
          <div className="text-center text-gray-500 space-y-2 my-4">
            <p>아직 생성된 에픽이 없어요.</p>
            <p>AI 컨설턴트와 함께 전체 에픽 목록을 생성해 볼까요?</p>
          </div>
          <button
            onClick={() => setShowEpicModal(true)}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg"
          >
            에픽 생성하기
          </button>
          {showEpicModal && (
            <EpicModal isOpen={showEpicModal} onClose={handleEpicModal} projectId={projectId} />
          )}
        </div>
      </div>
    )
  }

  else return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <div className="flex-1 p-6 overflow-hidden">
        <div className="w-full mb-8 relative">
          <button className='w-[120px] h-[40px] absolute left-6 bg-gray-400 rounded text-white text-lg' onClick={() => setShowEpicModal(true)}>Epic 추가하기</button>
          <p className="text-xl text-gray-500 font-light text-center">
            AI와의 채팅을 통해 금주의 스프린트를 제작해 보세요{' '}
            <span role="img" aria-label="search">🔍</span>
          </p>
        </div>

        {/* Chat Area */}
        <div className="flex flex-col space-y-4 mb-6 overflow-y-auto h-[70vh] w-[90%] animate-fadeIn">
          <div className="flex items-start space-x-4">
            <Image src="/img/chatbot.png" alt="Chatbot" width={50} height={50} />
            <div className="bg-[#B2E0D9] text-gray-700 p-4 rounded-[0px_20px_20px_20px]">
              <p>안녕하세요! 저는 에픽/이슈 생성을 도와주는 AI컨설턴트, AIssue입니다.</p>
              <p>프로젝트의 작업 내용 및 일정에 맞춰, 이번 주 스프린트를 제작하겠습니다.</p>
            </div>
          </div>

          {/* User Messages and Bot Responses */}
          {messages?.map((msg, index) => (
            <div key={index} className="flex flex-col space-y-2 animate-fadeIn">
              {msg.user && (
                <div className="self-end max-w-sm p-3 bg-blue-300 text-gray-700 rounded-[20px_0px_20px_20px]">
                  {msg?.user}
                </div>
              )}
              {msg.bot && (
                <>
                  {msg.bot === '이번 주차의 에픽 목록은 다음과 같습니다. 추가로 작업할 기능이 있다면 알려 주세요.' && (
                    <div className='w-2/3 ml-14 bg-white rounded-lg p-4 space-y-2'>
                      {epics?.map((item, index) => (
                        item?.status !== '완료' && (
                          <div className='w-full h-20 border border-[#54B2A3] rounded p-2 relative' key={index}>
                            <div className="flex items-center my-1">
                              <img src={`/img/${item?.priority}.png`} alt="priority_img" className="w-5" />
                              <p className="text-sm text-gray-500 ml-1">{item?.key}
                                <span className="text-gray-500 text-xs font-normal ml-4">{item?.start_at?.substring(0,10)} - {item?.end_at?.substring(0,10)}</span>
                              </p>
                            </div>
                            <h1 className='font-bold text-md text-[#54B2A3] ml-2'>{item?.summary}</h1>
                            <div className={`absolute top-2 right-2 w-14 h-6 text-xs flex items-center justify-center rounded 
                              ${item?.status === '해야 할 일' ? 'bg-gray-200 text-gray-700' : 'bg-blue-200 text-blue-700'}`}>
                              {item?.status}
                            </div>
                          </div>
                        )
                      ))}
                    </div>
                  )}
                  <div className='flex items-start space-x-4 animate-fadeIn'>
                    <Image src="/img/chatbot.png" alt="Chatbot" width={50} height={50} />
                    <div className="self-start max-w-2xl p-3 bg-[#B2E0D9] text-gray-700 rounded-[0px_20px_20px_20px]">
                      {msg?.bot}
                    </div>
                  </div>
                  {index === 0 && (
                    <div className='w-2/3 ml-14 bg-white rounded-lg p-4 space-x-2 flex'>
                      {role.map((item, index) => (
                        <button key={index} className={`px-[8px] p-[8px] text-sm rounded border border-[#54B2A3] transition ease-in-out
                          ${userRole === item?.title ? 'bg-[#54B2A3] text-white font-bold scale-110' : 'text-[#54B2A3] bg-white'}
                          ${currentQuestionIndex !== 1 && 'cursor-not-allowed'}`}
                        onClick={() => setUserRole(item?.title)}
                        disabled={currentQuestionIndex !== 1}>
                          {item?.name}
                        </button>
                      ))}
                      <button onClick={() => {addPrompt('담당', userRole)}} disabled={!userRole || currentQuestionIndex !== 1}
                      className={`w-[80px] h-[40px] text-white text-md rounded ${userRole ? 'bg-blue-400' : 'cursor-not-allowed bg-gray-300'}`}
                      >다음</button>
                    </div>
                  )}
                  {msg.bot === '감사합니다. 이번 주차의 스프린트와 스토리 목록을 생성하겠습니다!' && parsedStory?.length > 0 && (
                    <div className="ml-14 mt-4 w-2/3 bg-white rounded-lg p-4 space-y-2">
                      <h3 className="text-lg font-bold text-gray-600">생성된 이슈 목록</h3>
                      <div className="space-y-2">
                        {parsedStory.map((issue, index) => (
                          <div className='w-full h-20 border border-[#54B2A3] rounded p-2 relative' key={index}>
                            <div className="flex items-center my-1">
                              <img src={`/img/${issue?.priority}.png`} alt="priority_img" className="w-5" />
                              <h1 className='font-bold text-md text-[#54B2A3] ml-2'>{issue?.summary}</h1>
                            </div>
                            <p className="text-sm ml-2">{issue?.description}</p>
                            <p className="text-sm text-gray-500 absolute right-2 top-2">Epic: {issue?.parent}</p>
                            <div className="absolute bottom-2 right-2 flex space-x-2">
                              {/* <button onClick={() => handleEdit(index, 'story')} className="bg-blue-400 text-xs w-12 h-6 rounded text-white">수정</button> */}
                              <button onClick={() => handleDelete(index, 'story')} className="bg-red-400 text-xs w-12 h-6 rounded text-white">삭제</button>
                            </div>
                          </div>
                        ))}
                      </div>
                      {isCreatingStory?
                      <button className="w-[180px] h-[40px] my-4 bg-[#54B2A3] duration-200 text-base font-bold text-white rounded hover:bg-[#B2E0D9] cursor-not-allowed flex items-center justify-center" disabled>
                        <img src="/svg/loading.svg" alt="Loading" className="animate-spin h-5 w-5 mr-3" />
                        저장하는 중...
                      </button> :
                      <button className='w-[180px] h-[40px] my-4 bg-[#54B2A3] duration-200 text-base font-bold text-white rounded hover:bg-[#B2E0D9]'
                      onClick={() =>fetchIssues(parsedStory, 'Story')}>스토리 JIRA에 등록하기</button>
                      }
                    </div>
                  )}
                  {msg.bot === '감사합니다. 해당 정보를 바탕으로 하위 이슈를 생성하겠습니다!' && parsedSubTask?.length > 0 && (
                    <div className="ml-14 mt-4 w-2/3 bg-white rounded-lg p-4 space-y-2">
                      <h3 className="text-lg font-bold text-gray-600">생성된 하위 이슈 목록</h3>
                      <div className="space-y-2">
                        {parsedSubTask.map((issue, index) => (
                          <div className='w-full h-20 border border-[#54B2A3] rounded p-2 relative' key={index}>
                            <div className="flex items-center my-1">
                              <img src={`/img/${issue?.priority}.png`} alt="priority_img" className="w-5" />
                              <h1 className='font-bold text-md text-[#54B2A3] ml-2'>{issue?.summary}</h1>
                            </div>
                            <p className="text-sm ml-2">{issue?.description}</p>
                            <p className="text-sm text-gray-500 absolute right-2 top-2">Story: {issue?.parent}</p>
                            <div className="absolute bottom-2 right-2 flex space-x-2">
                              {/* <button onClick={() => handleEdit(index, 'sub-task')} className="bg-blue-400 text-xs w-12 h-6 rounded text-white">수정</button> */}
                              <button onClick={() => handleDelete(index, 'sub-task')} className="bg-red-400 text-xs w-12 h-6 rounded text-white">삭제</button>
                            </div>
                          </div>
                        ))}
                      </div>
                      {isCreatingSubTask?
                      <button className="w-[180px] h-[40px] my-4 bg-[#54B2A3] duration-200 text-base font-bold text-white rounded hover:bg-[#B2E0D9] cursor-not-allowed flex items-center justify-center" disabled>
                        <img src="/svg/loading.svg" alt="Loading" className="animate-spin h-5 w-5 mr-3" />
                        저장하는 중...
                      </button> :
                      <button className='w-[180px] h-[40px] my-4 bg-[#54B2A3] duration-200 text-base font-bold text-white rounded hover:bg-[#B2E0D9]'
                      onClick={() =>fetchIssues(parsedSubTask, 'Sub-Task')}>하위 이슈 등록하기</button>
                      }
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-start space-x-4">
              <Image src="/img/chatbot.png" alt="Chatbot" width={50} height={50} />
              <Lottie
                loop
                animationData={LoadingImg}
                play
                className="w-32"
              />
              <p className='text-gray-700'>Loading ...</p>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        {
          inputList?.length > 0 && (
            <button onClick={() => addPrompt(questions[currentQuestionIndex - 1]?.type)}
              className='relative bottom-12 left-4 w-24 h-10 text-lg text-white rounded bg-orange-400 animate-fadeIn'>다음 단계</button>
          )
        }
        {/* Input Area Fixed to Bottom */}
        <div className="fixed bottom-5 w-[70%] bg-white p-4 shadow-md flex items-center border-2 border-[#4D86FF] rounded-[10px]">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSubmit()
              }
            }}
            placeholder="AI에게 질문 입력하기 ..."
            className="flex-1 border-none focus:outline-none"
            disabled={isInputDisabled}
          />
          <button
            onClick={handleSubmit}
            className="ml-4 bg-blue-300 text-white p-3 rounded-full"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-9H9V7h2v2zm0 4H9v-2h2v2z" />
            </svg>
          </button>
        </div>
        {showEpicModal && (
          <EpicModal isOpen={showEpicModal} onClose={handleEpicModal} projectId={projectId} />
        )}
      </div>
    </div>
  )
}