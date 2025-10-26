<script setup lang="ts">
import type { SkillCoreGroupDisplay } from '~/composables/useSkillStack'

defineProps<{ group: SkillCoreGroupDisplay }>()
</script>

<template>
  <article class="group flex h-full flex-col rounded-2xl border border-sage-200/70 bg-white/80 p-5 text-left shadow-sm transition-shadow hover:shadow-md">
    <header class="space-y-1.5">
      <p class="text-xs font-semibold uppercase tracking-[0.24em] text-sage-600">Core Focus</p>
      <h3 class="font-display text-[1.25rem] font-semibold text-sage-800">{{ group.title }}</h3>
    </header>

    <ul class="mt-3 flex flex-col gap-2 text-sm text-sage-600">
      <li
        v-for="item in group.skills"
        :key="item.label"
        class="flex items-start gap-2 leading-relaxed"
      >
        <span class="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-sage-400" aria-hidden="true" />
        <span class="flex-1">{{ item.label }}</span>
      </li>
    </ul>

    <p v-if="group.roleCount" class="mt-4 text-xs text-sage-500">
      Active across {{ group.roleCount }} role<span v-if="group.roleCount !== 1">s</span>
      <span v-if="group.organizations.length"> · {{ group.organizations.join(' · ') }}</span>
    </p>
  </article>
</template>
