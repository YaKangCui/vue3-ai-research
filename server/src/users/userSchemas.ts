import { z } from "zod";

export const userIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const userCreateBodySchema = z.object({
  email: z.string().trim().email(),
  name: z.string().trim().min(1).max(200),
});

export const userUpdateBodySchema = z
  .object({
    email: z.string().trim().email().optional(),
    name: z.string().trim().min(1).max(200).optional(),
  })
  .refine((body) => body.email !== undefined || body.name !== undefined, {
    message: "At least one of email or name must be provided",
  });

export type UserUpdateBody = z.infer<typeof userUpdateBodySchema>;
