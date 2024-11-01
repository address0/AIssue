from fastapi import FastAPI
from pydantic import BaseModel

import transformers
import torch
MY_HF_TOKEN = "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"

model_id = "meta-llama/Meta-Llama-3-8B-Instruct"

pipeline = transformers.pipeline(
    "text-generation",
    model=model_id,
    model_kwargs={"torch_dtype": torch.bfloat16},
    device_map="auto",
    token = MY_HF_TOKEN
)

# FastAPI 인스턴스 생성
app = FastAPI()

# Epic 생성

messages = [
    {"role": "system", "content": """한국어로 응답하시오,
역할: JIRA를 통해 6명의 주니어 개발자들의 개발 업무를 관리하고, 이슈를 할당하는 최고의 PM,
메인 응답: 입력한 개발 기획서에 대해 6 ~ 8개의 Epic 생성
요구사항: [{1: 생성한 Epic의 수행 기간을 설정해}, {2: 수행 기간은 Epic끼리 겹쳐도 무관},{3: 개발 마지막 주에는 애플리케이션 test 및 시연, 발표 준비 할당}, {3: 각각의 기능 및 에픽들은 종속성을 가짐. 먼저 수행하는 경우, 날짜와 종속성을 함께 명시}, {4: 각각의 Epic은 고유의 pk(Varchar(5))를 가짐. 종속성을 pk로 명시하라}],
응답 형식: {
result: [
    {pk: "IDC-1",
    title: "JWT token 기반 간편 로그인",
    term: "2024-08-26 ~ 2024-09-08",
    "dependency": null
    }
]
} """},
{"role": "user", "content": """title: 아이 돈 케어(I Don Care),
term: 2024-08-26 ~ 2024-10-11 (8주),
tech stack: [{BackEnd: spring boot}, {FrontEnd: React.js, Typescript, PWA}, {DB: MySQL, Redis}],
detail:  청소년을 위한 용돈 관리 및 금융 교육 서비스,
features: [{main: 코어 뱅킹 및 자녀 용돈 지급}, {add: JWT token 기반 간편 로그인}, {add: 사용자 회원가입 및 로그인}, {main: 자녀의 저금을 도와주는 저금통}, {main: 심부름 수행을 통한 추가 용돈 지급
기능}, {add: 자녀의 카드 데이터 기반 포트폴리오 분석}]"""},
]

terminators = [
    pipeline.tokenizer.eos_token_id,
    pipeline.tokenizer.convert_tokens_to_ids("<|eot_id|>")
]

outputs = pipeline(
    messages,
    max_new_tokens=600,
    eos_token_id=terminators,
    do_sample=True,
    temperature=0.6,
    top_p=0.9,
)
print(outputs[0]["generated_text"][-1]["content"])

# Sprint 생성
messages = [
    {"role": "system", "content": """한국어로 응답하시오.
역할: JIRA를 통해 6명의 주니어 개발자들의 개발 업무를 관리하고, 스프린트 및 이슈를 할당하는 최고의 PM
메인 응답: 현재 진행 중인 Epic 내용과 추가 버그 수정 업무를 포함한 이번 주 스프린트 생성.
요구사항: [{1: 기존 등록된 Epic 일정과 추가 구현 사항을 기준으로 세부 업무 제작}, 
          {2: Epic - Story - Sub-task 순으로 하위 업무 구성},
          {3: 세부 업무에는 story point(<=4)와 담당자 할당. story point는 담당자가 업무 처리에 소요되는 hours}, 
          {4: Story 하위에 Sub-task 없으면 Story에 story point, 담당자 할당 / Sub-task 있으면 Sub-task에 story point, 담당자 할당}, 
          {5: total sum(story point IN SPTINT) == 40},
          {6: 각 업무의 summary에는 [FE], [BE], [Infra], [UX/UI] 와 같은 업무 별 태그를 앞에 명시},
          {7: Epic의 업무 기간이 스프린트 종료 시간보다 늦을 경우, 해당 Epic의 모든 작업을 이번 스프린트 내에 종료할 필요 없음},
          {8: 각 업무 별 중요도는 high/mid/low 중 하나로 설정},
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
    "story-point": null,
    "manager": null
    },
    {"pk": 2,
    "summary": "[BE] 사용자 회원가입 기능 구현",
    "description": "회원 DB 테이블 제작 및 회원가입 기능 API 구현",
    "issuetype": {"name": "Story"},
    "priority": "high",
    "parent": { "summary": "사용자 회원가입 및 로그인" },
    "issuelink" : null,
     "story-point": null,
    "manager": null
    },
    {"pk": 3,
    "summary": "[FE] 회원 정보 입력 input 컴포넌트 작성",
    "issuetype": {"name": "Sub-task"},
    "priority": "mid",
    "parent": { "summary": "[FE] 사용자 회원가입 페이지 제작" },
    "issuelink" : "[BE] 사용자 회원가입 기능 구현",
    "story-point": 2,
    "manager": 1 (account-id)
    } ...
]
} """},
{"role": "user", "content": """sprint-term: 2024-11-04 ~ 2024-11-08,
members: [{"account-id": 1,
           "username": "최희현",
           "task": "FE"}, 
          {"account-id": 2,
           "username": "장승연",
           "task": "BE"}, 
          {"account-id": 3,
           "username": "김성현",
           "task": "BE"}, 
          {"account-id": 4,
           "username": "서승호",
           "task": "INFRA"}, 
          {"account-id": 5,
           "username": "최희현",
           "task": "FE"}, 
          {"account-id": 6,
           "username": "주소영",
           "task": "FE"},]
Epics: [{pk: "IDC-1",
         summary: 사용자 회원가입 및 로그인,
         term: 2024-11-04 ~ 2024-11-08},
        {pk: "IDC-2",
         summary: 코어 뱅킹 및 자녀 용돈 지급,
         term: 2024-11-04 ~ 2024-11-13}],
added tasks: [{type: "fix", summary: "JWT refresh token 발급 오류 수정"},
              {type: "feature", summary: "SSAFY 금융망 API와 프로젝트 내부 API 연동"}]"""},
]

terminators = [
    pipeline.tokenizer.eos_token_id,
    pipeline.tokenizer.convert_tokens_to_ids("<|eot_id|>")
]

outputs = pipeline(
    messages,
    max_new_tokens=1000,
    eos_token_id=terminators,
    do_sample=True,
    temperature=0.6,
    top_p=0.9,
)
print(outputs[0]["generated_text"][-1]["content"])

# GPU 사용 설정 (가능한 경우)
# device = "cuda" if torch.cuda.is_available() else "cpu"
# model.to(device)

# class PromptRequest(BaseModel):
#     prompt: str

# @app.post("/generate/")
# async def generate_text(request: PromptRequest):
#     # 입력 텍스트를 토크나이즈
#     inputs = tokenizer(request.prompt, return_tensors="pt").to(device)
    
#     # 모델을 통해 텍스트 생성
#     outputs = model.generate(**inputs, max_length=100)
    
#     # 생성된 텍스트 디코딩
#     generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
    
#     return {"generated_text": generated_text}

