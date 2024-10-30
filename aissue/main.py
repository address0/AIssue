from fastapi import FastAPI
from pydantic import BaseModel
# from model import ModelHandler

app = FastAPI()

@app.get("/")
async def read_root():
    return {"Hello": "World"}

# model_handler = ModelHandler()

# class TextRequest(BaseModel):
#     text: str

# @app.post("/process")
# async def process_text(request: TextRequest):
#     class_id = model_handler.classify_text(request.text)
    
#     # 분류 결과에 따라 다른 프롬프트 설정
#     if class_id == 0:  # Frontend
#         prompt = "프론트엔드 개발 작업에는 UI 디자인과 컴포넌트 구현이 포함됩니다."
#     else:  # Backend
#         prompt = "백엔드 개발 작업에는 서버 측 논리와 데이터베이스 관리가 포함됩니다."
    
#     generated_content = model_handler.generate_content(prompt)
#     return {
#         "class_id": class_id,
#         "generated_content": generated_content
#     }