from sqlalchemy.orm import Session
from sqlalchemy import select
from rag.chunk import DocumentChunk, ChunkEmbedding
from langchain_ollama import OllamaEmbeddings
from rag.chunking import BatchedOllamaEmbeddings
from rag.config import settings
import uuid

def process_and_store_chunks(db: Session, document_id: str, chunks: list[str], metadata: dict = None):
    """
    Generate embeddings for each chunk and store them in PostgreSQL (pgvector).
    """
    base_embeddings_model = OllamaEmbeddings(
        model=settings.embedding_model,
        base_url=settings.ollama_base_url
    )
    embeddings_model = BatchedOllamaEmbeddings(base_embeddings_model, batch_size=50)
    
    vectors = embeddings_model.embed_documents(chunks)
    
    try:
        doc_uuid = uuid.UUID(document_id)
    except:
        doc_uuid = uuid.uuid5(uuid.NAMESPACE_DNS, document_id)

    chunk_ids_stmt = select(DocumentChunk.id).filter(DocumentChunk.document_id == doc_uuid)
    db.query(ChunkEmbedding).filter(ChunkEmbedding.chunk_id.in_(chunk_ids_stmt)).delete(synchronize_session=False)
    db.query(DocumentChunk).filter(DocumentChunk.document_id == doc_uuid).delete(synchronize_session=False)
    db.commit()

    if metadata is None:
        metadata = {}

    for i, chunk_text in enumerate(chunks):
        doc_chunk = DocumentChunk(
            document_id=doc_uuid,
            chunk_index=i,
            content=chunk_text,
            token_count=len(chunk_text.split()), 
            metadata_=metadata
        )
        db.add(doc_chunk)
        db.flush()

        chunk_emb = ChunkEmbedding(
            chunk_id=doc_chunk.id,
            embedding=vectors[i],
            model_name=settings.embedding_model
        )
        db.add(chunk_emb)

    db.commit()
