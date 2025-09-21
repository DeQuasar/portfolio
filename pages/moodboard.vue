<template>
  <main class="mx-auto flex min-h-screen max-w-5xl flex-col gap-16 px-5 py-16 text-sage-700 sm:px-10 lg:px-16">
    <header class="flex flex-col gap-6">
      <p class="text-xs font-semibold uppercase tracking-[0.6em] text-sage-500/70">Reference board</p>
      <h1 class="font-display text-3xl font-semibold text-sage-700 sm:text-4xl">Shadow-Only Focus Treatments</h1>
      <p class="max-w-3xl text-base text-sage-600">
        A grab-and-go set of accessible elevation cues so the experience cards can signal focus without
        borders, motion, or scale changes. Everything on this page uses the same sage palette and can be
        pasted directly into a Tailwind config or CSS module.
      </p>
      <dl class="flex flex-wrap gap-3 text-xs font-medium uppercase tracking-[0.35em] text-sage-500">
        <div class="rounded-full bg-sage-100 px-4 py-2 text-sage-500/90">Base shadow #0F241E</div>
        <div class="rounded-full bg-sage-100 px-4 py-2 text-sage-500/90">Primary tint #0B6C50</div>
        <div class="rounded-full bg-sage-100 px-4 py-2 text-sage-500/90">Glow accent #7BE7B8</div>
      </dl>
    </header>

    <section class="flex flex-col gap-6">
      <p class="text-xs font-semibold uppercase tracking-[0.6em] text-sage-500/70">USWDS depth ladder</p>
      <p class="max-w-3xl text-base text-sage-600">
        Map these five depths to a single reactive class: keep resting cards at <code>shadow-3</code> and bump the
        IntersectionObserver target to <code>shadow-5</code> so only one card reads as focused.
      </p>
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="card in depthLadder"
          :key="card.label"
          class="rounded-2xl border border-sage-200/60 bg-white px-6 py-5 shadow-card transition-shadow"
          :style="{ boxShadow: card.boxShadow }"
        >
          <h2 class="font-display text-lg font-semibold text-sage-600">{{ card.label }}</h2>
          <p class="mt-2 text-sm text-sage-500">{{ card.description }}</p>
        </article>
      </div>
    </section>

    <section class="flex flex-col gap-6">
      <p class="text-xs font-semibold uppercase tracking-[0.6em] text-sage-500/70">Dual-tone focus glow</p>
      <p class="max-w-3xl text-base text-sage-600">
        Inspired by Sara Soueidan’s focus-indicator guidance: combine a linear gradient surface with an inner
        halo and deep green drop shadow. Contrast-tested to stay legible for green color-blind users.
      </p>
      <article
        class="relative overflow-hidden rounded-2xl border border-sage-200/50 p-8 text-sage-50 shadow-card"
        :style="dualToneStyle"
      >
        <span class="absolute right-6 top-6 text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-sage-100/80">
          Focus-visible
        </span>
        <h2 class="font-display text-xl font-semibold">Glow Focus</h2>
        <ul class="mt-4 space-y-1 text-sm">
          <li v-for="line in dualToneLines" :key="line">{{ line }}</li>
        </ul>
      </article>
    </section>

    <section class="flex flex-col gap-6">
      <p class="text-xs font-semibold uppercase tracking-[0.6em] text-sage-500/70">Outline fallback</p>
      <p class="max-w-3xl text-base text-sage-600">
        When reduced motion is enabled, pair a soft interior outline with a dense outer shadow so the highlight
        survives without animation. This mirrors the Access Guide “visible focus” treatment.
      </p>
      <article
        class="rounded-2xl border border-sage-200/60 bg-white px-6 py-7"
        :style="outlineFallbackStyle"
      >
        <h2 class="font-display text-lg font-semibold text-sage-600">Accessibility Fallback</h2>
        <p class="mt-3 text-sm text-sage-500">
          Outline offset avoids layout shift while the shadow carries the sage cue.
        </p>
      </article>
    </section>

    <section class="flex flex-col gap-6">
      <p class="text-xs font-semibold uppercase tracking-[0.6em] text-sage-500/70">Material minimal dual stack</p>
      <p class="max-w-3xl text-base text-sage-600">
        Material Minimal layers a cool core shadow with a tinted ambient. Translating to your palette gives an
        alternate focus state when you want the glow dialed back but still obvious.
      </p>
      <article
        class="rounded-2xl border border-sage-200/60 bg-white px-6 py-7"
        :style="materialShadowStyle"
      >
        <h2 class="font-display text-lg font-semibold text-sage-600">Tinted Elevation</h2>
        <ul class="mt-3 space-y-1 text-sm text-sage-500">
          <li>0 12px 24px rgba(9, 52, 40, 0.28)</li>
          <li>0 3px 8px rgba(123, 231, 184, 0.32)</li>
        </ul>
      </article>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useHead } from '#imports'

useHead({
  title: 'Shadow Moodboard — Portfolio'
})

const depthLadder = [
  {
    label: 'Shadow 1',
    description: '0 1px 2px @ 12% — light resting elevation',
    boxShadow: '0 1px 2px rgba(15, 36, 30, 0.12)'
  },
  {
    label: 'Shadow 2',
    description: 'Adds 0 2px 4px @ 12% for subtle lift',
    boxShadow: '0 1px 2px rgba(15, 36, 30, 0.14), 0 2px 4px rgba(15, 36, 30, 0.12)'
  },
  {
    label: 'Shadow 3',
    description: 'Pairs 2px and 6px blur for default cards',
    boxShadow: '0 2px 4px rgba(15, 36, 30, 0.14), 0 4px 6px rgba(15, 36, 30, 0.12)'
  },
  {
    label: 'Shadow 4',
    description: 'Higher contrast mid layer for hover states',
    boxShadow: '0 3px 6px rgba(15, 36, 30, 0.16), 0 8px 12px rgba(15, 36, 30, 0.12)'
  },
  {
    label: 'Shadow 5',
    description: 'Hero focus state — single entry active',
    boxShadow: '0 6px 12px rgba(15, 36, 30, 0.20), 0 16px 28px rgba(15, 36, 30, 0.16)'
  }
]

const dualToneLines = [
  '0 0 0 2px rgba(12, 79, 60, 0.18)',
  '0 12px 26px rgba(11, 108, 80, 0.35)',
  '0 0 18px 12px rgba(123, 231, 184, 0.08)'
]

const dualToneStyle = computed(() => ({
  background: 'linear-gradient(145deg, #103A2F, #0C2D24)',
  boxShadow: [
    '0 0 0 2px rgba(12, 79, 60, 0.18)',
    '0 12px 26px rgba(11, 108, 80, 0.35)',
    '0 0 18px 12px rgba(123, 231, 184, 0.08)'
  ].join(', ')
}))

const outlineFallbackStyle = computed(() => ({
  boxShadow: '0 0 0 4px rgba(28, 185, 129, 0.85), 0 12px 22px rgba(16, 58, 47, 0.25)',
  outline: '3px solid rgba(255, 255, 255, 0.65)',
  outlineOffset: '-5px'
}))

const materialShadowStyle = computed(() => ({
  boxShadow: '0 12px 24px rgba(9, 52, 40, 0.28), 0 3px 8px rgba(123, 231, 184, 0.32)'
}))
</script>

<style scoped>
/* Prevent Tailwind preflight from stripping outline when present */
article {
  outline: var(--moodboard-outline, none);
}
</style>
