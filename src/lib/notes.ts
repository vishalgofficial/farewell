import { createServerFn } from "@tanstack/react-start";
import { neon } from "@neondatabase/serverless";
import { z } from "zod";

export type SharedNote = {
  id: string;
  text: string;
  from: string;
  likes: number;
  createdAt: string;
};

const noteSchema = z.object({
  clientId: z.string().trim().min(1).max(100),
  text: z.string().trim().min(1).max(5000),
  from: z.string().trim().min(1).max(24),
});

const likeSchema = z.object({ id: z.string().regex(/^\d+$/) });

function database() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("The shared note database is not configured.");
  return neon(databaseUrl);
}

async function ensureSchema(sql: ReturnType<typeof neon>) {
  await sql`
    CREATE TABLE IF NOT EXISTS farewell_notes (
      id BIGSERIAL PRIMARY KEY,
      client_id TEXT UNIQUE NOT NULL,
      message TEXT NOT NULL CHECK (char_length(message) <= 5000),
      author TEXT NOT NULL CHECK (char_length(author) <= 24),
      likes INTEGER NOT NULL DEFAULT 0 CHECK (likes >= 0),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

function toNote(row: Record<string, unknown>): SharedNote {
  return {
    id: String(row.id),
    text: String(row.message),
    from: String(row.author),
    likes: Number(row.likes),
    createdAt: new Date(String(row.created_at)).toISOString(),
  };
}

export const listSharedNotes = createServerFn({ method: "GET" }).handler(async () => {
  const sql = database();
  await ensureSchema(sql);
  const rows = await sql`
    SELECT id, message, author, likes, created_at
    FROM farewell_notes
    ORDER BY created_at DESC
  `;
  return rows.map(toNote);
});

export const createSharedNote = createServerFn({ method: "POST" })
  .validator((input: unknown) => noteSchema.parse(input))
  .handler(async ({ data }) => {
    const sql = database();
    await ensureSchema(sql);
    const rows = await sql`
      INSERT INTO farewell_notes (client_id, message, author)
      VALUES (${data.clientId}, ${data.text}, ${data.from})
      ON CONFLICT (client_id) DO UPDATE SET client_id = EXCLUDED.client_id
      RETURNING id, message, author, likes, created_at
    `;
    return toNote(rows[0]);
  });

export const likeSharedNote = createServerFn({ method: "POST" })
  .validator((input: unknown) => likeSchema.parse(input))
  .handler(async ({ data }) => {
    const sql = database();
    await ensureSchema(sql);
    const rows = await sql`
      UPDATE farewell_notes
      SET likes = likes + 1
      WHERE id = ${data.id}::bigint
      RETURNING id, message, author, likes, created_at
    `;
    if (!rows[0]) throw new Error("That note no longer exists.");
    return toNote(rows[0]);
  });
