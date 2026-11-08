<template>
  <div class="flexRow">
    <div @click="toggle('food')">Food</div>
    <div @click="toggle('sport')">Sport</div>
    <div @click="toggle('free')">Free</div>
  </div>
</template>

<script setup lang="ts">
import type { ModelCategory } from '@/types/entries'

const category = defineModel<ModelCategory | null>()

const toggle = (name: ModelCategory) => {
  category.value = category.value === name ? null : name
}
</script>

<style scoped>
.flexRow {
  border: 1px black solid;
  align-items: center;
  text-align: center;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  background-color: cornflowerblue;
  color: beige;
  cursor: pointer;
  width: 400px;
}

@media only screen and (max-width: 393px) {
  .flexRow {
    width: 100%;
  }
}
</style>
