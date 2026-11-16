import { z } from "zod";

/** Reads a JSON body; returns null when it is missing or malformed. */
export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

/** Parses a positive integer id from a URL segment. */
export function parseId(raw: string): number | null {
  const r = z.coerce.number().int().positive().safeParse(raw);
  return r.success ? r.data : null;
}

export const dbCode = (err: unknown): string | undefined => (err as { code?: string }).code;

export const notFound = (what = "Not found") => Response.json({ error: what }, { status: 404 });
export const badRequest = (what: string) => Response.json({ error: what }, { status: 400 });
export const conflict = (what: string) => Response.json({ error: what }, { status: 409 });
