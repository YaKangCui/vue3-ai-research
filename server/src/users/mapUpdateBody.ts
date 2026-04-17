import type { UserUpdateInput } from "../types/user.js";
import type { UserUpdateBody } from "./userSchemas.js";

export function mapUpdateBodyToInput(body: UserUpdateBody): UserUpdateInput {
  const input: UserUpdateInput = {};
  if (body.email !== undefined) {
    input.email = body.email;
  }
  if (body.name !== undefined) {
    input.name = body.name;
  }
  return input;
}
