<script setup lang="ts">
useHead({
  title: 'Anthony Protano | Senior Software Developer',
  htmlAttrs: {
    lang: 'en'
  },
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossorigin: ''
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700&family=Source+Sans+Pro:wght@400;600;700&display=swap'
    }
  ]
})
</script>

<template>
  <div class="min-h-screen bg-sage-50 text-sage-700 font-body">
    <NuxtRouteAnnouncer />
    <NuxtLoadingIndicator color="linear-gradient(120deg, #4A6C4D, #6E8B6D)" />
    <NuxtPage />
  </div>
</template>
