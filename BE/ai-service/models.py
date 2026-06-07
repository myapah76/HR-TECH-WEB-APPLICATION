from pydantic import BaseModel
from typing import List, Optional

# --- Requests ---
class JobExtractionRequest(BaseModel):
    description: str
    requirements: Optional[str] = ""

class EmbedRequest(BaseModel):
    text: Optional[str] = None
    texts: Optional[List[str]] = None

# --- Responses ---
class ExtractedSkill(BaseModel):
    name: str
    level: str  # BEGINNER, INTERMEDIATE, ADVANCED, EXPERT

class ExtractedJobSkill(BaseModel):
    name: str
    level: str
    is_mandatory: bool

class JobExtractionResponse(BaseModel):
    skills: List[ExtractedJobSkill]

class EmbedResponse(BaseModel):
    embeddings: List[List[float]]

class ParseExtractRequest(BaseModel):
    file_url: str

class ParseExtractResponse(BaseModel):
    parsed_content: str
    skills: List[ExtractedSkill]
