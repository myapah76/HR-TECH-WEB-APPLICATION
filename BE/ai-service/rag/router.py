from fastapi import APIRouter, Depends, Header, HTTPException, BackgroundTasks
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import select
from rag.database import get_db
from rag.chunk import DocumentChunk, ChunkEmbedding
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.embeddings import OllamaEmbeddings
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

def indexing_task(req: IndexRequest, db: Session):
    try:
        chunks = chunk_document(req.text)
        process_and_store_chunks(db, req.document_id, chunks, req.metadata)
    except Exception as e:
        logger.error(f"Indexing failed for {req.document_id}: {str(e)}")
        logger.error(traceback.format_exc())

@router.post("/index")
def index_document(req: IndexRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Background indexing of JD or CV text for RAG.
    """
    background_tasks.add_task(indexing_task, req, db)
    return {"message": "Indexing started", "documentId": req.document_id}

# --- CHAT ---
class ChatRequest(BaseModel):
    document_id: str | None = None # Optional filter
    query: str
    top_k: int = 5

class ChatResponse(BaseModel):
    answer: str
    citations: list[dict]

@router.post("/chat", response_model=ChatResponse)
def chat_with_rag(req: ChatRequest, db: Session = Depends(get_db)):
    """
    Chat with the RAG knowledge base.
    """
    if not settings.gemini_api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is missing")

    embeddings = OllamaEmbeddings(
        model=settings.embedding_model,
        base_url=settings.ollama_base_url
    )
    query_vector = embeddings.embed_query(req.query)

    stmt = (
        select(DocumentChunk, ChunkEmbedding.embedding.cosine_distance(query_vector).label('distance'))
        .join(ChunkEmbedding, DocumentChunk.id == ChunkEmbedding.chunk_id)
    )

    if req.document_id:
        try:
            doc_uuid = uuid.UUID(req.document_id)
        except:
            doc_uuid = uuid.uuid5(uuid.NAMESPACE_DNS, req.document_id)
        stmt = stmt.where(DocumentChunk.document_id == doc_uuid)

    stmt = stmt.order_by('distance').limit(req.top_k)
    results = db.execute(stmt).all()

    context_texts = []
    citations = []

    for doc_chunk, distance in results:
        context_texts.append(doc_chunk.content)
        citations.append({
            "chunk_index": doc_chunk.chunk_index,
            "distance": float(distance),
            "metadata": doc_chunk.metadata_
        })

    context_block = "\n\n---\n\n".join(context_texts)

    llm = ChatGoogleGenerativeAI(
        model=settings.llm_model, 
        temperature=0,
        google_api_key=settings.gemini_api_key
    )
    
    prompt = f"""You are a helpful HR assistant for a smart recruitment platform.
Your main role is to answer questions about Job Descriptions or CVs based on the provided Context.

CRITICAL RULES:
1. DO NOT invent, estimate, or calculate "% match" scores between a CV and a Job yourself.
2. If the user asks "How much does my CV match this job?", asks for an exact score, or wants a CV evaluation against a Job, politely tell them to use the explicit "AI Matching" or "Job Recommendation" feature in the platform dashboard to get the exact score calculated by the core Skill Graph engine.
3. Answer the user's questions strictly based on the retrieved context below.
4. If you don't know the answer based on the context, just say that you don't know.

Context:
{context_block}

Question:
{req.query}

Answer:"""

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
