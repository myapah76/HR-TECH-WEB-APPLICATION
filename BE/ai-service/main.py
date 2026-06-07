from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import EmbedRequest, EmbedResponse, ExtractedSkill, JobExtractionRequest, JobExtractionResponse, ExtractedJobSkill, ParseExtractRequest, ParseExtractResponse
from services import extract_skills, get_embeddings, extract_job_skills, download_and_extract_pdf_text

app = FastAPI(title="HrTech AI Microservice", version="1.0.0")

# Allow Java backend to communicate easily
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.post("/api/embed", response_model=EmbedResponse)
def api_get_embeddings(req: EmbedRequest):
    try:
        texts_to_embed = []
        if req.text:
            texts_to_embed.append(req.text)
        if req.texts:
            texts_to_embed.extend(req.texts)
        if not texts_to_embed:
            return EmbedResponse(embeddings=[])
            
        embeddings = get_embeddings(texts_to_embed)
        return EmbedResponse(embeddings=embeddings)
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
