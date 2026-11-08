import { neon } from "@neondatabase/serverless";
import postgres from "postgres";

export type DatabaseQuery = (
  parts: TemplateStringsArray,
  ...values: (string | number)[]
) => Promise<Record<string, unknown>[]>;

let cached: { url: string; query: DatabaseQuery } | undefined;

/** Server-side only: preserve Neon HTTP and support ordinary private PostgreSQL. */
export function database(): DatabaseQuery {
  const url = process.env["DATABASE_URL"];
  if (!url) throw new Error("The shared note database is not configured.");
  if (cached?.url === url) return cached.query;

  let parsed: URL;
  try {
    parsed = new URL(url);
    if (!["postgres:", "postgresql:"].includes(parsed.protocol)) throw new Error();
  } catch {
    throw new Error("The shared note database URL is invalid.");
  }

  let query: DatabaseQuery;
  if (parsed.hostname === "neon.tech" || parsed.hostname.endsWith(".neon.tech")) {
    const client = neon(url);
    query = async (parts, ...values) => await client(parts, ...values);
  } else {
    const client = postgres(url, { max: 5, connect_timeout: 10, idle_timeout: 20 });
    query = async (parts, ...values) => await client(parts, ...values);
  }
  cached = { url, query };
  return query;
}
