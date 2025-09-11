<template>
<h4 style="color: blueviolet;">Du {{ fromDate }} au {{ toDate }}</h4>
<div class="flex-summary">
      <div class="summary-item">Activités sportives {{ sportDuration }} min</div>
      <div class="summary-item">Calories dépensées {{ spentKcal }} kcal</div>
      <div class="summary-item">Calories ingérées {{ ingestedKcal }} kcal</div>
      <div class="summary-item">Alcalories {{ drinkingBeer }} kcal</div>
      <div class="summary-item">Aerobic {{ `Aerobic ${Math.round(aerobic * 100) / 100}` }}</div>
      <div class="summary-item">Anaerobic {{ `Anaerobic ${Math.round(anaerobic * 100) / 100}` }}</div>
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
    gap: 0.5rem;
    padding-bottom: 0.5rem;
}

.summary-item {
    background-color: rgba(240, 240, 240, 0.3);
    border-radius: 4px;
    padding: 5px 10px;
    margin: 2px;
    border: 1px solid rgba(220, 220, 220, 0.2);
    font-size: 0.8rem;
    text-align: center;
    min-width: 120px;
    color: #666;
}
</style>