<script setup lang="ts">
import { onMounted, ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import * as usersApi from "../api/users.js";
import type { User } from "../types/user.js";
import { formatDate } from "../utils/formatDate.js";

const router = useRouter();
const users = ref<User[]>([]);
const loading = ref(false);
const errorMessage = ref<string | null>(null);

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

async function onDelete(user: User): Promise<void> {
  const ok = window.confirm(`Delete user “${user.name}”?`);
  if (!ok) {
    return;
  }
  errorMessage.value = null;
  try {
    await usersApi.deleteUser(user.id);
    await refresh();
  } catch (err) {
    setError(err);
  }
}

function goEdit(user: User): void {
  void router.push({ name: "user-edit", params: { id: user.id } });
}
</script>

<template>
  <section class="uc-panel" aria-labelledby="list-title">
    <header class="uc-panel__head">
      <h1 id="list-title">All users</h1>
      <p class="uc-panel__lede">
        REST CRUD via Express. Run <code>pnpm server:dev</code> with <code>pnpm dev</code>.
      </p>
    </header>

    <p v-if="errorMessage" class="uc-alert" role="alert">{{ errorMessage }}</p>
    <p v-if="loading" class="uc-muted">Loading…</p>

    <article class="uc-card uc-card--table">
      <div class="uc-table-head">
        <h2>Directory</h2>
        <div class="uc-row">
          <RouterLink class="uc-btn uc-btn--primary" to="/users/new">New user</RouterLink>
          <button class="uc-btn uc-btn--ghost" type="button" :disabled="loading" @click="refresh">Refresh</button>
        </div>
      </div>

      <div v-if="!loading && users.length === 0" class="uc-muted uc-empty">No users yet. Create one from “New user”.</div>

      <div v-else class="uc-table-wrap">
        <table class="uc-table">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Email</th>
              <th scope="col">Created</th>
              <th scope="col" class="uc-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in users" :key="u.id">
              <td>{{ u.name }}</td>
              <td>{{ u.email }}</td>
              <td class="uc-mono">{{ formatDate(u.createdAt) }}</td>
              <td class="uc-actions">
                <button class="uc-btn uc-btn--small" type="button" :disabled="loading" @click="goEdit(u)">Edit</button>
                <button class="uc-btn uc-btn--small uc-btn--danger" type="button" :disabled="loading" @click="onDelete(u)">
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
