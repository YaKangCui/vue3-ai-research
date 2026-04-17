import { createServer } from "node:http";
import { loadValidatedEnv } from "./env.js";
import { createApp } from "./app.js";
import { UserMemoryStore } from "./store/userMemoryStore.js";

const env = loadValidatedEnv();
const store = new UserMemoryStore();
const app = createApp(store);
const server = createServer(app);

server.listen(env.PORT, () => {
  console.log(`User API listening on http://localhost:${env.PORT}`);
});
