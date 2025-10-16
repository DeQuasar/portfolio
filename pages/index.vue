<script setup lang="ts">
import { useHeroContent, useSkillsContent, useExperienceContent } from '~/composables/useContentSources'

const { data: hero } = await useHeroContent()
const { data: skills } = await useSkillsContent()
const { data: experience } = await useExperienceContent()
</script>

<template>
  <main class="relative py-16 sm:py-20">
    <div class="absolute inset-0">
      <div class="h-full w-full bg-sage-50"></div>
    </div>
    <div class="relative mx-auto flex w-full max-w-5xl flex-col gap-16 px-4 sm:px-6">
      <HeroSection v-if="hero" :hero="hero" />
      <ExperienceSection
        v-if="experience"
        id="experience"
        :experience="experience"
      />
      <SkillStack
        v-if="skills"
        id="skills"
        :skills="skills"
        :experience="experience"
      />
    </div>
  </main>
</template>
