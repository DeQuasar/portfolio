<script setup lang="ts">
import FooterLegalNotice from '~/components/footer/FooterLegalNotice.vue'

const currentYear = new Date().getFullYear()
</script>

<template>
  <footer
    id="contact"
    class="mt-16 border-t border-sage-200/60 bg-sage-50 text-sage-500"
  >
    <div class="mx-auto flex w-full max-w-5xl justify-center px-4 py-6 text-center text-xs sm:px-6">
      <FooterLegalNotice class="text-center text-xs text-sage-600" :year="currentYear" />
    </div>
  </footer>
</template>
