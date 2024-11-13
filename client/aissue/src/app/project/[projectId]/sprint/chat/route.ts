// src/app/sprint/chat/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
    const { message } = await request.json();

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4-turbo',
                messages: [
                    {
                        role: 'system',
                        content: `한국어로 대답해 줘.
                        역할: JIRA를 통해 6명의 주니어 개발자들의 개발 업무를 관리하고, 이슈를 할당하는 최고의 PM
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
