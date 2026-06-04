from pydantic import BaseModel
from typing import List, Optional

# --- Requests ---
class ExtractionRequest(BaseModel):
    cv_text: str

class EmbedRequest(BaseModel):
    text: Optional[str] = None
    texts: Optional[List[str]] = None

# --- Responses ---
class ExtractedSkill(BaseModel):
    name: str
    level: str  # BEGINNER, INTERMEDIATE, ADVANCED, EXPERT

class ExtractionResponse(BaseModel):
    skills: List[ExtractedSkill]

class EmbedResponse(BaseModel):
    embeddings: List[List[float]]
