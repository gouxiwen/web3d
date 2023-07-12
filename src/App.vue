<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header>
    <nav>
      <RouterLink to="/">Base</RouterLink>
      <RouterLink to="/sky">Sky</RouterLink>
      <RouterLink to="/triangle">Triangle</RouterLink>
      <RouterLink to="/async-draw">异步绘制</RouterLink>
    </nav>
  </header>
  <RouterView />
</template>

<style scoped>
header {
  line-height: 1.5;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}
</style>
