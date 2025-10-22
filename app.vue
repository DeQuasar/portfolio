<script setup lang="ts">
useHead({
  title: 'Anthony Protano | Senior Software Developer',
  htmlAttrs: {
    lang: 'en'
  },
  meta: [
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1, viewport-fit=cover'
    },
    {
      name: 'description',
      content: 'Portfolio for Anthony Protano, a senior software developer showcasing experience in product engineering, platform leadership, and accessible UX.'
    }
  ],
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossorigin: ''
    },
    {
      rel: 'icon',
      type: 'image/svg+xml',
      href: '/favicon.svg'
    },
    {
      rel: 'icon',
      type: 'image/x-icon',
      href: '/favicon.ico'
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700&family=Source+Sans+Pro:wght@400;600;700&display=swap',
      crossorigin: '',
      media: 'print',
      onload: "this.media='all'"
    }
  ],
  noscript: [
    {
      children: '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700&family=Source+Sans+Pro:wght@400;600;700&display=swap" crossorigin>'
    }
  ]
})
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtLoadingIndicator color="linear-gradient(120deg, #4A6C4D, #6E8B6D)" />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
