<script setup lang="ts">
import { ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import * as usersApi from "../api/users.js";

const router = useRouter();
const name = ref("");
const email = ref("");
const saving = ref(false);
const errorMessage = ref<string | null>(null);

function setError(err: unknown): void {
  errorMessage.value = err instanceof Error ? err.message : "Something went wrong";
}

async function onSubmit(): Promise<void> {
  saving.value = true;
  errorMessage.value = null;
  try {
    await usersApi.createUser({
      name: name.value.trim(),
      email: email.value.trim(),
    });
    await router.push({ name: "users" });
  } catch (err) {
    setError(err);
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <section class="uc-panel" aria-labelledby="create-title">
    <header class="uc-panel__head">
      <h1 id="create-title">New user</h1>
      <p class="uc-panel__lede">After saving you will return to the list.</p>
    </header>

    <p v-if="errorMessage" class="uc-alert" role="alert">{{ errorMessage }}</p>

    <article class="uc-card" style="max-width: 520px">
      <form class="uc-form" @submit.prevent="onSubmit">
        <label class="uc-field">
          <span>Name</span>
          <input v-model="name" name="name" type="text" autocomplete="name" required maxlength="200" />
        </label>
        <label class="uc-field">
          <span>Email</span>
          <input v-model="email" name="email" type="email" autocomplete="email" required />
        </label>
        <div class="uc-row">
          <button class="uc-btn uc-btn--primary" type="submit" :disabled="saving">Create</button>
          <RouterLink class="uc-btn uc-btn--ghost" to="/users">Cancel</RouterLink>
        </div>
      </form>
    </article>
  </section>
</template>
