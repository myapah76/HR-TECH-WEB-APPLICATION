import os
import json
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from dotenv import load_dotenv

import os
from pathlib import Path
import requests
import fitz  # PyMuPDF
from typing import List

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
3. Normalize well-known IT abbreviations to their full standard names before applying the formatting rule. Examples:
   - "AWS" -> "amazonwebservices"
   - "K8s" -> "kubernetes"
   - "GCP" -> "googlecloudplatform"
4. Determine proficiency level from context: BEGINNER, INTERMEDIATE, ADVANCED, EXPERT. If unclear, omit or assume INTERMEDIATE.

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
3. Normalize well-known IT abbreviations to their full standard names before applying the formatting rule. Examples:
   - "AWS" -> "amazonwebservices"
   - "K8s" -> "kubernetes"
   - "GCP" -> "googlecloudplatform"
4. Determine required proficiency level from context: BEGINNER, INTERMEDIATE, ADVANCED, EXPERT. If unspecified, assume INTERMEDIATE.

Return ONLY a valid JSON array with no extra text. Example:
[{{ "name": "java", "level": "ADVANCED" }}, {{ "name": "nodejs", "level": "INTERMEDIATE" }}]

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

Relationship Rules:
1. CHILD_TO_PARENT: If the `new_skill` is a child, subset, framework, or specific tool that belongs to a parent `db_skill` (e.g., spring is CHILD_TO_PARENT of java).
2. PARENT_TO_CHILD: If the `new_skill` is a parent, category, or language that encompasses a specific child `db_skill` (e.g., java is PARENT_TO_CHILD of springboot).
3. RELATED_TO: If the `new_skill` and `db_skill` are related siblings, alternatives, or often used together but don't have a strict parent-child hierarchy (e.g., react and nodejs).
- Do NOT include synonyms. We assume skill names are already normalized.
- Only output the exact skill names from the provided `db_skills` array. Do not invent new skills.
- CRITICAL RULE: Choose at most ONE strongest and most accurate relationship type between any two skills. Do NOT output multiple relationship types for the same target skill.

Return ONLY a valid JSON array of objects. Example format:
[
  {{
    "new_skill": "nextjs",
    "relations": [
      {{ "target": "react", "type": "CHILD_TO_PARENT" }},
      {{ "target": "nodejs", "type": "RELATED_TO" }}
    ]
  }},
  {{
    "new_skill": "java",
    "relations": [
      {{ "target": "springboot", "type": "PARENT_TO_CHILD" }}
    ]
  }}
]

If no relations are found for a new skill, set its "relations" to an empty array: [].
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


INTERVIEW_QUESTIONS_PROMPT = PromptTemplate.from_template("""
You are an expert IT Technical Recruiter.
Generate a list of {num_questions} interview questions in Vietnamese for a candidate applying for the position of '{target_role}'.

Inputs:
- Candidate CV Text: {cv_text}
- Job Description (JD): {jd_text}

Rules for Question Generation:
1. The questions must test both Technical Skills (core concepts, architectural design) and Behavioral/Soft Skills.
2. Align the difficulty with the candidate's experience level from CV, and requirements from JD.
3. Tailor at least 2 questions directly targeting the projects or specific technologies mentioned in the candidate's CV.
4. Output must be a clean JSON array of strings representing the questions. Do NOT wrap it in extra markdown format like ```json, just pure JSON array.

Example:
[
  "Question 1?",
  "Question 2?"
]
""")

def generate_interview_questions(
    cv_text: str,
    jd_text: str,
    target_role: str,
    num_questions: int
) -> List:
    """Sinh danh sách câu hỏi phỏng vấn bằng Gemini"""
    interview_questions_prompt = INTERVIEW_QUESTIONS_PROMPT.format_prompt(
        cv_text = cv_text if cv_text else "Not provided",
        jd_text = jd_text if jd_text else "Not provided",
        target_role = target_role,
        num_questions = num_questions
    )
    response = llm.invoke(interview_questions_prompt)

    try:
        content = response.content
        if isinstance(content, str):
            return json.loads(content.strip())
        return content
    except Exception as e:
        print(f"Error parsing generated questions: {e}")
        return []


INTERVIEW_EVALUATION_PROMPT = PromptTemplate.from_template("""
You are an expert Senior IT Recruiter.
Evaluate the candidate's mock interview performance based on the CV, Job Description (JD), and the Q&A history transcript.

Inputs:
- Candidate CV: {cv_text}
- Job Description (JD): {jd_text}
- Interview Transcript (Q&A):
{transcript_text}

Evaluation Guidelines:
1. Rate the overall score on a scale of 0.0 to 10.0.
2. Rate individual score components: Technical (chuyên môn), Communication (giao tiếp), Soft Skills (kỹ năng mềm) on a scale of 0.0 to 10.0.
3. Detail strengths and weaknesses in Vietnamese.
4. For each Q&A pair:
   - Assess technical correctness and communication structure.
   - Assign a score (0.0 to 10.0) for this answer.
   - Provide feedback (nhận xét) and a model answer (câu trả lời tối ưu gợi ý).
5. Language: All feedbacks, suggestions, and text MUST be in Vietnamese.
6. Output must be a clean JSON object matching the following structure, do NOT wrap it in extra markdown format like ```json, just pure JSON array.:
{{
  "overallScore": 8.5,
  "technicalScore": 8.0,
  "communicationScore": 9.0,
  "softSkillsScore": 8.5,
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "generalFeedback": "...",
  "detailedFeedback": [
    {{
      "question": "...",
      "answer": "...",
      "score": 8.0,
      "feedback": "...",
      "modelAnswer": "..."
    }}
  ]
}}
""")

def evaluate_interview_session(
    cv_text: str,
    jd_text: str,
    history: list
) -> dict:
    """Đánh giá toàn bộ phiên phỏng vấn và trả về kết quả dạng JSON"""
    # Định dạng lại lịch sử chat thành dạng văn bản để gửi cho LLM dễ hiểu
    transcript_parts = []
    for idx, item in enumerate(history):
        transcript_parts.append(
            f"Q{idx+1}: {item['question']}\nA{idx+1}: {item['answer']}\n"
        )
    transcript_text = "\n".join(transcript_parts)
    interview_evaluation_prompt = INTERVIEW_EVALUATION_PROMPT.format_prompt(
        cv_text = cv_text if cv_text else "Not provided",
        jd_text = jd_text if jd_text else "Not provided",
        transcript_text = transcript_text
    )
    response = llm.invoke(interview_evaluation_prompt)
    try:
        content = response.content
        if isinstance(content, str):
            return json.loads(content.strip())
        return content
    except Exception as e:
        print(f"Error parsing evaluation: {e}")
        return {}

AI_MATCHING_ADVICE_PROMPT = PromptTemplate.from_template("""
You are an expert IT Career Advisor and Technical Recruiter.
A candidate has used our AI Matching tool to compare their CV against a Job Description. 
We have already identified their missing skills.

Your task is to provide:
1. "improvement_tips": Actionable advice (in Vietnamese) on how the candidate can improve their CV or what they should learn to cover the missing skills and better fit the job. Keep it concise, encouraging, and professional.
2. "action_plan": A list of 3-5 specific steps (in Vietnamese) that combine:
   - Short-term learning path or resources to quickly acquire the missing skills.
   - Practical project ideas the candidate can build to gain hands-on experience.
   - Suggestions on how to highlight alternative, related skills they already have in their CV to compensate for the missing ones.

Inputs:
- Candidate CV: {cv_text}
- Job Description (JD): {jd_text}
- Missing Skills: {missing_skills}

Output must be a clean JSON object matching the following structure. Do NOT wrap it in extra markdown format like ```json, just pure JSON object:
{{
  "improvement_tips": "Bạn nên bổ sung...",
  "action_plan": [
    "Khóa học ngắn hạn / Tài liệu: Học cơ bản về X...",
    "Dự án thực tế: Xây dựng một ứng dụng nhỏ dùng Y...",
    "Thay thế bằng kỹ năng có sẵn: Có thể nhấn mạnh kỹ năng Z tương đồng..."
  ]
}}
""")

def generate_matching_advice(cv_text: str, jd_text: str, missing_skills: list) -> dict:
    """Sinh lời khuyên và dự đoán câu hỏi phỏng vấn dựa trên kỹ năng còn thiếu"""
    prompt_value = AI_MATCHING_ADVICE_PROMPT.format_prompt(
        cv_text=cv_text if cv_text else "Not provided",
        jd_text=jd_text if jd_text else "Not provided",
        missing_skills=", ".join(missing_skills) if missing_skills else "None"
    )
    response = llm.invoke(prompt_value)
    try:
        content = response.content
        if isinstance(content, list):
            if len(content) > 0 and isinstance(content[0], dict) and "text" in content[0]:
                content = "".join(b["text"] for b in content if "text" in b)
            else:
                return content
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
        print(f"Error parsing matching advice: {e}")
        return {"improvement_tips": "Rất tiếc, AI đang quá tải và không thể sinh lời khuyên lúc này.", "action_plan": []}
