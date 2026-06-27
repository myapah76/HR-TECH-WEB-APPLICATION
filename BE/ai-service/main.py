from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import (
    EvaluateAnswerResponse, EvaluationAnswerRequest, ExtractedSkill, 
    JobExtractionRequest, JobExtractionResponse, 
    ParseExtractRequest, ParseExtractResponse, 
    MapRelationshipsRequest, MapRelationshipsResponse, 
    SkillRelationship,
    GenerateQuestionsRequest, EvaluateSessionRequest,
    EvaluateSessionResponse, AiMatchingAdviceRequest, AiMatchingAdviceResponse
)
from services import (
    extract_skills, extract_job_skills, download_and_extract_pdf_text,
    generate_interview_questions, evaluate_interview_session, evaluate_audio_answer
)
from sqlalchemy import text
from rag.database import Base, engine
from rag.router import router as rag_router

# Create pgvector extension if it doesn't exist
with engine.connect() as conn:
    conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
    conn.commit()

Base.metadata.create_all(bind=engine)


app = FastAPI(title="HrTech AI Microservice", version="1.0.0")

# Allow Java backend to communicate easily
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(rag_router, prefix="/api/rag", tags=["rag"])

@app.get("/")
def health_check():
    return {"status": "ok", "service": "HrTech AI Microservice"}

@app.post("/api/extract-job", response_model=JobExtractionResponse)
def api_extract_job_skills(req: JobExtractionRequest):
    try:
        skills_data = extract_job_skills(req.description, req.requirements)
        
        parsed_skills = []
        for s in skills_data:
            if "name" in s and "level" in s:
                parsed_skills.append(ExtractedSkill(name=s["name"], level=s["level"]))
                
        return JobExtractionResponse(skills=parsed_skills)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/parse-and-extract", response_model=ParseExtractResponse)
def api_parse_and_extract_cv(req: ParseExtractRequest):
    try:
        # 1. Download and parse text
        text = download_and_extract_pdf_text(req.file_url)
        
        # 2. Extract skills via LLM
        skills_data = extract_skills(text)
        
        # 3. Parse into Pydantic models
        parsed_skills = []
        for s in skills_data:
            if "name" in s and "level" in s:
                parsed_skills.append(ExtractedSkill(name=s["name"], level=s["level"]))
                
        return ParseExtractResponse(
            parsed_content=text,
            skills=parsed_skills
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/map-relationships", response_model=MapRelationshipsResponse)
def api_map_relationships(req: MapRelationshipsRequest):
    try:
        from services import map_relationships_with_full_db
        relationships_data = map_relationships_with_full_db(req.new_skills, req.db_skills)
        
        parsed_rels = []
        for r in relationships_data:
            if "new_skill" in r and "relations" in r:
                from models import SkillRelationDetail
                relations_details = [SkillRelationDetail(target=rel["target"], type=rel["type"]) for rel in r["relations"] if "target" in rel and "type" in rel]
                parsed_rels.append(SkillRelationship(new_skill=r["new_skill"], relations=relations_details))
                
        return MapRelationshipsResponse(relationships=parsed_rels)
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/generate-questions", response_model=list[str])
def api_generate_questions(req: GenerateQuestionsRequest):
    try:
        questions = generate_interview_questions(
            cv_text=req.cv_text,
            jd_text=req.jd_text,
            target_role=req.target_role,
            num_questions=req.num_questions
        )
        return questions
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/api/ai/evaluate-answer", response_model=EvaluateAnswerResponse)
def api_evaluate_answer(req: EvaluationAnswerRequest):
    try:
        evaluation = evaluate_audio_answer(
            cv_text=req.cv_text,
            jd_text=req.jd_text,
            question=req.question,
            audio_url=req.audio_url
        )
        return evaluation
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/evaluate-session", response_model=EvaluateSessionResponse)
def api_evaluate_interview_session(req: EvaluateSessionRequest):
    try:
        evaluation = evaluate_interview_session(
            cv_text=req.cv_text,
            jd_text=req.jd_text,
            history=[h.model_dump() for h in req.history]
        )
        return evaluation
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/candidate-matching-advice", response_model=AiMatchingAdviceResponse)
def api_candidate_matching_advice(req: AiMatchingAdviceRequest):
    try:
        from services import generate_matching_advice
        advice = generate_matching_advice(
            cv_text=req.cv_text,
            jd_text=req.jd_text,
            missing_skills=req.missing_skills
        )
        return AiMatchingAdviceResponse(
            improvement_tips=advice.get("improvement_tips", ""),
            action_plan=advice.get("action_plan", [])
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
