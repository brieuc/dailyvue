<template>
<h4 style="color: blueviolet;">Du {{ fromDate }} au {{ toDate }}</h4>
<div class="flex-summary">
      <div>Activités sportives {{ sportDuration }} min</div>
      <div>Calories dépensées {{ spentKcal }} kcal</div>
      <div>Calories ingérées {{ ingestedKcal }} kcal</div>
      <div>Alcalories {{ drinkingBeer }} kcal</div>
      <div>Aerobic {{ `Aerobic ${Math.round(aerobic * 100) / 100}` }}</div>
      <div>Anaerobic {{ `Aerobic ${Math.round(anaerobic * 100) / 100}` }}</div>
</div>
</template>

<script setup>

import { ref, defineEmits, defineProps, onUpdated, onMounted } from 'vue'
const props = defineProps(["fromDate", "toDate", "ingestedKcal", "spentKcal", "sportDuration",
                              "drinkingBeer", "anaerobic", "aerobic"]);
</script>

<style>
.flex-summary {
    display: flex;
    justify-content: space-evenly;
    flex-wrap: wrap;
    gap: 0.1rem;
}
</style>