<script setup lang="ts">
import BackgroundCanvas from '~/components/layout/BackgroundCanvas.vue'
import Hero from '~/components/hero/Hero.vue'
import { useHeroContent, useSkillsContent, useExperienceContent } from '~/composables/useContentSources'

const { data: hero } = await useHeroContent()
const { data: skills } = await useSkillsContent()
const { data: experience } = await useExperienceContent()
</script>

<template>
  <main class="relative pb-[calc(env(safe-area-inset-bottom)+3rem)] sm:pb-20">
    <BackgroundCanvas />
    <div class="relative mx-auto flex w-full max-w-5xl flex-col gap-6 px-0 sm:gap-16 sm:px-6">
      <Hero v-if="hero" :hero="hero" />
      <ExperienceSection
        v-if="experience"
        id="experience"
        :experience="experience"
        class="px-4 sm:px-0"
      />
      <SkillStack
        v-if="skills"
        id="skills"
        :skills="skills"
        :experience="experience"
        class="px-4 sm:px-0"
      />
    </div>
  </main>
</template>
