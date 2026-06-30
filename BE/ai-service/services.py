import os
import json
import time
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from dotenv import load_dotenv

import os
from pathlib import Path
import requests
import fitz  # PyMuPDF
from typing import List

import base64
import requests
from langchain_core.messages import HumanMessage

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



# --- Prompts ---
EXTRACTION_PROMPT = PromptTemplate.from_template("""
You are an advanced skill extraction engine for IT/Tech recruitment.
Analyze the following CV/resume text and extract all technical and professional skills mentioned.

WHAT TO EXTRACT:
- Programming languages (e.g., java, python, go, kotlin, c++, c#)
- Frameworks & libraries (e.g., springboot, react, django, nestjs, flutter)
- Databases (e.g., postgresql, mysql, mongodb, redis, elasticsearch)
- Tools & platforms (e.g., docker, kubernetes, git, jenkins, aws, gcp)
- IT methodologies (e.g., agile, scrum, cicd, restapi, microservices)
- IT-relevant soft skills ONLY if explicitly stated in a tech context (e.g., teamwork, problemsolving, communication)

WHAT NOT TO EXTRACT:
- Single-character names: NEVER output a name with only 1 character. "R" language must be written as "rlang". "C" language must be "clanguage".
- Generic academic terms: "mathematics", "physics", "english", "statistics" (unless it's a specific tool like "rstudio")
- Completely non-IT skills: "cooking", "accounting", "marketing", "driving license"
- Vague filler words: "experience", "knowledge", "understanding", "familiar", "ability"
- Job titles or roles: "developer", "engineer", "manager", "intern", "fresher"
- Company names or product names that are not skills: "google", "apple", "facebook"
- Section headers, bullet symbols, or formatting artifacts: "-", "•", ":", "|"

NORMALIZATION RULES (apply strictly before outputting):
1. All lowercase, remove spaces, dots, and dashes EXCEPT for "+" and "#" in language names.
   - "React", "ReactJS", "React.js" → "react"
   - "Node.js" → "nodejs"
   - "Vue.js" → "vuejs"
   - "Spring Boot" → "springboot"
   - "React Native" → "reactnative"
   - "Amazon Web Services" → "amazonwebservices"
   - "C++" → "c++" (keep ++)
   - "C#" → "c#" (keep #)
   - "R" (the statistical language) → "rlang"
   - "C" (the language) → "clanguage"
2. Expand common abbreviations to their full normalized form:
   - "AWS" → "amazonwebservices"
   - "GCP" → "googlecloudplatform"
   - "K8s" → "kubernetes"
   - "CI/CD" → "cicd"
   - "REST" → "restapi"
   - "ML" → "machinelearning"
   - "AI" → "artificialintelligence"
3. Deduplicate: if two names normalize to the same string, only output it once.
4. MINIMUM LENGTH: every output name must be at least 2 characters after normalization.

PROFICIENCY LEVEL:
- Infer from context: BEGINNER, INTERMEDIATE, ADVANCED, EXPERT.
- If unclear, use INTERMEDIATE.

Return ONLY a valid JSON array with no extra text. Format:
[{{ "name": "java", "level": "ADVANCED" }}, {{ "name": "react", "level": "INTERMEDIATE" }}]

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
    response = invoke_llm_with_retry(prompt_value)
    
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
Analyze the following Job Description and Requirements to extract all technical and professional skills required or preferred.

WHAT TO EXTRACT:
- Programming languages (e.g., java, python, go, kotlin, c++, c#)
- Frameworks & libraries (e.g., springboot, react, django, nestjs, flutter)
- Databases (e.g., postgresql, mysql, mongodb, redis, elasticsearch)
- Tools & platforms (e.g., docker, kubernetes, git, jenkins, aws, gcp)
- IT methodologies (e.g., agile, scrum, cicd, restapi, microservices)
- IT-relevant soft skills ONLY if explicitly stated in a tech context (e.g., teamwork, problemsolving, communication)

WHAT NOT TO EXTRACT:
- Single-character names: NEVER output a name with only 1 character. "R" language must be written as "rlang". "C" language must be "clanguage".
- Generic academic terms: "mathematics", "physics", "english", "statistics"
- Completely non-IT skills: "cooking", "accounting", "marketing", "driving license"
- Vague filler words: "experience", "knowledge", "understanding", "familiar", "ability", "proficient"
- Job titles or roles: "developer", "engineer", "manager", "intern", "fresher", "senior", "junior"
- Company names that are not skills: "google", "apple", "facebook"
- Section headers, bullet symbols, or formatting artifacts: "-", "•", ":", "|"
- Salary, years of experience, or contract terms

NORMALIZATION RULES (apply strictly before outputting):
1. All lowercase, remove spaces, dots, and dashes EXCEPT for "+" and "#" in language names.
   - "React", "ReactJS", "React.js" → "react"
   - "Node.js" → "nodejs"
   - "Spring Boot" → "springboot"
   - "React Native" → "reactnative"
   - "Amazon Web Services" → "amazonwebservices"
   - "C++" → "c++" (keep ++)
   - "C#" → "c#" (keep #)
   - "R" (the statistical language) → "rlang"
   - "C" (the language) → "clanguage"
2. Expand common abbreviations to their full normalized form:
   - "AWS" → "amazonwebservices"
   - "GCP" → "googlecloudplatform"
   - "K8s" → "kubernetes"
   - "CI/CD" → "cicd"
   - "REST" → "restapi"
   - "ML" → "machinelearning"
   - "AI" → "artificialintelligence"
3. Deduplicate: if two names normalize to the same string, only output it once.
4. MINIMUM LENGTH: every output name must be at least 2 characters after normalization.

PROFICIENCY LEVEL:
- Infer required level from context: BEGINNER, INTERMEDIATE, ADVANCED, EXPERT.
- If unspecified, use INTERMEDIATE.

Return ONLY a valid JSON array with no extra text. Format:
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
    response = invoke_llm_with_retry(prompt_value)
    
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
Your task is to:
1. Identify relationships between each new skill and the existing `db_skills` according to the rules below.
2. Recommend the most appropriate IT job roles ("suggested_roles") for each new skill from the following list of canonical roles:
   {roles}

CRITICAL ROLE RECOMMENDATION RULE:
- Every skill in `new_skills` MUST belong to at least one role from the provided list. Choose the most relevant role(s).
- Do NOT return an empty array for `suggested_roles` under any circumstances.
- Use this guide to assign roles correctly:
  * backend: server-side languages & frameworks (java, python, springboot, django, nodejs, php, dotnet, express)
  * frontend: client-side technologies (react, vuejs, angular, html, css, javascript, typescript)
  * fullstack: skills used across both sides (nextjs, nuxtjs, graphql, restapi)
  * mobile: mobile app development (flutter, reactnative, swift, kotlin, android, ios)
  * devops: infrastructure, cloud & CI/CD (docker, kubernetes, aws, gcp, jenkins, terraform, cicd, linux, bash)
  * data: data processing & analytics (sql, postgresql, mongodb, spark, kafka, airflow, dbt, powerbi, tableau)
  * ai: machine learning & AI (tensorflow, pytorch, scikitlearn, huggingface, langchain, opencv, nlp)
  * qa: testing tools & practices (selenium, jest, cypress, jmeter, postman, testng)
  * security: security tools & practices (owasp, burpsuite, wireshark, penetration testing, cryptography)
  * design: UI/UX & visual tools (figma, adobexd, sketch, photoshop, illustrator)
  * ba: requirement & product management (jira, confluence, trello, notion, agile, scrum)
  * game: game development (unity, unreal, godot, opengl, gamedev)
  * embedded: low-level & hardware (arduino, raspberrypi, rtos, firmware, c, assembly)
  * tools: cross-functional tools used across many roles that do NOT fit cleanly into one category above
    Examples of 'tools': git, github, gitlab, bitbucket, vscode, intellij, bash, powershell, npm, maven, gradle, swagger
  * If a skill fits multiple roles equally (e.g., postgresql fits both 'backend' and 'data'), assign both.

Relationship Rules & Domain Mapping:
1. CHILD_TO_PARENT: If the `new_skill` is a child, subset, framework, or specific tool that DIRECTLY belongs to a parent `db_skill` (e.g., springboot is CHILD_TO_PARENT of java). Only use this for the IMMEDIATE parent, not a grandparent.
2. PARENT_TO_CHILD: If the `new_skill` is a parent, category, or language that DIRECTLY encompasses a specific child `db_skill` (e.g., java is PARENT_TO_CHILD of springboot). Only use this for IMMEDIATE children, not grandchildren.
3. RELATED_TO: If the `new_skill` and `db_skill` are siblings, alternatives, or often used together in the same technology stack, and do NOT have a direct parent-child hierarchy.

CRITICAL RELATIONSHIP RULES:
- Only output DIRECT (1-hop) relationships. Do NOT create relationships that are already implied by transitivity.
- Choose at most ONE relationship type between any two specific skills.
- Only output the exact skill names from the provided `db_skills` array. Do not invent new skills.
- Do NOT include synonyms. We assume skill names are already normalized.
- Aggressively scan `db_skills` for any skills sharing a domain, framework family, or technology stack with `new_skill`. Be thorough but only for DIRECT relationships.

Return ONLY a valid JSON array of objects. Example format:
[
  {{
    "new_skill": "nextjs",
    "suggested_roles": ["frontend", "fullstack"],
    "relations": [
      {{ "target": "react", "type": "CHILD_TO_PARENT" }},
      {{ "target": "nodejs", "type": "RELATED_TO" }}
    ]
  }},
  {{
    "new_skill": "git",
    "suggested_roles": ["tools"],
    "relations": []
  }},
  {{
    "new_skill": "java",
    "suggested_roles": ["backend"],
    "relations": [
      {{ "target": "springboot", "type": "PARENT_TO_CHILD" }}
    ]
  }}
]

If no relations are found for a new skill, set its "relations" to [].
Make sure the returned JSON is valid.

New Skills:
{new_skills}

All DB Skills:
{db_skills}
""")

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
    response = invoke_llm_with_retry(interview_questions_prompt)

    try:
        content = response.content
        if isinstance(content, str):
            return json.loads(content.strip())
        return content
    except Exception as e:
        print(f"Error parsing generated questions: {e}")
        return []
    
EVALUATE_AUDIO_ANSWER_PROMPT = """
You are an expert Senior IT Recruiter.
Analyze the candidate's spoken answer (provided in the audio file) to the following interview question, using the candidate's CV and the Job Description (JD) as context.

Inputs:
- Candidate CV: {cv_text}
- Job Description (JD): {jd_text}
- Interview Question: {question}

Tasks:
Evaluate the candidate's spoken answer directly from the audio file:
1. Rate the answer correctness and completeness on a scale of 0.0 to 10.0. Set this as "score".
2. Provide constructive feedback (nhận xét) on technical accuracy, completeness, and communication structure (e.g., clarity, confidence, pacing heard in the audio) in Vietnamese. Set this as "feedback".
3. Provide a recommended model answer (câu trả lời tối ưu gợi ý) in Vietnamese. Set this as "modelAnswer".

CRITICAL RULES:
- All output fields (feedback, modelAnswer) MUST be in Vietnamese.
- Output must be a clean JSON object matching the following structure (do NOT wrap it in markdown block like ```json):
{{
  "score": 8.0,
  "feedback": "...",
  "modelAnswer": "..."
}}
"""

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
        content = res.content
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
        print(f"Error evaluating audio answer: {e}")
        return {
            "score": 0.0,
            "feedback": f"Lỗi phân tích âm thanh từ AI: {str(e)}",
            "modelAnswer": ""
        }

INTERVIEW_EVALUATION_PROMPT = PromptTemplate.from_template("""
You are an expert Senior IT Recruiter.
Evaluate the candidate's overall mock interview performance based on the CV, Job Description (JD), and the feedback/scores of each question they answered.
Inputs:
- Candidate CV: {cv_text}
- Job Description (JD): {jd_text}
- Question Feedbacks:
{transcript_text}
Evaluation Guidelines:
1. Rate the overall score on a scale of 0.0 to 10.0.
2. Rate individual score components: Technical (chuyên môn), Communication (giao tiếp), Soft Skills (kỹ năng mềm) on a scale of 0.0 to 10.0.
3. Detail strengths and weaknesses in Vietnamese.
4. Provide a general feedback summary in Vietnamese.
5. Language: All feedbacks, suggestions, and text MUST be in Vietnamese.
6. Output must be a clean JSON object matching the following structure, do NOT wrap it in extra markdown format like ```json, just pure JSON:
{{
  "overallScore": 8.5,
  "technicalScore": 8.0,
  "communicationScore": 9.0,
  "softSkillsScore": 8.5,
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "generalFeedback": "..."
}}
""")

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
        cv_text = cv_text if cv_text else "Not provided",
        jd_text = jd_text if jd_text else "Not provided",
        transcript_text = transcript_text
    )
    response = invoke_llm_with_retry(interview_evaluation_prompt)
    try:
        content = response.content
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
    response = invoke_llm_with_retry(prompt_value)
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

VALIDATE_SKILLS_PROMPT = PromptTemplate.from_template("""
You are an expert IT taxonomist.
You are given a list of extracted skill strings that are NOT in our database yet.
Some might be real IT skills (e.g. "python", "react", "docker", "aws"), while others might be fake, garbage text, misspelled, generic soft skills, or non-IT terms (e.g. "cooking", "experience", "xyz123tech", "good", "knowledge").

Your task is to filter the list and return ONLY the strings that represent actual, recognized IT technologies, programming languages, frameworks, tools, or IT methodologies.
DO NOT normalize or change the spelling of the valid skills, return them exactly as provided in the input list.

Input skills to validate:
{skills}

Return ONLY a valid JSON array of strings containing the valid skills. Do NOT wrap it in extra markdown format like ``json.
If none are valid, return: []
""")

def validate_it_skills(skills: list[str]) -> list[str]:
    if not skills:
        return []
    prompt_value = VALIDATE_SKILLS_PROMPT.format_prompt(skills=json.dumps(skills))
    response = invoke_llm_with_retry(prompt_value)
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
            parsed = json.loads(content.strip())
            if isinstance(parsed, list):
                return parsed
        return []
    except Exception as e:
        print(f"Error parsing validation response: {e}")
        return []

