from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import EmbedRequest, EmbedResponse, ExtractedSkill, JobExtractionRequest, JobExtractionResponse, ExtractedJobSkill, ParseExtractRequest, ParseExtractResponse, MapRelationshipsRequest, MapRelationshipsResponse, SkillRelationship
from services import extract_skills, extract_job_skills, download_and_extract_pdf_text
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
            if "name" in s and "level" in s and "is_mandatory" in s:
                parsed_skills.append(ExtractedJobSkill(name=s["name"], level=s["level"], is_mandatory=s["is_mandatory"]))
                
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
            if "new_skill" in r and "related_to" in r:
                parsed_rels.append(SkillRelationship(new_skill=r["new_skill"], related_to=r["related_to"]))
                
        return MapRelationshipsResponse(relationships=parsed_rels)
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
