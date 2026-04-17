import { Router } from "express";
import type { UserMemoryStore } from "../store/userMemoryStore.js";
import { mapUpdateBodyToInput } from "./mapUpdateBody.js";
import { userCreateBodySchema, userIdParamSchema, userUpdateBodySchema } from "./userSchemas.js";

export function createUsersRouter(store: UserMemoryStore): Router {
  const router = Router();

  router.get("/", (_req, res) => {
    res.json({ data: store.list() });
  });

  router.get("/:id", (req, res) => {
    const params = userIdParamSchema.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const user = store.getById(params.data.id);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({ data: user });
  });

  router.post("/", (req, res) => {
    const parsed = userCreateBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
      return;
    }
    const duplicate = store.findByEmail(parsed.data.email);
    if (duplicate) {
      res.status(409).json({ error: "Email already in use" });
      return;
    }
    const user = store.create(parsed.data);
    res.status(201).json({ data: user });
  });

  router.patch("/:id", (req, res) => {
    const params = userIdParamSchema.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const parsed = userUpdateBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
      return;
    }
    if (parsed.data.email !== undefined) {
      const other = store.findByEmail(parsed.data.email);
      if (other && other.id !== params.data.id) {
        res.status(409).json({ error: "Email already in use" });
        return;
      }
    }
    const updated = store.update(params.data.id, mapUpdateBodyToInput(parsed.data));
    if (!updated) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({ data: updated });
  });

  router.delete("/:id", (req, res) => {
    const params = userIdParamSchema.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const removed = store.delete(params.data.id);
    if (!removed) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.status(204).send();
  });

  return router;
}
