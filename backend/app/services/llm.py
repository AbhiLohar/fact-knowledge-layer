import asyncio
import json
import logging
import hashlib
from typing import List, Dict, Any, Optional
import tiktoken
from openai import AsyncOpenAI
from app.config import settings

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        api_key = settings.OPENAI_API_KEY.strip() if settings.OPENAI_API_KEY else "dummy-key-for-init"
        self.client = AsyncOpenAI(api_key=api_key)
        self.encoder = tiktoken.get_encoding("cl100k_base")

    def is_api_configured(self) -> bool:
        key = (settings.OPENAI_API_KEY or "").strip()
        return bool(key and not key.startswith("dummy") and "your-" not in key and len(key) > 15)

    def count_tokens(self, text: str) -> int:
        return len(self.encoder.encode(text))

    async def chat_completion(
        self, 
        messages: List[Dict[str, str]], 
        model: str = None, 
        response_format: Optional[Dict[str, str]] = None, 
        temperature: float = 0.1
    ) -> str:
        if not self.is_api_configured():
            logger.debug("OpenAI API key not configured. Skipping live network call.")
            return ""

        model = model or settings.LLM_MODEL
        for attempt in range(2):
            try:
                kwargs = {
                    "model": model,
                    "messages": messages,
                    "temperature": temperature,
                    "timeout": 15.0,
                }
                if response_format:
                    kwargs["response_format"] = response_format
                
                response = await self.client.chat.completions.create(**kwargs)
                return response.choices[0].message.content
            except Exception as e:
                logger.error(f"Error in chat_completion (attempt {attempt+1}): {e}")
                if attempt == 1:
                    return ""
                await asyncio.sleep(1)

    async def chat_completion_json(self, messages: List[Dict[str, str]], model: str = None) -> dict:
        content = await self.chat_completion(
            messages=messages, 
            model=model, 
            response_format={"type": "json_object"}
        )
        try:
            return json.loads(content) if content else {}
        except json.JSONDecodeError:
            logger.error(f"Failed to decode JSON from LLM: {content}")
            return {}

    async def get_embedding(self, text: str) -> List[float]:
        if not self.is_api_configured():
            # Generate deterministic 1536-dim normalized vector from text hash
            h = hashlib.sha256(text.encode("utf-8")).digest()
            vals = [((b / 255.0) - 0.5) for b in (h * 48)[:1536]]
            norm = sum(v * v for v in vals) ** 0.5 or 1.0
            return [v / norm for v in vals]

        try:
            response = await self.client.embeddings.create(
                model=settings.EMBEDDING_MODEL,
                input=text,
                timeout=10.0
            )
            return response.data[0].embedding
        except Exception as e:
            logger.error(f"Error getting embedding: {e}")
            # Fallback to deterministic pseudo-embedding
            h = hashlib.sha256(text.encode("utf-8")).digest()
            vals = [((b / 255.0) - 0.5) for b in (h * 48)[:1536]]
            norm = sum(v * v for v in vals) ** 0.5 or 1.0
            return [v / norm for v in vals]

    async def get_embeddings_batch(self, texts: List[str], batch_size: int = 100) -> List[List[float]]:
        if not texts:
            return []
            
        if not self.is_api_configured():
            return [await self.get_embedding(t) for t in texts]

        embeddings = []
        for i in range(0, len(texts), batch_size):
            batch_texts = texts[i:i+batch_size]
            try:
                response = await self.client.embeddings.create(
                    model=settings.EMBEDDING_MODEL,
                    input=batch_texts,
                    timeout=15.0
                )
                embeddings.extend([data.embedding for data in response.data])
            except Exception as e:
                logger.error(f"Error in batch embeddings: {e}")
                # Fallback to individual embeddings
                for t in batch_texts:
                    embeddings.append(await self.get_embedding(t))
        return embeddings

llm_service = LLMService()
