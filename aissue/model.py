from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

# FastAPI 인스턴스 생성
app = FastAPI()

# 모델과 토크나이저 로드
model_name = "skt/kogpt2-base-v2"  # 실제 모델 이름으로 변경 필요
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)

class RequestBody(BaseModel):
    topic: str

@app.post("/generate-tasks/")
async def generate_tasks(request_body: RequestBody):
    topic = request_body.topic
    input_text = f"주제: {topic}\n아래의 주제에 대해 4가지 IT개발 업무 내용을 작성해 주세요. 각 업무 내용은 한 문장으로 간단하게 설명해 주세요:\n"
    
    # 입력 텍스트를 토크나이즈
    input_ids = tokenizer.encode(input_text, return_tensors='pt')

    output = model.generate(input_ids, max_length=100, do_sample=True, top_p=0.95, temperature=0.7, num_return_sequences=4)


    tasks = [tokenizer.decode(output[i], skip_special_tokens=True) for i in range(len(output))]

    # 후처리 예시: 불필요한 부분 제거
    tasks = [task.replace("주제:", "").replace(f"{topic}\n아래의 주제에 대해 4가지 IT개발 업무 내용을 작성해 주세요. 각 업무 내용은 한 문장으로 간단하게 설명해 주세요:\n", "").strip() for task in tasks]

    return {"tasks": tasks}
