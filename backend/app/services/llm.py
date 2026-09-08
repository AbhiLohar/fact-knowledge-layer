import asyncio
import json
import logging
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

    def count_tokens(self, text: str) -> int:
        return len(self.encoder.encode(text))

    async def chat_completion(
        self, 
        messages: List[Dict[str, str]], 
        model: str = None, 
        response_format: Optional[Dict[str, str]] = None, 
        temperature: float = 0.1
    ) -> str:
        model = model or settings.LLM_MODEL
        for attempt in range(3):
            try:
                kwargs = {
                    "model": model,
                    "messages": messages,
                    "temperature": temperature,
                }
                if response_format:
                    kwargs["response_format"] = response_format
                
                response = await self.client.chat.completions.create(**kwargs)
                return response.choices[0].message.content
            except Exception as e:
                logger.error(f"Error in chat_completion (attempt {attempt+1}): {e}")
                if attempt == 2:
                    return ""
                await asyncio.sleep(2 ** attempt)

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
        try:
            response = await self.client.embeddings.create(
                model=settings.EMBEDDING_MODEL,
                input=text
            )
            return response.data[0].embedding
        except Exception as e:
            logger.error(f"Error getting embedding: {e}")
            return []

    async def get_embeddings_batch(self, texts: List[str], batch_size: int = 100) -> List[List[float]]:
        embeddings = []
        for i in range(0, len(texts), batch_size):
            batch_texts = texts[i:i+batch_size]
            try:
                response = await self.client.embeddings.create(
                    model=settings.EMBEDDING_MODEL,
                    input=batch_texts
                )
                embeddings.extend([data.embedding for data in response.data])
            except Exception as e:
                logger.error(f"Error in batch embeddings: {e}")
                embeddings.extend([[] for _ in batch_texts])
        return embeddings

llm_service = LLMService()
