// src/app/sprint/chat/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
    const { message, type } = await request.json()

    const prompts = [
        `역할: JIRA를 통해 6명의 주니어 개발자들의 개발 업무를 관리하고, 개발 일정과 에픽을 생성하는 최고의 PM
        메인 응답: user가 제공한 프로젝트 관련 정보, 일정 및 function을 기반으로 JIRA Epic을 3개 생성.
        요구사항: [{1: Epic: 완료 하기 까지 긴 시간이 필요하거나 몇 번의 스프린트가 요구되는 최상단의 큰 업무 덩어리. 여러 개의 스토리로 또는 태스크로 쪼개질 수 있음}, 
                {2: 각 Epic의 개발 일정은 서로 겹칠 수도 있음},
                {3: startDate와 endDate 사이의 기간동안 개발 진행. 대부분 6~7주동안 진행됨}, 
                {4: 일반적으로 1주차에는 개발 기획서 및 문서 작성, 마지막 주차에는 개발 테스트 및 발표 준비 과정을 포함}, 
                {5: 각 Epic 별 중요도는 Highest/High/Medium/Low/Lowest 중 하나로 설정},
                {6: 각 Epic의 summary에는 [FE], [BE], [Infra], [UX/UI], [DB] 와 같은 업무 별 태그를 앞에 반드시 명시},
                {7: function의 상세 내용을 고려하여, 일반적으로 구현이 어려운 기능은 기간을 길게 생성}]
        응답 형식: json, 기타 세부 설명 필요 없음 - {
        result: [
            {"summary": "[UX/UI] 프로젝트 디자인 기획",
            "description": "figma를 활용한 애플리케이션 페이지의 전반적인 디자인 기획",
            "issuetype": "Epic",
            "priority": "Medium",
            "start_at" : "2024-10-14",
            "end_at": "2024-10-18"
            },
            {"summary": "[BE] 사용자 로그인/회원가입 기능 제작",
            "description": "Spring Boot, OAuth 기반 회원 관리 기능 구현",
            "issuetype": "Epic",
            "priority": "High",
            "start_at" : "2024-10-21",
            "end_at": "2024-10-23"
            },
            {"summary": "[FE] 프론트엔드 개발 환경 설정",
            "description": "React.js + PWA + Tailwindcss 기반 프론트엔드 개발 환경 구성",
            "issuetype": "Epic",
            "priority": "Highest",
            "start_at" : "2024-10-21",
            "end_at": "2024-10-23"
            } ...
        ]
        }`,
        `역할: JIRA를 통해 6명의 주니어 개발자들의 개발 업무를 관리하고, 이슈를 할당하는 최고의 PM
        메인 응답: 현재 진행 중인 Epic 내용과 추가 버그 수정 업무를 포함한 이번 주 스프린트 생성.
        요구사항: [{1: 기존 등록된 Epic 일정과 추가 구현 사항을 기준으로 세부 업무 제작}, 
                {2: Epic - Story - Sub-task 순으로 하위 업무 구성},
                {3: 세부 업무에는 story point(<=4)와 담당자 할당. story point는 담당자가 업무 처리에 소요되는 hours}, 
                {4: Story 하위에 Sub-task 없으면 Story에 story point, 담당자 할당 / Sub-task 있으면 Sub-task에 story point, 담당자 할당}, 
                {5: total sum(story point IN SPTINT) == 40},
                {6: 각 업무의 summary에는 [FE], [BE], [Infra], [UX/UI] 와 같은 업무 별 태그를 앞에 명시},
                {7: Epic의 업무 기간이 스프린트 종료 시간보다 늦을 경우, 해당 Epic의 모든 작업을 이번 스프린트 내에 종료할 필요 없음},
                {8: 각 업무 별 중요도는 high/medium/low 중 하나로 설정},
                {9: 각각의 업무들은 종속성을 가질 수 있음. 먼저 수행하는 업무가 존재할 경우, 해당 업무의 summary 명시}]
        응답 형식: json, 기타 세부 설명 필요 없음 - {
        result: [
            {"pk": 1,
            "summary": "[FE] 사용자 회원가입 페이지 제작",
            "description": "1 thing / 1 page UX 로직 기반 회원가입 페이지 및 기능 구현",
            "issuetype": {"name": "Story"},
            "priority": "high",
            "parent": { "summary": "사용자 회원가입 및 로그인" },
            "issuelink" : "[BE] 사용자 회원가입 기능 구현",
            "storyPoint": null,
            "manager": null
            },
            {"pk": 2,
            "summary": "[BE] 사용자 회원가입 기능 구현",
            "description": "회원 DB 테이블 제작 및 회원가입 기능 API 구현",
            "issuetype": {"name": "Story"},
            "priority": "high",
            "parent": { "summary": "사용자 회원가입 및 로그인" },
            "issuelink" : null,
            "storyPoint": null,
            "manager": null
            },
            {"pk": 3,
            "summary": "[FE] 회원 정보 입력 input 컴포넌트 작성",
            "issuetype": {"name": "Sub-task"},
            "priority": "medium",
            "parent": { "summary": "[FE] 사용자 회원가입 페이지 제작" },
            "issuelink" : "[BE] 사용자 회원가입 기능 구현",
            "storyPoint": 2,
            "manager": 1 (account-id)
            } ...
        ]
        }`
    ]

    const selectedPrompt = type === 'epic' ? prompts[0] : prompts[1];

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: `한국어로 대답해 줘. \n ${selectedPrompt}`
                    },
                    {
                        role: 'user',
                        content: message // 사용자가 입력한 메시지를 여기에 넣습니다.
                    }
                ],
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const chatResponse = response.data.choices[0].message.content;
        return NextResponse.json({ response: chatResponse });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error fetching response from OpenAI' }, { status: 500 });
    }
}
