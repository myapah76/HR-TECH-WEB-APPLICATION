from langchain_experimental.text_splitter import SemanticChunker
from langchain_ollama import OllamaEmbeddings
from langchain_core.embeddings import Embeddings
from rag.config import settings
from typing import List
import logging

logger = logging.getLogger(__name__)

class BatchedOllamaEmbeddings(Embeddings):
    def __init__(self, ollama_embeddings: OllamaEmbeddings, batch_size: int = 50):
        self.ollama_embeddings = ollama_embeddings
        self.batch_size = batch_size
        
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        results = []
        total_batches = (len(texts) + self.batch_size - 1) // self.batch_size
        for i in range(0, len(texts), self.batch_size):
            logger.info(f"Embedding batch {i // self.batch_size + 1}/{total_batches} for SemanticChunker...")
            batch = texts[i:i + self.batch_size]
            results.extend(self.ollama_embeddings.embed_documents(batch))
        return results

    def embed_query(self, text: str) -> List[float]:
        return self.ollama_embeddings.embed_query(text)

def chunk_document(full_text: str):
    """
    Chunks a document using Langchain's SemanticChunker with local Ollama embeddings.
    """
    base_embeddings = OllamaEmbeddings(
        model=settings.embedding_model,
        base_url=settings.ollama_base_url
    )
    embeddings = BatchedOllamaEmbeddings(base_embeddings, batch_size=50)
    text_splitter = SemanticChunker(embeddings, breakpoint_threshold_amount=0.85)
    return text_splitter.split_text(full_text)
