<script setup lang="ts">
const themeInitScript = `(function() {
  var storageKey = 'theme-preference';
  var root = document.documentElement;
  if (!root) {
    return;
  }

  var stored = null;
  try {
    stored = window.localStorage.getItem(storageKey);
  } catch (error) {
    stored = null;
  }

  var preference = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';

  var systemMode = 'light';
  try {
    var mediaQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    systemMode = mediaQuery && mediaQuery.matches ? 'dark' : 'light';
  } catch (error) {
    systemMode = 'light';
  }

  var resolved = preference === 'system' ? systemMode : preference;

  root.dataset.theme = resolved;
  root.dataset.themePreference = preference;
  root.dataset.themeResolved = resolved;
  root.style.colorScheme = resolved;
})();`

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
  ],
  script: [
    {
      children: themeInitScript,
      tagPriority: 'critical'
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
