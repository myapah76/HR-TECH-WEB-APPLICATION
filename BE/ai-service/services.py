import os
import json
import time
import base64
import requests
import fitz  # PyMuPDF
from pathlib import Path
from typing import List
from dotenv import load_dotenv

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage

from prompts import (
    EXTRACTION_PROMPT,
    JOB_EXTRACTION_PROMPT,
    MAP_RELATIONSHIPS_PROMPT,
    VALIDATE_SKILLS_PROMPT,
    INTERVIEW_QUESTIONS_PROMPT,
    EVALUATE_AUDIO_ANSWER_PROMPT,
    INTERVIEW_EVALUATION_PROMPT,
    AI_MATCHING_ADVICE_PROMPT,
)

# Load from root .env file
root_env_path = Path(__file__).resolve().parent.parent.parent / '.env'
load_dotenv(dotenv_path=root_env_path)

def download_and_extract_pdf_text(file_url: str) -> str:
    """Downloads a PDF from a URL and extracts its text via PyMuPDF."""
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

def invoke_llm_with_retry(prompt_value):
    max_attempts = 5
    base_delay = 5  # seconds
    for attempt in range(1, max_attempts + 1):
        try:
            return llm.invoke(prompt_value)
        except Exception as e:
            err_msg = str(e)
            if "RESOURCE_EXHAUSTED" in err_msg or "429" in err_msg:
                if attempt == max_attempts:
                    raise e
                sleep_time = base_delay * (2 ** (attempt - 1))
                print(f"Gemini API rate limit hit (429). Retrying in {sleep_time}s... (Attempt {attempt}/{max_attempts})")
                time.sleep(sleep_time)
            else:
                raise e

def parse_json_llm_response(response, default_fallback=None):
    """Safely extracts text content from LLM response (handling string or list of dict blocks) and parses JSON."""
    try:
        content = getattr(response, "content", response)
        if isinstance(content, list):
            if len(content) > 0 and isinstance(content[0], dict) and "text" in content[0]:
                content = "".join(b["text"] for b in content if isinstance(b, dict) and "text" in b)
            elif len(content) > 0 and isinstance(content[0], str):
                content = "".join(content)
            else:
                return content  # Already parsed or raw list

        if isinstance(content, str):
            content = content.strip()
            if content.startswith("```json"):
                content = content[7:]
            elif content.startswith("```"):
                content = content[3:]
            if content.endswith("```"):
                content = content[:-3]
            return json.loads(content.strip())
        return content
    except Exception as e:
        print(f"Error parsing LLM response JSON: {e}")
        return default_fallback if default_fallback is not None else []


# --- Service Functions ---

def extract_skills(cv_text: str) -> list:
    """Extracts skills from CV text using Gemini."""
    if not cv_text or not cv_text.strip():
        return []
    
    prompt_value = EXTRACTION_PROMPT.format_prompt(cv_text=cv_text)
    response = invoke_llm_with_retry(prompt_value)
    parsed = parse_json_llm_response(response, default_fallback=[])
    return parsed if isinstance(parsed, list) else []


def extract_skills_from_jd(description: str, requirements: str) -> list:
    """Extracts skills from Job Description using Gemini."""
    prompt_value = JOB_EXTRACTION_PROMPT.format_prompt(description=description, requirements=requirements)
    response = invoke_llm_with_retry(prompt_value)
    parsed = parse_json_llm_response(response, default_fallback=[])
    return parsed if isinstance(parsed, list) else []


def map_relationships_with_full_db(new_skills: list[str], db_skills: list[str], roles: list[str]) -> list:
    """Maps relationships between new skills and the full DB of skills using Gemini."""
    if not new_skills:
        return []
    
    prompt_value = MAP_RELATIONSHIPS_PROMPT.format_prompt(
        new_skills=json.dumps(new_skills), 
        db_skills=json.dumps(db_skills),
        roles=json.dumps(roles)
    )
    response = invoke_llm_with_retry(prompt_value)
    parsed = parse_json_llm_response(response, default_fallback=[])
    return parsed if isinstance(parsed, list) else []


def generate_interview_questions(
    cv_text: str,
    jd_text: str,
    target_role: str,
    num_questions: int
) -> List:
    """Sinh danh sách câu hỏi phỏng vấn bằng Gemini"""
    interview_questions_prompt = INTERVIEW_QUESTIONS_PROMPT.format_prompt(
        cv_text=cv_text if cv_text else "Not provided",
        jd_text=jd_text if jd_text else "Not provided",
        target_role=target_role,
        num_questions=num_questions
    )
    response = invoke_llm_with_retry(interview_questions_prompt)
    parsed = parse_json_llm_response(response, default_fallback=[])
    return parsed if isinstance(parsed, list) else []


def evaluate_audio_answer(cv_text: str, jd_text: str, question: str, audio_url: str) -> dict:
    """Tải audio từ url, gửi kèm Prompt tới Gemini để chấm điểm trực tiếp từ giọng nói"""
    try:
        # 1. Tải file ghi âm âm thanh từ Cloudinary
        response = requests.get(audio_url, timeout=15)
        response.raise_for_status()
        audio_bytes = response.content
        audio_b64 = base64.b64encode(audio_bytes).decode("utf-8")
        # Xác định mime_type dựa trên định dạng tệp ghi âm
        mime_type = "audio/webm"
        if audio_url.lower().endswith(".wav"):
            mime_type = "audio/wav"
        elif audio_url.lower().endswith(".ogg"):
            mime_type = "audio/ogg"
        elif audio_url.lower().endswith(".mp3"):
            mime_type = "audio/mp3"
        # 2. Tạo nội dung Prompt
        prompt_text = EVALUATE_AUDIO_ANSWER_PROMPT.format(
            cv_text=cv_text if cv_text else "Not provided",
            jd_text=jd_text if jd_text else "Not provided",
            question=question
        )
        # 3. Tạo tin nhắn chứa cả text prompt và tệp âm thanh gửi lên Gemini
        message = HumanMessage(
            content=[
                {"type": "text", "text": prompt_text},
                {
                    "type": "media",
                    "mime_type": mime_type,
                    "data": audio_b64
                }
            ]
        )
        # 4. Gọi LLM
        res = invoke_llm_with_retry([message])
        parsed = parse_json_llm_response(res, default_fallback={})
        return parsed if isinstance(parsed, dict) else {}
    except Exception as e:
        print(f"Error evaluating audio answer: {e}")
        return {
            "score": 0.0,
            "feedback": f"Lỗi phân tích âm thanh từ AI: {str(e)}",
            "modelAnswer": ""
        }


def evaluate_interview_session(
    cv_text: str,
    jd_text: str,
    history: list
) -> dict:
    """Đánh giá toàn bộ phiên phỏng vấn dựa trên điểm số & feedback của từng câu lẻ"""
    transcript_parts = []
    for idx, item in enumerate(history):
        transcript_parts.append(
            f"Q{idx+1}: {item['question']}\n- Score: {item['score']}/10\n- Feedback: {item['feedback']}\n"
        )
    transcript_text = "\n".join(transcript_parts)
    interview_evaluation_prompt = INTERVIEW_EVALUATION_PROMPT.format_prompt(
        cv_text=cv_text if cv_text else "Not provided",
        jd_text=jd_text if jd_text else "Not provided",
        transcript_text=transcript_text
    )
    response = invoke_llm_with_retry(interview_evaluation_prompt)
    parsed = parse_json_llm_response(response, default_fallback={})
    return parsed if isinstance(parsed, dict) else {}


def generate_matching_advice(cv_text: str, jd_text: str, missing_skills: list) -> dict:
    """Sinh lời khuyên và dự đoán câu hỏi phỏng vấn dựa trên kỹ năng còn thiếu"""
    prompt_value = AI_MATCHING_ADVICE_PROMPT.format_prompt(
        cv_text=cv_text if cv_text else "Not provided",
        jd_text=jd_text if jd_text else "Not provided",
        missing_skills=", ".join(missing_skills) if missing_skills else "None"
    )
    response = invoke_llm_with_retry(prompt_value)
    parsed = parse_json_llm_response(response, default_fallback={"improvement_tips": "Rất tiếc, AI đang quá tải và không thể sinh lời khuyên lúc này.", "action_plan": []})
    return parsed if isinstance(parsed, dict) else {"improvement_tips": "Rất tiếc, AI đang quá tải và không thể sinh lời khuyên lúc này.", "action_plan": []}


def validate_it_skills(skills: list[str]) -> list[str]:
    if not skills:
        return []
    prompt_value = VALIDATE_SKILLS_PROMPT.format_prompt(skills=json.dumps(skills))
    response = invoke_llm_with_retry(prompt_value)
    parsed = parse_json_llm_response(response, default_fallback=[])
    return parsed if isinstance(parsed, list) else []

# Aliases for backwards compatibility with main.py imports
extract_skills_from_cv = extract_skills
extract_job_skills = extract_skills_from_jd
