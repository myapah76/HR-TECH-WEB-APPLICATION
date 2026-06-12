import os
import json
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_ollama import OllamaEmbeddings
from langchain_core.prompts import PromptTemplate
from dotenv import load_dotenv

import os
from pathlib import Path
import requests
import fitz  # PyMuPDF

# Load from root .env file
root_env_path = Path(__file__).resolve().parent.parent.parent / '.env'
load_dotenv(dotenv_path=root_env_path)

def download_and_extract_pdf_text(file_url: str) -> str:
    """Downloads a PDF from a URL and extracts its text via PyMuPDF.
    """
    try:
        response = requests.get(file_url, timeout=15)
        response.raise_for_status()
        
        pdf_document = fitz.open(stream=response.content, filetype="pdf")
        text = ""
        for page in pdf_document:
            text += page.get_text()
            
        pdf_document.close()
        return text
    except Exception as e:
        print(f"Error downloading or parsing PDF from {file_url}: {e}")
        raise

# --- Configuration ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL")
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL")
OLLAMA_MODEL = os.getenv("OLLAMA_EMBEDDING_MODEL")

# Initialize LLM with structured JSON output enforced
llm = ChatGoogleGenerativeAI(
    model=GEMINI_MODEL, 
    temperature=0, 
    google_api_key=GEMINI_API_KEY,
    response_mime_type="application/json"
)

# Initialize Embeddings
ollama_embeddings = OllamaEmbeddings(
    model=OLLAMA_MODEL, 
    base_url=OLLAMA_BASE_URL
)

# --- Prompts ---
EXTRACTION_PROMPT = PromptTemplate.from_template("""
You are a skill extraction engine for HR/recruitment.
Analyze the following CV/resume text and extract all technical and professional skills mentioned.

Rules:
- Use canonical skill names (e.g., "JavaScript" not "JS", "Kubernetes" not "k8s")
- Determine proficiency level from context: BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
- Include both hard skills (programming, tools) and soft skills (leadership, communication)

Return ONLY a valid JSON array with no extra text. Example:
[{{ "name": "Java", "level": "ADVANCED" }}, {{ "name": "React", "level": "INTERMEDIATE" }}]

If no skills are found, return: []

CV Text:
---
{cv_text}
""")

def extract_skills(cv_text: str) -> list:
    """Extracts skills from CV text using Gemini."""
    if not cv_text or not cv_text.strip():
        return []
    
    prompt_value = EXTRACTION_PROMPT.format_prompt(cv_text=cv_text)
    response = llm.invoke(prompt_value)
    
    try:
        result_content = response.content
        if isinstance(result_content, list):
            if len(result_content) > 0 and isinstance(result_content[0], dict) and "text" in result_content[0]:
                result_content = "".join(b["text"] for b in result_content if "text" in b)
            else:
                return result_content # Already parsed JSON array

        if isinstance(result_content, str):
            result_content = result_content.strip()
            if result_content.startswith("```json"):
                result_content = result_content[7:]
            elif result_content.startswith("```"):
                result_content = result_content[3:]
            if result_content.endswith("```"):
                result_content = result_content[:-3]
            
            return json.loads(result_content.strip())
            
        return result_content
    except Exception as e:
        print(f"Error parsing Gemini response: {e}")
        return []

JOB_EXTRACTION_PROMPT = PromptTemplate.from_template("""
You are a skill extraction engine for HR/recruitment.
Analyze the following Job Description and Requirements to extract all technical and professional skills mentioned.

Rules:
- Use canonical skill names (e.g., "JavaScript" not "JS", "Kubernetes" not "k8s")
- Determine required proficiency level from context: BEGINNER, INTERMEDIATE, ADVANCED, EXPERT. If unspecified, assume INTERMEDIATE.
- Include both hard skills and soft skills.
- The employer may have already explicitly defined some mandatory skills elsewhere, but your job here is to extract additional skills implied or listed in the text. However, if the text explicitly states a skill is an absolute "must-have" or "required", set is_mandatory to true. Otherwise, set is_mandatory to false.

Return ONLY a valid JSON array with no extra text. Example:
[{{ "name": "Java", "level": "ADVANCED", "is_mandatory": true }}, {{ "name": "React", "level": "INTERMEDIATE", "is_mandatory": false }}]

If no skills are found, return: []

Job Description:
---
{description}

Job Requirements:
---
{requirements}
""")

def extract_job_skills(description: str, requirements: str = "") -> list:
    """Extracts nice-to-have and additional mandatory skills from Job posting using Gemini."""
    if not description and not requirements:
        return []
    
    prompt_value = JOB_EXTRACTION_PROMPT.format_prompt(description=description, requirements=requirements)
    response = llm.invoke(prompt_value)
    
    try:
        result_content = response.content
        if isinstance(result_content, list):
            if len(result_content) > 0 and isinstance(result_content[0], dict) and "text" in result_content[0]:
                result_content = "".join(b["text"] for b in result_content if "text" in b)
            else:
                return result_content

        if isinstance(result_content, str):
            result_content = result_content.strip()
            if result_content.startswith("```json"):
                result_content = result_content[7:]
            elif result_content.startswith("```"):
                result_content = result_content[3:]
            if result_content.endswith("```"):
                result_content = result_content[:-3]
                
            return json.loads(result_content.strip())
            
        return result_content
    except Exception as e:
        print(f"Error parsing Gemini response: {e}")
        return []

def get_embeddings(texts: list[str]) -> list[list[float]]:
    """Generates embeddings using Ollama."""
    if not texts:
        return []
    
    try:
        # langchain OllamaEmbeddings supports batch embedding out of the box
        embeddings = ollama_embeddings.embed_documents(texts)
        return embeddings
    except Exception as e:
        print(f"Error calling Ollama: {e}")
        # Return empty arrays of correct size as fallback
        return [[] for _ in texts]
