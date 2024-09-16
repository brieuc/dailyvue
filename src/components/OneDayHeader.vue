<template>
<div @click="selectHeaderDay()" style="color: aliceblue; background-color: rebeccapurple;">{{ day }} {{ date }}</div>
<div class="flex-summary-day">
      <div>⛹️‍♂️ {{ sportDuration }} min</div>
      <div>🏋🏻‍♂️{{ spentKcal }}</div>
      <div>🍕 {{ ingestedKcal }}</div>
      <div>🍺 {{ drinkingBeer }}</div>
</div>
</template>

<script setup>

import { ref, defineEmits, defineProps, onUpdated, onMounted } from 'vue'
const emit = defineEmits(["onClickHeaderDay"])
const props = defineProps(["day", "date", "ingestedKcal", "spentKcal", "sportDuration",
                              "drinkingBeer"]);

function selectHeaderDay() {
      emit("onClickHeaderDay", props.date);
}
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
      font-size: 0.7rem;

}
</style>