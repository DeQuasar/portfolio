<script setup lang="ts">
import ThemeToggle from '~/components/navigation/ThemeToggle.vue'
</script>

<template>
  <Teleport to="body">
    <div
      class="pointer-events-none fixed bottom-[calc(env(safe-area-inset-bottom,0px)+16px)] right-[calc(env(safe-area-inset-right,0px)+16px)] z-40 hidden flex-col items-end gap-2 sm:flex"
      aria-live="polite"
    >
      <ThemeToggle
        layout="pill"
        class="pointer-events-auto"
      />
    </div>
  </Teleport>
</template>
