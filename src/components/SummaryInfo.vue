<template>
<h4 style="color: blueviolet;">Du {{ fromDate }} au {{ toDate }}</h4>
<div class="flex">
      <div>Activités sportives {{ sportDuration }} min</div>
      <div>Calories dépensées {{ spentKcal }} kcal</div>
      <div>Calories ingérées {{ ingestedKcal }} kcal</div>
      <div>Alcalories {{ drinkingBeer }} kcal</div>
      <div>Aerobic {{ aerobic }}</div>
      <div>Anaerobic {{ anaerobic }}</div>
</div>
</template>

<script setup>

import { ref, defineEmits, defineProps, onUpdated, onMounted } from 'vue'
const props = defineProps(["fromDate", "toDate", "ingestedKcal", "spentKcal", "sportDuration",
                              "drinkingBeer", "anaerobic", "aerobic"]);
</script>

<style>
.flex {
    display: flex;
    justify-content: space-evenly;
    flex-wrap: wrap;
    gap: 0.1rem;
}
</style>