'use client';

import React, { useState, useEffect } from 'react';
import { getProjectInfo, getProjectFunctions, createProject, updateProjectFunctions } from '@/api/project';
import { jsPDF } from 'jspdf';
import { useDropzone } from 'react-dropzone';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
// import 'highlight.js/styles/github.css';
// import 'jspdf-autotable';
import pretendardFontBase64 from './PretendardBase64'; // Base64 파일 import


interface FunctionDetail {
  title: string;
  description: string;
}

interface ProjectInfo {
  projectImage?: string;
  title: string;
  description: string;
  beSkill: string;
  feSkill: string;
  infraSkill: string;
}

interface PortfolioBlock {
  id: string;
  type: 'text' | 'image' | 'code';
  content: string;
  scale?: number; // 이미지 크기 조절을 위한 속성
}

export default function InfoPage({
  params,
}: {
  params: {
    projectId: string;
  };
}) {
  const { projectId } = params;
  const [projectInfo, setProjectInfo] = useState<ProjectInfo | null>(null);
  const [isFunctionEditMode, setIsFunctionEditMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedProjectInfo, setEditedProjectInfo] = useState<ProjectInfo | null>(null);
  const [editedFunctions, setEditedFunctions] = useState<FunctionDetail[]>([]);

  const [portfolioBlocks, setPortfolioBlocks] = useState<PortfolioBlock[]>([]);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가


  // 포트폴리오
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': [],
    },
    onDrop: (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const imageDataUrl = event.target?.result as string;
          setPortfolioBlocks((prevBlocks) => [
            ...prevBlocks,
            {
              id: `block-${Date.now()}`,
              type: 'image',
              content: imageDataUrl,
              scale: 50,
            },
          ]);
        };
        reader.readAsDataURL(file);
      });
    },
  });

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const result = await getProjectInfo(projectId);
        setProjectInfo(result);
        setEditedProjectInfo(result);
      } catch (error) {
        console.error('Failed to fetch project info:', error);
      }
    };

    const fetchProjectFunctions = async () => {
      try {
        const functions = await getProjectFunctions(projectId);
        setEditedFunctions(functions);
      } catch (error) {
        console.error('Failed to fetch project functions:', error);
      }
    };

    fetchProjectData();
    fetchProjectFunctions();
  }, [projectId]);

  const handleEditClick = async () => {
    if (isEditMode && editedProjectInfo) {
      try {
        const projectData = {
          jiraId: projectId,
          name: editedProjectInfo.title,
          description: editedProjectInfo.description,
          feSkill: editedProjectInfo.feSkill,
          beSkill: editedProjectInfo.beSkill,
          infraSkill: editedProjectInfo.infraSkill,
          deleteImage: false,
        };

        await createProject(projectData);
        setIsEditMode(false);
        const updatedProjectInfo = await getProjectInfo(projectId);
        setProjectInfo(updatedProjectInfo);
      } catch (error) {
        console.error('Failed to save project:', error);
      }
    } else {
      setIsEditMode(true);
    }
  };

  const handleFunctionEditClick = async () => {
    if (isFunctionEditMode) {
      try {
        const filteredFunctions = editedFunctions.filter(
          (func) => func.title.trim() !== '' || func.description.trim() !== ''
        );
        await updateProjectFunctions(projectId, filteredFunctions);
        setEditedFunctions(filteredFunctions);
      } catch (error) {
        console.error('Failed to update project functions:', error);
      }
    }
    setIsFunctionEditMode(!isFunctionEditMode);
  };

  const handleInputChange = (field: keyof ProjectInfo, value: string) => {
    if (editedProjectInfo) {
      setEditedProjectInfo({
        ...editedProjectInfo,
        [field]: value,
      });
    }
  };

  const handleFunctionChange = (index: number, field: keyof FunctionDetail, value: string) => {
    const updatedFunctions = [...editedFunctions];
    updatedFunctions[index] = {
      ...updatedFunctions[index],
      [field]: value,
    };
    setEditedFunctions(updatedFunctions);
  };

  const handleAddFunction = () => {
    setEditedFunctions([...editedFunctions, { title: '', description: '' }]);
  };

  if (!projectInfo || !editedProjectInfo) {
    return <div>Loading...</div>;
  }



  // ai 포트폴리오
  // GPT API 요청 함수
  const fetchGptPortfolioData = async (): Promise<PortfolioBlock[]> => {
    if (!projectInfo) return [];
  
    const prompt = `
      아래 프로젝트 정보를 바탕으로, 포트폴리오 내용을 문장 형식으로 작성하세요. 다음 내용을 포함해야 합니다:
  
      1. **프로젝트 소개**: 프로젝트명, 설명, 목적, 주요 기능에 대한 요약.
      2. **기술 스택**: 프로젝트에서 사용된 기술 스택과 해당 기술의 역할.
      3. **주요 기능**: 각 기능의 목적과 세부 설명.
      4. **프로젝트 성과 및 결론**: 프로젝트에서 얻은 성과와 느낀 점.
  
      반환 형식은 다음 JSON 예시와 같아야 합니다:
      [
        { "type": "text", "content": "프로젝트 소개: 이 프로젝트는 ..." },
        { "type": "text", "content": "기술 스택: 프론트엔드에서는 React..." },
        { "type": "text", "content": "주요 기능: 사용자 관리 - 회원 가입 및 로그인 ..." },
        { "type": "text", "content": "성과 및 결론: 이 프로젝트를 통해 ..." }
      ]
  
      ### 프로젝트 정보 ###
      - 프로젝트명: ${projectInfo.title}
      - 프로젝트 설명: ${projectInfo.description}
      - 기술 스택:
        - 프론트엔드: ${projectInfo.feSkill}
        - 백엔드: ${projectInfo.beSkill}
        - 인프라: ${projectInfo.infraSkill}
      - 기능 상세:
        ${editedFunctions
          .map(
            (func, idx) =>
              `${idx + 1}. ${func.title || 'N/A'} - ${func.description || 'N/A'}`
          )
          .join('\n')}
    `;
  
    try {
      const response = await fetch('/project/[projectId]/info/generatePortfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
  
      if (!response.ok) {
        const errorDetails = await response.json();
        console.error('Error fetching GPT portfolio data:', errorDetails);
        return [];
      }
  
      const data = await response.json();
      const blocks = data.choices[0]?.message?.content || '[]'; // 데이터 검증
      /* eslint-disable @typescript-eslint/no-explicit-any */
      return JSON.parse(blocks).map((block: any, index: number) => ({
        id: `block-${Date.now()}-${index}`,
        type: block.type,
        content: block.content,
        scale: block.type === 'image' ? 100 : undefined,
      }));
    } catch (error) {
      console.error('Error fetching GPT portfolio data:', error);
      return [];
    }
    /* eslint-disable @typescript-eslint/no-explicit-any */
  };
  
  // const fetchGptPortfolioData = async (): Promise<PortfolioBlock[]> => {
  //   if (!projectInfo) return [];
  //   const prompt = `
  //         아래 프로젝트 정보를 바탕으로, 포트폴리오 내용을 문장 형식으로 작성하세요. 다음 내용을 포함해야 합니다:

  // 1. **프로젝트 소개**: 프로젝트명, 설명, 목적, 주요 기능에 대한 요약.
  // 2. **기술 스택**: 프로젝트에서 사용된 기술 스택과 해당 기술의 역할.
  // 3. **주요 기능**: 각 기능의 목적과 세부 설명.
  // 4. **프로젝트 성과 및 결론**: 프로젝트에서 얻은 성과와 느낀 점.

  // 반환 형식은 다음 JSON 예시와 같아야 합니다:
  // [
  //   { "type": "text", "content": "프로젝트 소개: 이 프로젝트는 ..." },
  //   { "type": "text", "content": "기술 스택: 프론트엔드에서는 React..." },
  //   { "type": "text", "content": "주요 기능: 사용자 관리 - 회원 가입 및 로그인 ..." },
  //   { "type": "text", "content": "성과 및 결론: 이 프로젝트를 통해 ..." }
  // ]

  // ### 프로젝트 정보 ###
  // - 프로젝트명: ${projectInfo.title}
  // - 프로젝트 설명: ${projectInfo.description}
  // - 기술 스택:
  //   - 프론트엔드: ${projectInfo.feSkill}
  //   - 백엔드: ${projectInfo.beSkill}
  //   - 인프라: ${projectInfo.infraSkill}
  // - 기능 상세:
  //   ${editedFunctions
  //       .map(
  //         (func, idx) =>
  //           `${idx + 1}. ${func.title || 'N/A'} - ${func.description || 'N/A'}`
  //       )
  //       .join('\n')}

  // JSON 형식으로 반환하되, 코드 블록(\`\`\`json)은 포함하지 말고 순수 JSON만 반환하세요.
  //       `;

  //   try {
  //     const response = await fetch('https://api.openai.com/v1/chat/completions', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
  //       },
  //       body: JSON.stringify({
  //         model: 'gpt-4o',
  //         messages: [{ role: 'user', content: prompt }],
  //         max_tokens: 2000,
  //       }),
  //     });

  //     const data = await response.json();
  //     const rawContent = data.choices[0].message.content;
  
  //     // JSON 코드 블록 제거 (```json ... ```)
  //     const sanitizedContent = rawContent.replace(/```json|```/g, '');
  
  //     // JSON 파싱
  //     const blocks = JSON.parse(sanitizedContent);

  //     /* eslint-disable @typescript-eslint/no-explicit-any */
  //     return blocks.map((block: any, index: number) => ({
  //       id: `block-${Date.now()}-${index}`,
  //       type: block.type,
  //       content: block.content,
  //       scale: block.type === 'image' ? 100 : undefined,
  //     }));
  //   } catch (error) {
  //     console.error('Error fetching GPT portfolio data:', error);
  //     return [];
  //   }
  // };



  // AI 포트폴리오 생성
  const generatePortfolio = async () => {
    setIsLoading(true); // 로딩 시작
    try {
      const generatedBlocks = await fetchGptPortfolioData();
      setPortfolioBlocks((prevBlocks) => [...prevBlocks, ...generatedBlocks]);
    } catch (error) {
      console.error('Error generating portfolio:', error);
    } finally {
      setIsLoading(false); // 로딩 종료
    }
  };


  // 포트폴리오
  // 블록 추가
  const handleAddBlock = (type: 'text' | 'image' | 'code') => {
    setPortfolioBlocks([
      ...portfolioBlocks,
      { id: `block-${Date.now()}`, type, content: '', scale: 100 },
    ]);
  };

  // 블록 내용 변경
  const handleBlockChange = (id: string, value: string) => {
    setPortfolioBlocks((prevBlocks) =>
      prevBlocks.map((block) => (block.id === id ? { ...block, content: value } : block))
    );
  };

  // 블록 삭제
  const handleDeleteBlock = (id: string) => {
    setPortfolioBlocks((prevBlocks) => prevBlocks.filter((block) => block.id !== id));
  };

  // 이미지 크기 조절
  const handleScaleChange = (id: string, newScale: number) => {
    setPortfolioBlocks((prevBlocks) =>
      prevBlocks.map((block) =>
        block.id === id && block.type === 'image' ? { ...block, scale: newScale } : block
      )
    );
  };

  // 블록 순서 변경 (드래그 앤 드롭)
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(portfolioBlocks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setPortfolioBlocks(items);
  };
  /* eslint-enable @typescript-eslint/no-explicit-any */


  // PDF 생성
  const generatePdf = async () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 180; // 페이지 너비
    const pageHeight = 280; // 페이지 높이 (마진 고려)
    let currentY = 15; // Y축 시작 위치

    // 폰트 추가
    doc.addFileToVFS('Pretendard-Black.ttf', pretendardFontBase64);
    doc.addFont('Pretendard-Black.ttf', 'Pretendard', 'normal');
    doc.setFont('Pretendard', 'normal');


    // 이미지 추가 함수
    const addImageToPdf = (block: PortfolioBlock): Promise<void> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = block.content;

        img.onload = () => {
          const originalWidth = img.width;
          const originalHeight = img.height;

          const scale = block.scale ? block.scale / 100 : 1;
          const maxWidth = pageWidth * scale;
          const maxHeight = pageHeight - currentY - 15; // 여유 공간 계산

          let imgWidth = originalWidth;
          let imgHeight = originalHeight;

          // 비율 유지하며 크기 조정
          const widthRatio = maxWidth / imgWidth;
          const heightRatio = maxHeight / imgHeight;
          const scaleRatio = Math.min(widthRatio, heightRatio, 1);

          imgWidth *= scaleRatio;
          imgHeight *= scaleRatio;

          // 이미지가 페이지에 들어가지 않을 경우 페이지 넘김
          if (currentY + imgHeight > pageHeight - 15) {
            doc.addPage();
            currentY = 15;
          }

          // 이미지 추가
          doc.addImage(img, 'JPEG', 15, currentY, imgWidth, imgHeight);
          currentY += imgHeight + 15; // 이미지 아래 여백
          resolve();
        };

        img.onerror = (err) => {
          console.error('이미지 추가 중 오류 발생:', err);
          reject(err);
        };
      });
    };

    // 코드 블록 그리기 함수
    const drawCodeBlock = (lines: string[]): Promise<number> => {
      return new Promise((resolve) => {
        const lineHeight = 7; // 코드 줄 높이
        const padding = 5; // 코드 블록 내부 여백
        const blockWidth = pageWidth - 30;

        const blockHeight = lines.length * lineHeight + padding * 2;

        // 페이지 넘김 처리
        if (currentY + blockHeight > pageHeight) {
          doc.addPage();
          currentY = 15;
        }

        // 코드 블록 배경
        doc.setDrawColor(200, 200, 200); // 연한 회색
        doc.setFillColor(240, 240, 240); // 밝은 배경색
        doc.roundedRect(15, currentY, blockWidth, blockHeight, 3, 3, 'F');

        // 코드 줄 배경 (번갈아 가며 색상)
        lines.forEach((_, index) => {
          if (index % 2 === 0) {
            doc.setFillColor(230, 230, 230); // 짝수 줄 배경
            doc.rect(15, currentY + padding + index * lineHeight, blockWidth, lineHeight, 'F');
          }
        });

        // 코드 내용
        doc.setFont('Pretendard', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(50, 50, 50);

        let lineY = currentY + padding + 5; // 첫 줄 Y 좌표
        lines.forEach((line) => {
          doc.text(line, 20, lineY);
          lineY += lineHeight;
        });

        resolve(blockHeight);
      });
    };

    // 블록 처리 순서 보장
    for (const block of portfolioBlocks) {
      if (block.type === 'text') {
        doc.setFontSize(12);
        const lines = doc.splitTextToSize(block.content, pageWidth - 20);
        for (const line of lines) {
          doc.text(line, 15, currentY);
          currentY += 10;
          if (currentY > pageHeight) {
            doc.addPage();
            currentY = 15;
          }
        }
        currentY += 5; // 텍스트 블록 아래 여백
      } else if (block.type === 'image') {
        try {
          await addImageToPdf(block); // 이미지 처리
        } catch (error) {
          console.error('이미지 추가 실패:', error);
        }
      } else if (block.type === 'code') {
        const codeLines = block.content.split('\n');
        const formattedLines = codeLines.flatMap((line) =>
          doc.splitTextToSize(line, pageWidth - 40)
        );

        const lineHeight = 7;
        const blockPadding = 5;

        let remainingLines = [...formattedLines];
        while (remainingLines.length > 0) {
          const availableHeight = pageHeight - currentY - blockPadding * 2;
          const fitLines = Math.floor(availableHeight / lineHeight);

          // fitLines가 1보다 작으면 페이지 넘김
          if (fitLines < 1) {
            doc.addPage();
            currentY = 15;
            continue;
          }

          const linesToDraw = remainingLines.slice(0, fitLines);

          const blockHeight = await drawCodeBlock(linesToDraw);
          currentY += blockHeight + 15; // currentY 업데이트

          remainingLines = remainingLines.slice(fitLines);

          if (remainingLines.length > 0) {
            doc.setFontSize(10);
            doc.setTextColor(150, 150, 150);
            doc.text('계속됨...', pageWidth / 2, pageHeight - 5, { align: 'center' });
            doc.addPage();
            currentY = 15;
          }
        }
      }
    }

    // PDF를 Blob으로 출력
    const pdfBlob = doc.output('blob');

    // Blob URL 생성
    const pdfUrl = URL.createObjectURL(pdfBlob);
    setPreviewPdfUrl(pdfUrl);
  };



  return (
    <div className="p-4 md:p-6 bg-gray-100">
      <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-[#5B586E]">프로젝트 정보</h1>

      <div className="flex flex-col lg:flex-row lg:space-x-6">
        <div className="flex-1 space-y-4 md:space-y-6">
          {/* 프로젝트 개요 섹션 */}
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-[#7498E5]">프로젝트 개요</h2>
              <button
                onClick={handleEditClick}
                className="text-white bg-[#7498E5] px-3 py-2 md:px-4 md:py-2 rounded-lg"
              >
                {isEditMode ? '저장' : '수정'}
              </button>
            </div>

            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
              <img
                src={projectInfo.projectImage || '/img/chatbot.png'}
                alt="프로젝트 로고"
                className="w-16 h-16"
              />
              <div className="grid grid-cols-1 md:grid-cols-[auto_auto_1fr] gap-x-4 gap-y-4 w-full">
                {(['title', 'description', 'beSkill', 'feSkill', 'infraSkill'] as const).map(
                  (field, idx) => (
                    <React.Fragment key={idx}>
                      <label className="text-[#7498E5] text-left md:text-center font-semibold">
                        {field === 'title'
                          ? '프로젝트명'
                          : field === 'description'
                            ? '주제'
                            : `${field.split('Skill')[0]} Skill`}
                      </label>
                      <div className="hidden md:block h-full border-l border-[#D9D9D9]"></div>
                      {isEditMode ? (
                        <input
                          className="border border-gray-300 rounded p-2 w-full"
                          value={editedProjectInfo[field] || ''}
                          onChange={(e) =>
                            handleInputChange(field, e.target.value)
                          }
                        />
                      ) : (
                        <p className="text-gray-800">{projectInfo[field]}</p>
                      )}
                    </React.Fragment>
                  )
                )}
              </div>
            </div>
          </div>

          {/* 프로젝트 상세 섹션 */}
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-[#54B2A3]">프로젝트 상세</h2>
              <button
                onClick={handleFunctionEditClick}
                className="text-white bg-[#54B2A3] px-3 py-2 md:px-4 md:py-2 rounded-lg"
              >
                {isFunctionEditMode ? '저장' : '수정'}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg">
                <thead>
                  <tr>
                    <th className="border-b px-4 py-2 text-center text-gray-600 w-1/3">기능명</th>
                    <th className="border-b px-4 py-2 text-center text-gray-600 w-2/3">내용</th>
                  </tr>
                </thead>
                <tbody>
                  {editedFunctions.map((func, index) => (
                    <tr key={index}>
                      <td className="border-b px-4 py-2">
                        {isFunctionEditMode ? (
                          <input
                            className="border border-gray-300 rounded p-1 w-full"
                            value={func.title}
                            onChange={(e) => handleFunctionChange(index, 'title', e.target.value)}
                          />
                        ) : (
                          func.title
                        )}
                      </td>
                      <td className="border-b px-4 py-2">
                        {isFunctionEditMode ? (
                          <input
                            className="border border-gray-300 rounded p-1 w-full"
                            value={func.description}
                            onChange={(e) => handleFunctionChange(index, 'description', e.target.value)}
                          />
                        ) : (
                          func.description
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {isFunctionEditMode && (
              <div className="flex justify-center mt-3">
                <button
                  onClick={handleAddFunction}
                  className="text-white bg-[#54B2A3] px-3 py-2 rounded-lg"
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* 포트폴리오 제작 */}
      {/* 포트폴리오 제작 */}
      <br />
      <div className="bg-gray-100">
        <div className="flex justify-between items-center">
          <h1 className="mt-4 text-xl md:text-2xl font-bold mb-4 md:mb-6 text-[#5B586E]">
            포트폴리오 제작
          </h1>
          <button
            onClick={generatePortfolio}
            className="text-white bg-[#FF6347] px-4 py-2 rounded-lg flex items-center justify-center"
            style={{ height: '50px', minWidth: '120px' }}
            disabled={isLoading} // 로딩 중 버튼 비활성화
          >
            {isLoading ? (
              <span className="loader">생성 중</span> // 로딩 스피너
            ) : (
              'AI로 생성'
            )}
          </button>
        </div>
        {/* Drag and Drop Context */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="blocks">
            {(provided) => (
              <div
                className="space-y-4"
                {...provided.droppableProps}
                ref={provided.innerRef}

              >
                {portfolioBlocks.map((block, index) => (
                  <Draggable key={block.id} draggableId={block.id} index={index}>
                    {(provided) => (
                      <div
                        className="bg-white p-4 rounded-lg shadow-md flex flex-col space-y-2"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        {block.type === 'image' ? (
                          <div>
                            <img
                              src={block.content}
                              alt="Uploaded"
                              className="rounded-lg mx-auto"
                              style={{ maxWidth: '100%', height: 'auto', maxHeight: '200px' }}
                            />
                            <div className="flex items-center space-x-2 mt-2">
                              {/* <label htmlFor={`scale-${block.id}`} className="text-sm text-gray-600">
                                크기 조절:
                              </label> */}
                              <input
                                type="range"
                                id={`scale-${block.id}`}
                                min="20"
                                max="100"
                                value={block.scale || 100}
                                onChange={(e) =>
                                  handleScaleChange(block.id, parseInt(e.target.value))
                                }
                                className="w-full"
                              />
                              <span className="text-sm text-gray-600">
                                {block.scale || 100}%
                              </span>
                            </div>
                          </div>
                        ) : (
                          <textarea
                            value={block.content}
                            onChange={(e) => handleBlockChange(block.id, e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2"
                            rows={4}
                            placeholder={block.type === 'text' ? '텍스트 입력' : '코드 입력'}
                          />
                        )}
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleDeleteBlock(block.id)}
                            className="bg-red-500 text-white px-2 py-1 rounded-md"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        {/* 이미지 업로드 및 블록 추가 버튼 */}
        <div className="flex flex-col md:flex-row md:space-x-4 mt-4">
          <div
            {...getRootProps()}
            className="bg-gray-200 p-4 rounded-lg border-dashed border-2 border-gray-400 text-center cursor-pointer mb-4 md:mb-0"
            style={{ flex: 1 }}
          >
            <input {...getInputProps()} />
            <p className="text-gray-500">이미지를 드래그 앤 드롭하거나 클릭하여 업로드하세요</p>
          </div>
          <div className="flex flex-col space-y-2 md:space-y-0 md:flex-row md:space-x-4">
            <button
              onClick={() => handleAddBlock('text')}
              className="text-white bg-[#7498E5] px-3 py-2 md:px-4 md:py-2 rounded-lg"
            >
              텍스트 추가
            </button>
            <button
              onClick={() => handleAddBlock('code')}
              className="text-white bg-[#54B2A3] px-3 py-2 md:px-4 md:py-2 rounded-lg"
            >
              코드 추가
            </button>
          </div>
        </div>

        <button
          onClick={generatePdf}
          className="bg-purple-500 text-white px-4 py-2 rounded-lg mt-6"
        >
          PDF 생성
        </button>
        {previewPdfUrl && (
          <div className="mt-4">
            <iframe
              src={previewPdfUrl}
              className="w-full h-[48rem] border"
              title="PDF Preview"
            ></iframe>
          </div>
        )}
      </div>

    </div>
  );
}
