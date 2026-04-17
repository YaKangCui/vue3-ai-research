import { randomUUID } from "node:crypto";
import type { User, UserCreateInput, UserUpdateInput } from "../types/user.js";

export class UserMemoryStore {
  private readonly users = new Map<string, User>();

  list(): User[] {
    return [...this.users.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  getById(id: string): User | undefined {
    return this.users.get(id);
  }

  create(input: UserCreateInput): User {
    const now = new Date().toISOString();
    const user: User = {
      id: randomUUID(),
      email: input.email,
      name: input.name,
      createdAt: now,
    };
    this.users.set(user.id, user);
    return user;
  }

  update(id: string, input: UserUpdateInput): User | undefined {
    const existing = this.users.get(id);
    if (!existing) {
      return undefined;
    }
    const next: User = {
      ...existing,
      ...(input.email !== undefined ? { email: input.email } : {}),
      ...(input.name !== undefined ? { name: input.name } : {}),
    };
    this.users.set(id, next);
    return next;
  }

  delete(id: string): boolean {
    return this.users.delete(id);
  }

  findByEmail(email: string): User | undefined {
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === email.toLowerCase()) {
        return user;
      }
    }
    return undefined;
  }
}
