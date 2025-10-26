<script lang="ts">
import { defineComponent, toRefs, type PropType } from 'vue'
import type { HeroContent } from '~/types/content'
import MobileMenuButton from './MobileMenuButton.vue'

export default defineComponent({
  name: 'NavigationMobileBar',
  components: {
    MobileMenuButton
  },
  props: {
    hero: {
      type: Object as PropType<HeroContent>,
      required: true
    },
    menuOpen: {
      type: Boolean,
      required: true
    }
  },
  emits: {
    'toggle-menu': () => true
  },
  setup(props, { emit }) {
    const { hero, menuOpen } = toRefs(props)

    const handleToggle = () => {
      emit('toggle-menu')
    }

    return {
      hero,
      menuOpen,
      handleToggle
    }
  }
})
</script>

<template>
  <div class="flex w-full items-start justify-between sm:hidden">
    <div class="min-w-0 text-left leading-snug">
      <span class="block font-display text-[1.05rem] font-semibold text-sage-700">
        {{ hero.name }}
      </span>
      <span class="block text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-sage-500">
        {{ hero.role }}
      </span>
    </div>
    <MobileMenuButton :open="menuOpen" @toggle="handleToggle" />
  </div>
</template>
