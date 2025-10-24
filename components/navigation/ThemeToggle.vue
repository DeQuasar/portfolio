<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import Button from '~/components/ui/Button.vue'
import { useTheme } from '~/composables/useTheme'

defineOptions({ name: 'ThemeToggle' })

const props = withDefaults(
  defineProps<{
    layout?: 'icon' | 'pill'
    label?: string
  }>(),
  {
    layout: 'icon',
    label: 'Theme'
  }
)

const theme = useTheme()
const isMounted = ref(false)
onMounted(() => {
  isMounted.value = true
})

const preferenceLabel = computed(() => {
  switch (theme.preference.value) {
    case 'light':
      return 'Light'
    case 'dark':
      return 'Dark'
    default:
      return 'System'
  }
})

const nextPreferenceLabel = computed(() => {
  switch (theme.nextPreference.value) {
    case 'light':
      return 'Light'
    case 'dark':
      return 'Dark'
    default:
      return 'System'
  }
})

const resolvedLabel = computed(() => (theme.resolved.value === 'dark' ? 'Dark' : 'Light'))

const handleToggle = () => {
  theme.cyclePreference()
}

const icon = computed(() => {
  if (theme.preference.value === 'dark') {
    return 'moon'
  }
  if (theme.preference.value === 'light') {
    return 'sun'
  }
  return theme.resolved.value === 'dark' ? 'moon' : 'sun'
})

const buttonVariant = computed(() => (props.layout === 'icon' ? 'icon' : 'secondary'))

const baseButtonClasses = computed(() => {
  if (props.layout === 'pill') {
    return [
      'h-11 gap-3 whitespace-nowrap px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em]',
      'rounded-full border shadow-lg shadow-sage-900/18 transition',
      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-300'
    ]
  }
  return [
    '!h-10 !w-10 rounded-full border shadow-sm transition duration-200',
    'hover:-translate-y-0.5 focus-visible:-translate-y-0.5',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-300'
  ]
})

const themeButtonClasses = computed(() => {
  const classes = [
    '!border-[color:var(--border-soft)]',
    'hover:!border-[color:var(--border-strong)]',
    'focus-visible:!border-[color:var(--border-strong)]'
  ]

  if (theme.resolved.value === 'dark') {
    classes.push(
      '!bg-[color:var(--surface-contrast)]',
      '!text-[color:var(--text-primary)]',
      'hover:!bg-[color:var(--surface-card-alt)]',
      'hover:!text-[color:var(--text-primary)]'
    )
  } else {
    classes.push(
      '!bg-[color:var(--surface-contrast)]',
      '!text-sage-600',
      'hover:!bg-[color:var(--surface-muted)]',
      'hover:!text-sage-700'
    )
  }

  return classes
})

const buttonClasses = computed(() => [...baseButtonClasses.value, ...themeButtonClasses.value])
</script>

<template>
  <Button
    v-if="isMounted"
    :variant="buttonVariant"
    :class="buttonClasses"
    :data-state="theme.preference.value"
    :aria-label="`Current theme ${resolvedLabel}. Switch to ${nextPreferenceLabel} theme.`"
    @click="handleToggle"
  >
    <span class="sr-only">
      Theme {{ preferenceLabel }}—resolved {{ resolvedLabel }}. Click to change to {{ nextPreferenceLabel }}.
    </span>

    <svg
      v-if="icon === 'sun'"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.7"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="h-[1rem] w-[1rem]"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v1" />
      <path d="M12 20v1" />
      <path d="M4.22 4.22l.7.7" />
      <path d="M19.08 19.08l.7.7" />
      <path d="M1 12h1" />
      <path d="M22 12h1" />
      <path d="M4.22 19.78l.7-.7" />
      <path d="M19.08 4.92l.7-.7" />
    </svg>

    <svg
      v-else
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.6"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="h-[1rem] w-[1rem]"
      aria-hidden="true"
    >
      <path
        d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"
      />
    </svg>
  </Button>
</template>
