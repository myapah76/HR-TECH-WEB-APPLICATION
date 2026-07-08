from fastapi import APIRouter, Depends, Header, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
import json
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import select
from rag.database import get_db
from rag.chunk import DocumentChunk, ChunkEmbedding
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_ollama import OllamaEmbeddings
from rag.config import settings
from rag.chunking import chunk_document
from rag.embedding import process_and_store_chunks
import logging
import uuid
import traceback

logger = logging.getLogger(__name__)

router = APIRouter()

# --- INDEXING ---
class IndexRequest(BaseModel):
    document_id: str
    text: str
    metadata: dict = {}

class ChatRequest(BaseModel):
    document_id: str | None = None # Legacy support
    document_ids: list[str] | None = None # Support multiple docs
    query: str
    top_k: int = 5

class ChatResponse(BaseModel):
    answer: str
    citations: list[dict]

def indexing_task(req: IndexRequest, db: Session):
    try:
        chunks = chunk_document(req.text)
        process_and_store_chunks(db, req.document_id, chunks, req.metadata)
    except Exception as e:
        logger.error(f"Indexing failed for {req.document_id}: {str(e)}")
        logger.error(traceback.format_exc())

def prepare_rag_context_and_prompt(req: ChatRequest, db: Session):
    if not settings.gemini_api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is missing")

    # 1. Vector Search ngữ cảnh từ SQLite
    embeddings = OllamaEmbeddings(
        model=settings.embedding_model,
        base_url=settings.ollama_base_url
    )
    query_vector = embeddings.embed_query(req.query)

    stmt = (
        select(DocumentChunk, ChunkEmbedding.embedding.cosine_distance(query_vector).label('distance'))
        .join(ChunkEmbedding, DocumentChunk.id == ChunkEmbedding.chunk_id)
    )

    uuids = []
    if req.document_id:
        try:
            uuids.append(uuid.UUID(req.document_id))
        except:
            uuids.append(uuid.uuid5(uuid.NAMESPACE_DNS, req.document_id))
            
    if req.document_ids:
        for did in req.document_ids:
            try:
                uuids.append(uuid.UUID(did))
            except:
                uuids.append(uuid.uuid5(uuid.NAMESPACE_DNS, did))
                
    if uuids:
        stmt = stmt.where(DocumentChunk.document_id.in_(uuids))

    stmt = stmt.order_by('distance').limit(req.top_k)
    results = db.execute(stmt).all()

    context_texts = []
    citations = []

    for doc_chunk, distance in results:
        context_texts.append(doc_chunk.content)
        citations.append({
            "chunk_index": doc_chunk.chunk_index,
            "distance": float(distance),
            "metadata": doc_chunk.metadata_,
            "text": doc_chunk.content
        })

    context_block = "\n\n---\n\n".join(context_texts)

    # 2. Khởi tạo LLM Gemini
    llm = ChatGoogleGenerativeAI(
        model=settings.llm_model, 
        temperature=0,
        google_api_key=settings.gemini_api_key
    )
    
    # 3. Tạo Prompt đầy đủ
    prompt = f"""You are a helpful HR assistant for a smart recruitment platform.
Your main role is to answer questions about Job Descriptions or CVs based on the provided Context.

CRITICAL RULES:
1. You can analyze and evaluate the CV against the Job Description. If asked, you may provide an estimated "% match" score or qualitative assessment based on the provided context.
2. When asked about improving a CV or missing skills, provide actionable advice, constructive feedback, and suggest a clear study path or learning resources to help the candidate meet the Job Requirements.
3. Base your analysis primarily on the retrieved context below, but feel free to use your general knowledge of IT/Tech skills to infer relationships (e.g., knowing that React is a JS framework) and provide study paths.
4. If the context does not contain a CV or a Job Description, kindly let the user know what is missing.

Context:
{context_block}

Question:
{req.query}

Answer:"""

    return prompt, citations, llm


@router.post("/index")
def index_document(req: IndexRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Background indexing of JD or CV text for RAG.
    """
    background_tasks.add_task(indexing_task, req, db)
    return {"message": "Indexing started", "documentId": req.document_id}

# --- CHAT ---

@router.post("/chat", response_model=ChatResponse)
def chat_with_rag(req: ChatRequest, db: Session = Depends(get_db)):
    """
    Chat đồng bộ với RAG
    """
    prompt, citations, llm = prepare_rag_context_and_prompt(req, db)

    response = llm.invoke(prompt)
    content = response.content
    
    if isinstance(content, list):
        text_parts = []
        for part in content:
            if isinstance(part, str):
                text_parts.append(part)
            elif isinstance(part, dict) and "text" in part:
                text_parts.append(part["text"])
        content = "".join(text_parts)

    return {
        "answer": str(content),
        "citations": citations
    }

@router.post("/chat/stream")
async def chat_with_rag_stream(req: ChatRequest, db: Session = Depends(get_db)):
    """
    Chat bất đồng bộ dạng Stream (Nhận kết quả từng từ qua SSE)
    """
    prompt, citations, llm = prepare_rag_context_and_prompt(req, db)

    async def event_generator():
        import asyncio
        async for chunk in llm.astream(prompt):
            yield f"data: {json.dumps({'text': chunk.content}, ensure_ascii=False)}\n\n"
    
    return StreamingResponse(event_generator(), media_type="text/event-stream")
