import { z } from "zod";
import type { User } from "../types/user.js";

const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  createdAt: z.string(),
});

const userEnvelopeSchema = z.object({ data: userSchema });
const usersEnvelopeSchema = z.object({ data: z.array(userSchema) });

const errorBodySchema = z.object({ error: z.string() });

async function readJsonUnknown(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text) as unknown;
  } catch (cause) {
    throw new Error(`Response is not valid JSON (${res.status})`, { cause });
  }
}

function getErrorMessage(status: number, body: unknown): string {
  const parsed = errorBodySchema.safeParse(body);
  if (parsed.success) {
    return parsed.data.error;
  }
  return `Request failed (${status})`;
}

function assertOk<T>(schema: z.ZodType<T>, res: Response, body: unknown): T {
  if (!res.ok) {
    throw new Error(getErrorMessage(res.status, body));
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new Error("Unexpected response shape from server");
  }
  return parsed.data;
}

export async function listUsers(): Promise<User[]> {
  const res = await fetch("/api/users");
  const body = await readJsonUnknown(res);
  const envelope = assertOk(usersEnvelopeSchema, res, body);
  return envelope.data;
}

export async function getUser(id: string): Promise<User> {
  const res = await fetch(`/api/users/${encodeURIComponent(id)}`);
  const body = await readJsonUnknown(res);
  const envelope = assertOk(userEnvelopeSchema, res, body);
  return envelope.data;
}

export async function createUser(input: { email: string; name: string }): Promise<User> {
  const res = await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = await readJsonUnknown(res);
  const envelope = assertOk(userEnvelopeSchema, res, body);
  return envelope.data;
}

export async function updateUser(
  id: string,
  input: { email?: string; name?: string },
): Promise<User> {
  const res = await fetch(`/api/users/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = await readJsonUnknown(res);
  const envelope = assertOk(userEnvelopeSchema, res, body);
  return envelope.data;
}

export async function deleteUser(id: string): Promise<void> {
  const res = await fetch(`/api/users/${encodeURIComponent(id)}`, { method: "DELETE" });
  const body = await readJsonUnknown(res);
  if (res.status === 204) {
    return;
  }
  if (!res.ok) {
    throw new Error(getErrorMessage(res.status, body));
  }
}
