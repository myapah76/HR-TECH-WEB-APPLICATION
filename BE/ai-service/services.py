import os
import json
from langchain_google_genai import ChatGoogleGenerativeAI
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



# --- Prompts ---
EXTRACTION_PROMPT = PromptTemplate.from_template("""
You are an advanced skill extraction engine for IT/Tech recruitment.
Analyze the following CV/resume text and extract all technical and professional skills mentioned.

CRITICAL RULES FOR SKILL NAMES:
1. ONLY extract skills that are relevant to the IT/Technology field (including programming, frameworks, tools, methodologies, and IT-related soft skills like Agile, Leadership, Communication). DO NOT extract completely unrelated skills (e.g., Accounting, Cooking).
2. All extracted skill names MUST be returned in a strictly normalized format: all lowercase, no spaces, no dots, no dashes, and no special characters. 
   Examples:
   - "React" or "ReactJS" -> "react"
   - "Node.js" -> "nodejs"
   - "Vue.js" -> "vuejs"
   - "C++" -> "c++" (Keep '+' or '#' for C++, C# as they are distinct IT entities, but remove spaces and dots)
   - "Amazon Web Services" -> "amazonwebservices"
   - "React Native" -> "reactnative"
3. Determine proficiency level from context: BEGINNER, INTERMEDIATE, ADVANCED, EXPERT. If unclear, omit or assume INTERMEDIATE.

Return ONLY a valid JSON array with no extra text. Example:
[{{ "name": "java", "level": "ADVANCED" }}, {{ "name": "react", "level": "INTERMEDIATE" }}, {{ "name": "nodejs", "level": "EXPERT" }}]

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
You are an advanced skill extraction engine for IT/Tech recruitment.
Analyze the following Job Description and Requirements to extract all technical and professional skills mentioned.

CRITICAL RULES FOR SKILL NAMES:
1. ONLY extract skills that are relevant to the IT/Technology field (including programming, frameworks, tools, methodologies, and IT-related soft skills like Agile, Leadership, Communication). DO NOT extract completely unrelated skills (e.g., Accounting, Cooking).
2. All extracted skill names MUST be returned in a strictly normalized format: all lowercase, no spaces, no dots, no dashes, and no special characters. 
   Examples:
   - "React" or "ReactJS" -> "react"
   - "Node.js" -> "nodejs"
   - "Vue.js" -> "vuejs"
   - "C++" -> "c++" (Keep '+' or '#' for C++, C# as they are distinct IT entities, but remove spaces and dots)
   - "Amazon Web Services" -> "amazonwebservices"
   - "React Native" -> "reactnative"
3. Determine required proficiency level from context: BEGINNER, INTERMEDIATE, ADVANCED, EXPERT. If unspecified, assume INTERMEDIATE.
4. If the text explicitly states a skill is an absolute "must-have", "required", or "mandatory", set is_mandatory to true. Otherwise, set is_mandatory to false.

Return ONLY a valid JSON array with no extra text. Example:
[{{ "name": "java", "level": "ADVANCED", "is_mandatory": true }}, {{ "name": "nodejs", "level": "INTERMEDIATE", "is_mandatory": false }}]

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


MAP_RELATIONSHIPS_PROMPT = PromptTemplate.from_template("""
You are an expert IT Skill Taxonomy System.
You are given a list of ALL existing IT skills in our database (`db_skills`) and a list of newly extracted skills (`new_skills`).
Your task is to identify relationships between each new skill and the existing db_skills.

Relationship Rule (RELATED_TO):
- If a db_skill is a parent technology, framework, language, or strongly related foundation of a new_skill, or vice-versa, they are RELATED_TO.
- Do NOT include synonyms. We assume skill names are already normalized.
- Only output the exact skill names from the provided `db_skills` array. Do not invent new skills.

Return ONLY a valid JSON array of objects. Example format:
[
  {{ "new_skill": "nextjs", "related_to": ["reactjs", "nodejs", "javascript"] }},
  {{ "new_skill": "spring", "related_to": ["java", "springboot"] }}
]

If no relations are found for a new skill, set its "related_to" to an empty array: [].
Make sure the returned JSON is valid.

New Skills:
{new_skills}

All DB Skills:
{db_skills}
""")

def map_relationships_with_full_db(new_skills: list[str], db_skills: list[str]) -> list:
    """Maps relationships between new skills and the full DB of skills using Gemini."""
    if not new_skills or not db_skills:
        return []
    
    prompt_value = MAP_RELATIONSHIPS_PROMPT.format_prompt(
        new_skills=json.dumps(new_skills), 
        db_skills=json.dumps(db_skills)
    )
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
            
            parsed_json = json.loads(result_content.strip())
            return parsed_json if isinstance(parsed_json, list) else []
            
        return []
    except Exception as e:
        print(f"Error parsing Gemini relationship response: {e}")
        return []
