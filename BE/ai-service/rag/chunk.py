from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, Float
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid
import datetime
from rag.database import Base
from pgvector.sqlalchemy import Vector

class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    token_count = Column(Integer, nullable=True)
    metadata_ = Column("metadata", JSONB, default=dict)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    embedding = relationship("ChunkEmbedding", back_populates="chunk", uselist=False, cascade="all, delete-orphan")


class ChunkEmbedding(Base):
    __tablename__ = "chunk_embeddings"

    chunk_id = Column(UUID(as_uuid=True), ForeignKey("document_chunks.id"), primary_key=True)
    embedding = Column(Vector(1024)) # qwen3-embedding:0.6b outputs 1024 dimensions
    model_name = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    chunk = relationship("DocumentChunk", back_populates="embedding")
