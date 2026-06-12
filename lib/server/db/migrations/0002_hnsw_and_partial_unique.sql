-- HNSW cosine index on document embeddings for fast similarity search
CREATE INDEX IF NOT EXISTS document_embeddings_hnsw_cosine
  ON document_embeddings USING hnsw (embedding vector_cosine_ops);

-- Partial unique index for partial-message-persistence upsert
CREATE UNIQUE INDEX IF NOT EXISTS chat_messages_thread_msg_uq
  ON chat_messages(thread_id, message_id) WHERE message_id IS NOT NULL;
