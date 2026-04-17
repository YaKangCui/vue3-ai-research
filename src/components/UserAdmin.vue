<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import * as usersApi from "../api/users.js";
import type { User } from "../types/user.js";

const users = ref<User[]>([]);
const loading = ref(false);
const errorMessage = ref<string | null>(null);

const createName = ref("");
const createEmail = ref("");

const editingId = ref<string | null>(null);
const editName = ref("");
const editEmail = ref("");

const isEditing = computed(() => editingId.value !== null);

function setError(err: unknown): void {
  errorMessage.value = err instanceof Error ? err.message : "Something went wrong";
}

async function refresh(): Promise<void> {
  loading.value = true;
  errorMessage.value = null;
  try {
    users.value = await usersApi.listUsers();
  } catch (err) {
    setError(err);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  void refresh();
});

async function onCreate(): Promise<void> {
  errorMessage.value = null;
  try {
    await usersApi.createUser({ name: createName.value.trim(), email: createEmail.value.trim() });
    createName.value = "";
    createEmail.value = "";
    await refresh();
  } catch (err) {
    setError(err);
  }
}

function startEdit(user: User): void {
  editingId.value = user.id;
  editName.value = user.name;
  editEmail.value = user.email;
  errorMessage.value = null;
}

function cancelEdit(): void {
  editingId.value = null;
}

async function onSaveEdit(): Promise<void> {
  if (!editingId.value) {
    return;
  }
  errorMessage.value = null;
  try {
    await usersApi.updateUser(editingId.value, {
      name: editName.value.trim(),
      email: editEmail.value.trim(),
    });
    editingId.value = null;
    await refresh();
  } catch (err) {
    setError(err);
  }
}

async function onDelete(user: User): Promise<void> {
  const ok = window.confirm(`Delete user “${user.name}”?`);
  if (!ok) {
    return;
  }
  errorMessage.value = null;
  try {
    await usersApi.deleteUser(user.id);
    if (editingId.value === user.id) {
      editingId.value = null;
    }
    await refresh();
  } catch (err) {
    setError(err);
  }
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return iso;
  }
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(d);
}
</script>

<template>
  <section class="panel" aria-labelledby="users-title">
    <header class="panel__head">
      <h1 id="users-title">Users</h1>
      <p class="panel__lede">REST CRUD backed by the Express API. Run <code>pnpm server:dev</code> alongside <code>pnpm dev</code>.</p>
    </header>

    <p v-if="errorMessage" class="alert" role="alert">{{ errorMessage }}</p>
    <p v-if="loading" class="muted">Loading…</p>

    <div class="grid">
      <article class="card">
        <h2>New user</h2>
        <form class="form" @submit.prevent="onCreate">
          <label class="field">
            <span>Name</span>
            <input v-model="createName" name="name" type="text" autocomplete="name" required maxlength="200" />
          </label>
          <label class="field">
            <span>Email</span>
            <input v-model="createEmail" name="email" type="email" autocomplete="email" required />
          </label>
          <button class="btn btn--primary" type="submit" :disabled="loading">Create</button>
        </form>
      </article>

      <article v-if="isEditing" class="card card--accent">
        <h2>Edit user</h2>
        <form class="form" @submit.prevent="onSaveEdit">
          <label class="field">
            <span>Name</span>
            <input v-model="editName" type="text" required maxlength="200" />
          </label>
          <label class="field">
            <span>Email</span>
            <input v-model="editEmail" type="email" required />
          </label>
          <div class="row">
            <button class="btn btn--primary" type="submit" :disabled="loading">Save</button>
            <button class="btn" type="button" :disabled="loading" @click="cancelEdit">Cancel</button>
          </div>
        </form>
      </article>
    </div>

    <article class="card card--table">
      <div class="table-head">
        <h2>All users</h2>
        <button class="btn btn--ghost" type="button" :disabled="loading" @click="refresh">Refresh</button>
      </div>

      <div v-if="!loading && users.length === 0" class="muted empty">No users yet.</div>

      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Email</th>
              <th scope="col">Created</th>
              <th scope="col" class="actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in users" :key="u.id" :class="{ active: editingId === u.id }">
              <td>{{ u.name }}</td>
              <td>{{ u.email }}</td>
              <td class="mono">{{ formatDate(u.createdAt) }}</td>
              <td class="actions">
                <button class="btn btn--small" type="button" :disabled="loading" @click="startEdit(u)">Edit</button>
                <button class="btn btn--small btn--danger" type="button" :disabled="loading" @click="onDelete(u)">
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>
  </section>
</template>

<style scoped>
.panel {
  max-width: 960px;
  margin: 0 auto;
  padding: 32px 20px 80px;
}

.panel__head {
  margin-bottom: 20px;
}

.panel__lede {
  margin-top: 8px;
  color: var(--text);
}

h1 {
  margin: 0;
}

h2 {
  margin: 0 0 12px;
}

code {
  font-size: 0.9em;
}

.alert {
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid var(--accent-border);
  background: var(--accent-bg);
  color: var(--text-h);
  margin: 0 0 16px;
}

.muted {
  color: var(--text);
  margin: 0 0 12px;
}

.empty {
  padding: 12px 0 4px;
}

.grid {
  display: grid;
  gap: 16px;
  margin-bottom: 20px;
}

@media (min-width: 900px) {
  .grid {
    grid-template-columns: 1fr 1fr;
    align-items: start;
  }
}

.card {
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px 16px 18px;
  background: color-mix(in oklab, var(--bg) 92%, var(--border));
  box-shadow: var(--shadow);
}

.card--accent {
  border-color: var(--accent-border);
  background: var(--accent-bg);
}

.card--table {
  padding-bottom: 12px;
}

.table-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
  color: var(--text-h);
}

.field input {
  font: inherit;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text-h);
}

.field input:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.btn {
  font-family: var(--mono);
  font-size: 14px;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text-h);
  cursor: pointer;
}

.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.btn--primary {
  border-color: transparent;
  color: var(--accent);
  background: var(--accent-bg);
}

.btn--ghost {
  background: transparent;
}

.btn--small {
  font-size: 13px;
  padding: 6px 10px;
}

.btn--danger {
  border-color: color-mix(in oklab, #ef4444 35%, var(--border));
  color: color-mix(in oklab, #ef4444 85%, var(--text-h));
}

.table-wrap {
  overflow: auto;
  border-radius: 8px;
  border: 1px solid var(--border);
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 15px;
}

th,
td {
  text-align: left;
  padding: 10px 12px;
  border-bottom: 1px solid var(--border);
  vertical-align: middle;
}

th {
  font-weight: 500;
  color: var(--text-h);
  background: color-mix(in oklab, var(--bg) 88%, var(--border));
}

tbody tr:hover {
  background: color-mix(in oklab, var(--accent-bg) 55%, transparent);
}

tbody tr.active {
  background: var(--accent-bg);
}

.actions {
  white-space: nowrap;
  text-align: right;
}

.actions .btn + .btn {
  margin-left: 8px;
}

.mono {
  font-family: var(--mono);
  font-size: 14px;
}
</style>
