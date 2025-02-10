import os
import logging
import asyncio
import httpx
import pdfplumber  # For extracting text from PDFs
from fastapi import FastAPI
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="snailFly API")

UPLOAD_DIRECTORY = "storage/uploads"  # Directory where files are saved
GROK_API_URL = "https://api.x.ai/v1/chat/completions"
GROK_API_KEY = "xai-Dw9BqVe1IiVe3HUuiq3oxxEBwxMVZsm1jhjw8RM97fSBqyPhqgziFKUgZKX2kLyECkXRUzp7uIObuAzE"  # Replace with your actual API key

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://10.228.227.198/"],  # Allow frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Welcome to snailFly!"}

# Route to list all files in the directory
@app.get("/files")
async def list_files():
    try:
        files = [f for f in os.listdir(UPLOAD_DIRECTORY) if os.path.isfile(os.path.join(UPLOAD_DIRECTORY, f))]
        if not files:
            return JSONResponse(content={"message": "No files found"}, status_code=404)
        return {"files": files}
    except Exception as e:
        return JSONResponse(content={"message": str(e)}, status_code=500)

@app.get("/files/{filename}")
async def get_file(filename: str):
    try:
        file_path = os.path.join(UPLOAD_DIRECTORY, filename)
        if os.path.exists(file_path):
            return FileResponse(file_path)
        return JSONResponse(content={"message": "File not found"}, status_code=404)
    except Exception as e:
        return JSONResponse(content={"message": str(e)}, status_code=500)

class FilesRequest(BaseModel):
    files: List[str] = []

# Function to extract text from a PDF
async def extract_text_from_pdf(file_path: str) -> str:
    try:
        with pdfplumber.open(file_path) as pdf:
            text = "\n".join(page.extract_text() or "" for page in pdf.pages)
        return text.strip()
    except Exception as e:
        logger.error(f"Error extracting text from {file_path}: {e}")
        return ""

# Function to read file contents (only if text file)
async def read_file(file_path: str) -> str:
    try:
        if file_path.endswith(".pdf"):
            return await extract_text_from_pdf(file_path)
        else:
            with open(file_path, "r", encoding="utf-8") as f:
                return f.read()
    except Exception as e:
        logger.error(f"Error reading file {file_path}: {e}")
        return ""

# Function to call Grok API for analysis
async def analyze_with_grok(content: str) -> Dict:
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {GROK_API_KEY}"
    }
    payload = {
        "messages": [
            {"role": "system", "content": "Analyze argumentation style and vocabulary progression."},
            {"role": "user", "content": content[:4000]}  # Limit to 4000 characters
        ],
        "model": "grok-2-latest",
        "stream": False,
        "temperature": 0.5
    }
    async with httpx.AsyncClient() as client:
        response = await client.post(GROK_API_URL, headers=headers, json=payload)
        return response.json() if response.status_code == 200 else {"error": "Failed to analyze with Grok"}

@app.post("/analyze-files")
async def analyze_files():
    try:
        files = [f for f in os.listdir(UPLOAD_DIRECTORY) if os.path.isfile(os.path.join(UPLOAD_DIRECTORY, f))]
        if not files:
            return JSONResponse(content={"message": "No files found to analyze"}, status_code=404)
        
        analysis_results = {}

        for file in files:
            file_path = os.path.join(UPLOAD_DIRECTORY, file)
            content = await read_file(file_path)
            
            if content:
                analysis_results[file] = await analyze_with_grok(content)
            else:
                analysis_results[file] = {"error": "Failed to read file"}

        return analysis_results
    except Exception as e:
        return JSONResponse(content={"message": str(e)}, status_code=500)