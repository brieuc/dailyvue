<template>
<div class="flex-summary-day">
      <div>⛹️‍♂️ {{ sportDuration }} min</div>
      <div>🏋🏻‍♂️{{ spentKcal }}</div>
      <div>🍕 {{ ingestedKcal }}</div>
      <div>🍺 {{ drinkingBeer }}</div>
</div>
</template>

<script setup lang="ts">

import { ref, defineEmits, defineProps, onUpdated, onMounted } from 'vue'
const props = defineProps(["date", "ingestedKcal", "spentKcal", "sportDuration",
                              "drinkingBeer"]);
</script>

<style>
.flex-summary-day {
      display: flex;
      justify-content: space-evenly;
      flex-wrap: wrap;
      gap: 0.1rem;
      height: fit-content;
      background-color: rebeccapurple;
      color:beige;
      font-size: 1rem;

}
</style>