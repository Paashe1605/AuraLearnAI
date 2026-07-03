from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

app = FastAPI(
    title="AuraLearn Backend",
    description="Multi-agentic API for the AuraLearn Educational Platform",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, allow all. Update for production.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to the AuraLearn API. Multi-agentic system is online."}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

from pydantic import BaseModel
from agents.coordinator import coordinator

class LearnRequest(BaseModel):
    topic: str
    language: str

@app.post("/api/learn")
async def learn(request: LearnRequest):
    # Triggers the multi-agent workflow
    result = coordinator.process_learning_request(request.topic, request.language)
    return result.dict()

class TranslateRequest(BaseModel):
    language: str
    ui_payload: dict

@app.post("/api/translate-ui")
async def translate_ui(request: TranslateRequest):
    result = coordinator.translate_ui(request.language, request.ui_payload)
    return result.dict()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
