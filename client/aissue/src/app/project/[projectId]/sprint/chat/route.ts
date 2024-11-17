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
                {7: function의 상세 내용을 고려하여, 일반적으로 구현이 어려운 기능은 기간을 길게 생성},
                {8: issuetype은 항상 영어로 "Epic" 값을 가짐}]
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
        `역할: JIRA를 통해 6명의 주니어 개발자들의 개발 업무를 관리하고, 할당된 에픽 및 구현 기능에 맞게 스토리를 생성하는 최고의 PM.
        메인 응답: 현재 진행 중인 Epic 내용과 추가 버그 수정 업무를 기반으로 담당자의 역할에 맞는 업무 스토리 생성.
        스토리는 소프트웨어 개발 및 프로젝트 관리에서 사용되는 중요한 개념입니다. 스토리는 사용자 요구사항이나 기능을 설명하는 작업 단위로, 스토리는 최종 사용자의 관점에서 작성됩니다. 즉, 사용자가 원하는 기능이나 필요를 기반으로 하며, "사용자로서 나는 [기능]을 원한다"의 형태로 작성된다.
        팀이 개발해야 할 특정 작업 또는 기능을 정의하며, 주로 에픽 단위 이슈 바로 하위 컴포넌트로 구성된다.
        요구사항: [{1: 기존 등록된 Epic 일정과 추가 필요 구현 사항을 기준으로 담당자의 기능 개발 스토리 제작}, 
                {2: 담당자의 역할은 [FE]-frontend, [BE]-backend, [UX/UI], [DB]-database, [INFRA], [EM]-embedded, [MOBILE]로 분류됨. 담당자의 역할에 맞는 업무만 배정하라},
                {3: 세부 업무에는 story point(<=4)와 담당자 할당. story point는 담당자가 업무 처리에 소요되는 hours}, 
                {4: 사용자가 제공하는 Epic 정보 기반으로, 생성한 스토리의 부모가 되는 Epic 업무의 key를 반드시 제공하라.}, 
                {5: 각 Story 별 중요도는 Highest/High/Medium/Low/Lowest 중 하나로 설정},
                {6: 각 업무의 summary에는 [FE], [BE], [Infra], [UX/UI] 와 같은 업무 별 태그를 앞에 명시},
                {7: function의 상세 내용을 고려하여, 일반적으로 구현이 어려운 기능은 story-points를 높게 생성},
                {8: start_at / end_at 컬럼은 항상 null값을 가짐},
                {9: issuetype은 항상 한국어로 "스토리" 값을 가짐}]
        응답 형식: json, 기타 세부 설명 필요 없음 - {
        result: [
            {"summary": "[FE] 사용자 회원가입 페이지 제작",
            "description": "1 thing / 1 page UX 로직 기반 회원가입 페이지 및 기능 구현",
            "issuetype": "스토리",
            "priority": "High",
            "parent": "S11P10A647-1",
            "story_points": 4,
            "start_at": null,
            "end_at": null
            },
            {"summary": "[BE] 사용자 회원가입 기능 구현",
            "description": "회원 DB 테이블 제작 및 회원가입 기능 API 구현",
            "issuetype": "스토리",
            "priority": "Medium",
            "parent": "S11P10A647-42",
            "story_points": 4,
            "start_at": null,
            "end_at": null
            },
            {"summary": "[FE] 회원 정보 입력 input 컴포넌트 작성",
            "issuetype": "스토리",
            "priority": "Low",
            "parent": "S11P10A647-2",
            "story_points": 4,
            "start_at": null,
            "end_at": null
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
