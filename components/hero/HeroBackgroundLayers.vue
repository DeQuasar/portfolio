<script setup lang="ts">
const props = defineProps<{
  textureStyle: Record<string, string>
  noiseStyle: Record<string, string>
}>()
</script>

<template>
  <span
    :style="props.textureStyle"
    class="pointer-events-none absolute inset-0 -z-10 opacity-80 sm:opacity-90"
    aria-hidden="true"
  ></span>
  <span
    :style="props.noiseStyle"
    class="pointer-events-none absolute inset-0 -z-10 opacity-[0.08] mix-blend-soft-light"
    aria-hidden="true"
  ></span>
  <span
    class="pointer-events-none absolute inset-0 -z-10"
    style="background: linear-gradient(180deg, rgba(24, 41, 31, 0.96) 0%, rgba(24, 41, 31, 0.72) 10%, rgba(24, 41, 31, 0.35) 26%, rgba(24, 41, 31, 0) 48%)"
    aria-hidden="true"
  ></span>
  <span
    class="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_22%_18%,rgba(236,245,239,0.05),transparent_66%)]"
    aria-hidden="true"
  ></span>
  <span
    class="pointer-events-none absolute -left-[240px] -top-[260px] -z-10 hidden h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(106,145,108,0.49)_0%,rgba(106,145,108,0)_72%)] opacity-80 blur-[44px] sm:block"
    aria-hidden="true"
  ></span>
  <span
    class="pointer-events-none absolute -right-[280px] -bottom-[280px] -z-10 hidden h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle,rgba(63,91,67,0.56)_0%,rgba(63,91,67,0)_74%)] opacity-85 blur-[52px] sm:block"
    aria-hidden="true"
  ></span>
  <span
    class="pointer-events-none absolute -left-16 top-[32%] h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(104,150,112,0.48)_0%,rgba(104,150,112,0)_72%)] opacity-75 blur-[46px] sm:hidden"
    aria-hidden="true"
  ></span>
  <span
    class="pointer-events-none absolute bottom-[-160px] right-[-80px] h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(63,91,67,0.5)_0%,rgba(63,91,67,0)_74%)] opacity-80 blur-[48px] sm:hidden"
    aria-hidden="true"
  ></span>
  <span
    class="pointer-events-none absolute left-1/2 top-[18%] h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(236,245,239,0.18)_0%,rgba(236,245,239,0)_75%)] opacity-60"
    aria-hidden="true"
  ></span>
  <span
    class="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(28,46,32,0)_38%,rgba(16,28,20,0.52)_100%)]"
    aria-hidden="true"
  ></span>
</template>
