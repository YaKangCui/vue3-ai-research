<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { z } from "zod";
import * as usersApi from "../api/users.js";
import type { User } from "../types/user.js";
import { formatDate } from "../utils/formatDate.js";

const props = defineProps<{ id: string }>();

const route = useRoute();
const router = useRouter();

const idParam = computed(() => (typeof props.id === "string" ? props.id : String(route.params.id ?? "")));

const parseId = computed(() => z.string().uuid().safeParse(idParam.value));

const user = ref<User | null>(null);
const name = ref("");
const email = ref("");
const loading = ref(false);
const saving = ref(false);
const errorMessage = ref<string | null>(null);

function setError(err: unknown): void {
  errorMessage.value = err instanceof Error ? err.message : "Something went wrong";
}

async function load(): Promise<void> {
  const parsed = parseId.value;
  if (!parsed.success) {
    user.value = null;
    errorMessage.value = "Invalid user id in URL.";
    return;
  }

  loading.value = true;
  errorMessage.value = null;
  try {
    const u = await usersApi.getUser(parsed.data);
    user.value = u;
    name.value = u.name;
    email.value = u.email;
  } catch (err) {
    user.value = null;
    setError(err);
  } finally {
    loading.value = false;
  }
}

watch(
  () => idParam.value,
  () => {
    void load();
  },
  { immediate: true },
);

async function onSave(): Promise<void> {
  const parsed = parseId.value;
  if (!parsed.success) {
    return;
  }
  saving.value = true;
  errorMessage.value = null;
  try {
    const u = await usersApi.updateUser(parsed.data, {
      name: name.value.trim(),
      email: email.value.trim(),
    });
    user.value = u;
  } catch (err) {
    setError(err);
  } finally {
    saving.value = false;
  }
}

async function onDelete(): Promise<void> {
  const parsed = parseId.value;
  if (!parsed.success || !user.value) {
    return;
  }
  const ok = window.confirm(`Delete user “${user.value.name}”?`);
  if (!ok) {
    return;
  }
  saving.value = true;
  errorMessage.value = null;
  try {
    await usersApi.deleteUser(parsed.data);
    await router.push({ name: "users" });
  } catch (err) {
    setError(err);
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <section class="uc-panel" aria-labelledby="edit-title">
    <header class="uc-panel__head">
      <h1 id="edit-title">Edit user</h1>
      <p v-if="user" class="uc-panel__lede uc-mono">Created {{ formatDate(user.createdAt) }}</p>
    </header>

    <p v-if="errorMessage" class="uc-alert" role="alert">{{ errorMessage }}</p>
    <p v-if="loading" class="uc-muted">Loading…</p>

    <article v-if="user && !loading" class="uc-card" style="max-width: 520px">
      <form class="uc-form" @submit.prevent="onSave">
        <label class="uc-field">
          <span>Name</span>
          <input v-model="name" type="text" required maxlength="200" autocomplete="name" />
        </label>
        <label class="uc-field">
          <span>Email</span>
          <input v-model="email" type="email" required autocomplete="email" />
        </label>
        <div class="uc-row">
          <button class="uc-btn uc-btn--primary" type="submit" :disabled="saving">Save changes</button>
          <RouterLink class="uc-btn uc-btn--ghost" to="/users">Back to list</RouterLink>
        </div>
      </form>
      <hr class="divider" />
      <p class="uc-muted" style="margin: 0 0 10px">Danger zone</p>
      <button class="uc-btn uc-btn--danger" type="button" :disabled="saving" @click="onDelete">Delete user</button>
    </article>
  </section>
</template>

<style scoped>
.divider {
  border: none;
  border-top: 1px solid var(--border);
  margin: 18px 0;
}
</style>
