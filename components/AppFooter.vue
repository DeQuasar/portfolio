<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="mt-24 border-t border-sage-200/70 bg-white text-sage-600">
    <div class="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-8 text-sm leading-relaxed sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p class="font-semibold text-sage-700">
        © {{ currentYear }} Anthony Protano — Senior Software Developer.
      </p>
      <p class="text-sage-600">
        Powered by Nuxt 3 + Tailwind CSS with a clock that keeps itself honest.
      </p>
    </div>
  </footer>
</template>
