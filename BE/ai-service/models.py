from pydantic import BaseModel
from typing import List, Optional

# --- Requests ---
class JobExtractionRequest(BaseModel):
    description: str
    requirements: Optional[str] = ""

class EmbedRequest(BaseModel):
    text: Optional[str] = None
    texts: Optional[List[str]] = None

class ParseExtractRequest(BaseModel):
    file_url: str

# --- Responses ---
class ExtractedSkill(BaseModel):
    name: str
    level: str  # BEGINNER, INTERMEDIATE, ADVANCED, EXPERT

class JobExtractionResponse(BaseModel):
    skills: List[ExtractedSkill]

class EmbedResponse(BaseModel):
    embeddings: List[List[float]]

class ParseExtractResponse(BaseModel):
    parsed_content: str
    skills: List[ExtractedSkill]

class MapRelationshipsRequest(BaseModel):
    new_skills: List[str]
    db_skills: List[str]
    roles: List[str] = []

class SkillRelationDetail(BaseModel):
    target: Optional[str] = None
    parent: Optional[str] = None
    child: Optional[str] = None
    type: str

class SkillRelationship(BaseModel):
    new_skill: str
    suggested_roles: List[str] = []
    relations: List[SkillRelationDetail]

class MapRelationshipsResponse(BaseModel):
    relationships: List[SkillRelationship]

# --- Mock Interview ---
class GenerateQuestionsRequest(BaseModel):
    cv_text: str = ""
    jd_text: str = ""
    target_role: str
    num_questions: int = 5

class InterviewQAItem(BaseModel):
    question: str
    score: float
    feedback: str

class EvaluationAnswerRequest(BaseModel):
    cv_text: str = ""
    jd_text: str = ""
    question: str
    audio_url: str

class EvaluateSessionRequest(BaseModel):
    cv_text: str = ""
    jd_text: str = ""
    history: List[InterviewQAItem]

class EvaluateAnswerResponse(BaseModel):
    score: float
    feedback: str
    modelAnswer: str

class EvaluateSessionResponse(BaseModel):
    overallScore: float
    technicalScore: float
    communicationScore: float
    softSkillsScore: float
    strengths: List[str]
    weaknesses: List[str]
    generalFeedback: str

# --- AI Matching Advice ---
class AiMatchingAdviceRequest(BaseModel):
    cv_text: str
    jd_text: str
    missing_skills: List[str]

class AiMatchingAdviceResponse(BaseModel):
    improvement_tips: str
    action_plan: List[str]

# --- AI Skill Validation ---
class ValidateSkillsRequest(BaseModel):
    skills: List[str]

class ValidateSkillsResponse(BaseModel):
    valid_skills: List[str]

# --- AI Job Posting Review ---
class ReviewJobPostingRequest(BaseModel):
    title: str
    description: str
    requirements: Optional[str] = ""
    benefits: Optional[str] = ""
    location: Optional[str] = ""
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    job_type: Optional[str] = ""
    experience_level: Optional[str] = ""
    position: Optional[str] = ""

class ReviewJobPostingResponse(BaseModel):
    approved: bool
    rejection_reasons: List[str]
    suggestions: List[str]
    overall_message: str
    check_details: dict
