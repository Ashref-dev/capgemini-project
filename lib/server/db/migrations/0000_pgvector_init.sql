-- Enable pgvector extension. Must run BEFORE Drizzle migrations that reference vector type.
CREATE EXTENSION IF NOT EXISTS vector;
