<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="mt-16 border-t border-sage-200/60 bg-sage-50 text-sage-500">
    <div class="mx-auto w-full max-w-5xl px-4 py-6 text-center text-xs sm:px-6">
      <p>© {{ currentYear }} Anthony Protano — Senior Software Developer</p>
    </div>
  </footer>
</template>
