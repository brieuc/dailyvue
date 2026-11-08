<template>
  <div class="formatted" style="background-color: crimson; color: antiquewhite;">
    {{ message }}
  </div>
</template>

<script setup lang="ts">
import { useNotification } from '@/composables/useNotification'

const { message } = useNotification()
</script>

<style scoped>
.formatted {
  white-space: pre-wrap;
}
</style>
