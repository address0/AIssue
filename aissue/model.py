from fastapi import FastAPI
from transformers import AutoModelForCausalLM, AutoTokenizer

app = FastAPI()

@app.get("/")
async def read_root():
    return {"Model": "World"}