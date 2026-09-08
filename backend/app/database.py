import sqlite3
import aiosqlite
import json
from pathlib import Path
from typing import List, Optional, Dict, Any
import chromadb
from chromadb.config import Settings

from app.config import settings
from app.models import ProcessingStatus

class Database:
    def __init__(self):
        self.db_path = Path(settings.DATABASE_PATH).resolve()
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        
        self.chroma_path = Path(settings.CHROMA_PATH).resolve()
        self.chroma_path.mkdir(parents=True, exist_ok=True)
        
        self.chroma_client = chromadb.PersistentClient(path=str(self.chroma_path))
        self.collection = self.chroma_client.get_or_create_collection("facts")

    async def init_db(self):
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("""
                CREATE TABLE IF NOT EXISTS documents (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    filename TEXT NOT NULL,
                    filepath TEXT,
                    upload_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                    page_count INTEGER DEFAULT 0,
                    status TEXT NOT NULL,
                    error_message TEXT
                )
            """)
            
            await db.execute("""
                CREATE TABLE IF NOT EXISTS facts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    document_id INTEGER,
                    statement TEXT NOT NULL,
                    category TEXT,
                    fact_type TEXT,
                    value TEXT,
                    unit TEXT,
                    time_context TEXT,
                    scope_context TEXT,
                    source_quote TEXT,
                    page_number INTEGER,
                    confidence TEXT,
                    qualifiers TEXT,
                    metadata TEXT,
                    embedding_id TEXT,
                    FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE
                )
            """)
            
            await db.execute("""
                CREATE TABLE IF NOT EXISTS relations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    fact_id_a INTEGER,
                    fact_id_b INTEGER,
                    relation_type TEXT NOT NULL,
                    reasoning TEXT NOT NULL,
                    confidence TEXT,
                    FOREIGN KEY (fact_id_a) REFERENCES facts (id) ON DELETE CASCADE,
                    FOREIGN KEY (fact_id_b) REFERENCES facts (id) ON DELETE CASCADE
                )
            """)
            await db.commit()

    async def create_document(self, filename: str, filepath: str) -> int:
        async with aiosqlite.connect(self.db_path) as db:
            cursor = await db.execute(
                "INSERT INTO documents (filename, filepath, status) VALUES (?, ?, ?)",
                (filename, filepath, ProcessingStatus.PENDING.value)
            )
            await db.commit()
            return cursor.lastrowid

    async def update_document_status(self, document_id: int, status: ProcessingStatus, page_count: int = 0, error_message: str = None):
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
                "UPDATE documents SET status = ?, page_count = CASE WHEN ? > 0 THEN ? ELSE page_count END, error_message = ? WHERE id = ?",
                (status.value, page_count, page_count, error_message, document_id)
            )
            await db.commit()

    async def get_document(self, document_id: int) -> Optional[dict]:
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute("SELECT * FROM documents WHERE id = ?", (document_id,))
            row = await cursor.fetchone()
            if row:
                d = dict(row)
                c_cursor = await db.execute("SELECT COUNT(*) FROM facts WHERE document_id = ?", (document_id,))
                d['fact_count'] = (await c_cursor.fetchone())[0]
                return d
            return None

    async def list_documents(self) -> List[dict]:
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute("""
                SELECT d.*, (SELECT COUNT(*) FROM facts f WHERE f.document_id = d.id) as fact_count
                FROM documents d ORDER BY upload_time DESC
            """)
            return [dict(row) for row in await cursor.fetchall()]

    async def delete_document(self, document_id: int):
        await self.delete_document_data(document_id)
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("DELETE FROM documents WHERE id = ?", (document_id,))
            await db.commit()

    async def create_fact(self, document_id: int, fact: dict) -> int:
        qualifiers = json.dumps(fact.get('qualifiers', [])) if fact.get('qualifiers') else None
        metadata = json.dumps(fact.get('metadata', {})) if fact.get('metadata') else None
        
        async with aiosqlite.connect(self.db_path) as db:
            cursor = await db.execute("""
                INSERT INTO facts (
                    document_id, statement, category, fact_type, value, unit, 
                    time_context, scope_context, source_quote, page_number, 
                    confidence, qualifiers, metadata
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                document_id, fact['statement'], fact['category'], fact['fact_type'],
                fact.get('value'), fact.get('unit'), fact.get('time_context'),
                fact.get('scope_context'), fact['source_quote'], fact.get('page_number'),
                fact['confidence'], qualifiers, metadata
            ))
            await db.commit()
            return cursor.lastrowid

    async def get_fact(self, fact_id: int) -> Optional[dict]:
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute("""
                SELECT f.*, d.filename as document_name 
                FROM facts f JOIN documents d ON f.document_id = d.id 
                WHERE f.id = ?
            """, (fact_id,))
            row = await cursor.fetchone()
            if row:
                d = dict(row)
                d['qualifiers'] = json.loads(d['qualifiers']) if d['qualifiers'] else []
                d['metadata'] = json.loads(d['metadata']) if d['metadata'] else {}
                return d
            return None

    async def get_facts_by_document(self, document_id: int) -> List[dict]:
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute("""
                SELECT f.*, d.filename as document_name 
                FROM facts f JOIN documents d ON f.document_id = d.id 
                WHERE document_id = ?
            """, (document_id,))
            rows = await cursor.fetchall()
            result = []
            for row in rows:
                d = dict(row)
                d['qualifiers'] = json.loads(d['qualifiers']) if d['qualifiers'] else []
                d['metadata'] = json.loads(d['metadata']) if d['metadata'] else {}
                result.append(d)
            return result

    async def get_all_facts(self) -> List[dict]:
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute("""
                SELECT f.*, d.filename as document_name 
                FROM facts f JOIN documents d ON f.document_id = d.id 
                ORDER BY f.id DESC
            """)
            rows = await cursor.fetchall()
            result = []
            for row in rows:
                d = dict(row)
                d['qualifiers'] = json.loads(d['qualifiers']) if d['qualifiers'] else []
                d['metadata'] = json.loads(d['metadata']) if d['metadata'] else {}
                result.append(d)
            return result

    async def create_relation(self, fact_id_a: int, fact_id_b: int, relation_type: str, reasoning: str, confidence: str) -> int:
        async with aiosqlite.connect(self.db_path) as db:
            cursor = await db.execute("""
                INSERT INTO relations (fact_id_a, fact_id_b, relation_type, reasoning, confidence)
                VALUES (?, ?, ?, ?, ?)
            """, (fact_id_a, fact_id_b, relation_type, reasoning, confidence))
            await db.commit()
            return cursor.lastrowid

    async def get_relations(self) -> List[dict]:
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute("SELECT * FROM relations ORDER BY id DESC")
            return [dict(r) for r in await cursor.fetchall()]
            
    async def get_relations_by_type(self, relation_type: str) -> List[dict]:
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute("SELECT * FROM relations WHERE relation_type = ? ORDER BY id DESC", (relation_type,))
            return [dict(r) for r in await cursor.fetchall()]

    async def delete_document_data(self, document_id: int):
        # We also need to delete facts from Chroma
        facts = await self.get_facts_by_document(document_id)
        if facts:
            ids = [str(f['id']) for f in facts]
            try:
                self.collection.delete(ids=ids)
            except Exception:
                pass
        
        async with aiosqlite.connect(self.db_path) as db:
            # Foreign keys ON DELETE CASCADE will handle relations if enabled, but let's be explicit
            await db.execute("DELETE FROM relations WHERE fact_id_a IN (SELECT id FROM facts WHERE document_id = ?) OR fact_id_b IN (SELECT id FROM facts WHERE document_id = ?)", (document_id, document_id))
            await db.execute("DELETE FROM facts WHERE document_id = ?", (document_id,))
            await db.commit()

db = Database()
