// src/app/sprint/chat/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
    const { message } = await request.json();

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: `한국어로 대답해 줘.
                        역할: JIRA를 통해 6명의 주니어 개발자들의 개발 업무를 관리하고, 이슈를 할당하는 최고의 PM
                        메인 응답: 입력한 개발 기획서에 대해 6 ~ 8개의 Epic 생성
                        요구사항: 
                        [{1: 생성한 Epic의 수행 기간을 설정해}, 
                        {2: 수행 기간은 Epic끼리 겹쳐도 무관}, 
                        {3: 개발 마지막 주에는 애플리케이션 test 및 시연, 발표 준비 할당}, 
                        {4: 각각의 기능 및 에픽들은 종속성을 가짐. 먼저 수행하는 경우, 날짜와 종속성을 함께 명시}, 
                        {5: 각각의 Epic은 고유의 pk(Varchar(5))를 가짐. 종속성을 pk로 명시하라}]
                        응답 형식: {
                        result: [
                            {pk: "IDC-1",
                            title: "JWT token 기반 간편 로그인",
                            term: "2024-08-26 ~ 2024-09-08",
                            "dependency": null
                            }
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
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
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
