<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from "vue-router";

const route = useRoute();
</script>

<template>
  <div class="shell">
    <header class="shell__bar">
      <RouterLink class="brand" to="/users">Users</RouterLink>
      <nav class="shell__nav" aria-label="Main">
        <RouterLink class="nav-link" :class="{ 'nav-link--active': route.name === 'users' }" to="/users">List</RouterLink>
        <RouterLink class="nav-link" :class="{ 'nav-link--active': route.name === 'user-new' }" to="/users/new">
          New user
        </RouterLink>
      </nav>
    </header>
    <main class="shell__main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.shell__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding: 14px 20px;
  border-bottom: 1px solid var(--border);
  background: color-mix(in oklab, var(--bg) 90%, var(--border));
  position: sticky;
  top: 0;
  z-index: 2;
}

.brand {
  font-weight: 600;
  font-size: 18px;
  color: var(--text-h);
  text-decoration: none;
  letter-spacing: -0.02em;
}

.brand:hover {
  color: var(--accent);
}

.shell__nav {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.nav-link {
  font-family: var(--mono);
  font-size: 14px;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid transparent;
  color: var(--text-h);
  text-decoration: none;
}

.nav-link:hover {
  border-color: var(--border);
  background: var(--bg);
}

.nav-link--active {
  border-color: var(--accent-border);
  background: var(--accent-bg);
  color: var(--accent);
}

.shell__main {
  flex: 1;
}
</style>
