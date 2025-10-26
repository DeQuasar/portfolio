<script lang="ts">
import { defineComponent, toRefs, type PropType } from 'vue'
import AppLink from '~/components/ui/AppLink.vue'
import ThemeToggle from './ThemeToggle.vue'
import MobileMenuButton from './MobileMenuButton.vue'
import type { HeroContent } from '~/types/content'

type MobileMenuLink = { label: string; href: string; ariaLabel?: string }

export default defineComponent({
  name: 'NavigationMobileMenu',
  components: {
    AppLink,
    ThemeToggle,
    MobileMenuButton
  },
  props: {
    hero: {
      type: Object as PropType<HeroContent>,
      required: true
    },
    links: {
      type: Array as PropType<MobileMenuLink[]>,
      required: true
    },
    open: {
      type: Boolean,
      required: true
    }
  },
  emits: {
    close: () => true
  },
  setup(props, { emit }) {
    const { hero, links, open } = toRefs(props)

    const handleBackdropClick = (event: MouseEvent) => {
      if (event.target === event.currentTarget) {
        emit('close')
      }
    }

    const handleLinkClick = () => {
      emit('close')
    }

    const handleMenuButtonToggle = () => {
      emit('close')
    }

    return {
      menuHero: hero,
      menuLinks: links,
      menuOpen: open,
      handleBackdropClick,
      handleLinkClick,
      handleMenuButtonToggle
    }
  }
})
</script>

<template>
  <Transition name="dropdown-fade">
    <div
      v-if="menuOpen"
      class="fixed inset-0 z-[190] flex flex-col overflow-hidden bg-sage-950/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      @click="handleBackdropClick"
    >
      <div class="relative flex h-full flex-col bg-white/98 px-5 pb-[calc(env(safe-area-inset-bottom)+2rem)] pt-[calc(env(safe-area-inset-top)+1.4rem)] text-left shadow-[0_48px_120px_-42px_rgba(17,31,22,0.55)]">
        <header class="mb-6 flex items-start justify-between gap-4">
          <div class="min-w-0 text-left leading-tight">
          <p class="text-xs font-semibold uppercase tracking-[0.28em] text-sage-500">Anthony Protano</p>
          <p class="font-display text-[1.2rem] font-semibold text-sage-800">{{ menuHero.name }}</p>
            <p class="text-sm font-semibold uppercase tracking-[0.2em] text-sage-500">
              {{ menuHero.role }}
            </p>
          </div>
          <MobileMenuButton class="shrink-0" :open="true" label="Close navigation" @toggle="handleMenuButtonToggle" />
        </header>

        <nav class="flex-1 overflow-y-auto">
          <ul class="grid gap-3">
            <li v-for="item in menuLinks" :key="item.href">
              <AppLink
                :href="item.href"
                variant="ghost"
                class="w-full justify-between rounded-xl border border-sage-200/80 px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-sage-600 hover:border-sage-400 hover:text-sage-700"
                :aria-label="item.ariaLabel ?? item.label"
                @click="handleLinkClick"
              >
                <span>{{ item.label }}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="h-4 w-4"
                  aria-hidden="true"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </AppLink>
            </li>
          </ul>
        </nav>

        <footer class="mt-6 grid gap-3">
          <ThemeToggle layout="pill" label="Theme" />
          <p class="text-xs text-sage-500">
            Prefer email? Use the <span class="font-semibold">Compose message</span> button in the hero or copy the address from the email dropdown.
          </p>
        </footer>
      </div>
    </div>
  </Transition>
</template>
