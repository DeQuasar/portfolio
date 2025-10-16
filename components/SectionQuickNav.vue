<script setup lang="ts">
const navItems = [
  { href: '#experience', label: 'Experience' },
  { href: '#skills', label: 'Skills & Tools' },
  { href: '#contact', label: 'Contact' }
]
</script>

<template>
  <nav
    class="sticky top-[calc(var(--sticky-nav-height,0px)+1.25rem)] z-40 lg:hidden"
    aria-label="Section quick navigation"
  >
    <div class="rounded-[1.6rem] border border-sage-200/70 bg-white/95 px-4 py-3 shadow-[0_22px_44px_-30px_rgba(31,52,36,0.4)] backdrop-blur sm:px-5">
      <div class="flex gap-2 overflow-x-auto px-1 pb-1">
        <a
          v-for="item in navItems"
          :key="item.href"
          :href="item.href"
          class="inline-flex min-h-[40px] flex-shrink-0 items-center gap-1 rounded-full border border-sage-200/70 bg-white px-4 text-xs font-semibold uppercase tracking-[0.18em] text-sage-600 shadow-sm transition hover:border-sage-400 hover:text-sage-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-300"
        >
          {{ item.label }}
        </a>
      </div>
    </div>
  </nav>
</template>
