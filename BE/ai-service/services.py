import os
import json
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.embeddings import OllamaEmbeddings
from langchain_core.prompts import PromptTemplate
from dotenv import load_dotenv

import os
from pathlib import Path

# Load from root .env file
root_env_path = Path(__file__).resolve().parent.parent.parent / '.env'
load_dotenv(dotenv_path=root_env_path)

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
    model_kwargs={"response_mime_type": "application/json"}
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
[{"name": "Java", "level": "ADVANCED"}, {"name": "React", "level": "INTERMEDIATE"}]

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
        # Since response_mime_type is application/json, it should be a raw JSON string
        result_json = response.content
        skills = json.loads(result_json)
        return skills
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
[{"name": "Java", "level": "ADVANCED", "is_mandatory": true}, {"name": "React", "level": "INTERMEDIATE", "is_mandatory": false}]

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
        result_json = response.content
        skills = json.loads(result_json)
        return skills
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
