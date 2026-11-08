<template>
  <div class="wrapper">
    <div>{{ model.title }}</div>
    <div>{{ model.kcal }}</div>
    <div><button class="button-10" @click="emit('add')"> + </button></div>
    <div><button class="button-10" @click="emit('sub')"> - </button></div>
  </div>
</template>

<script setup lang="ts">
import type { ModelFoodDto } from '@/api/generated'

defineProps<{ model: ModelFoodDto }>()
const emit = defineEmits<{ add: []; sub: [] }>()
</script>

<style scoped>
.wrapper {
  display: grid;
  grid-template-columns: 200px 70px 40px 40px;
}
</style>
