<template>
<h4 style="color: blueviolet;">Du {{ fromDate }} au {{ toDate }}</h4>
<div>Activités sportives {{ sportDuration }} min</div>
<div>Calories dépensées {{ spentKcal }} kcal</div>
<div>Calories ingérées {{ ingestedKcal }} kcal</div>
</template>

<script setup>

import { ref, defineEmits, defineProps, onUpdated, onMounted } from 'vue'
const props = defineProps(["fromDate", "toDate", "ingestedKcal", "spentKcal", "sportDuration"]);
</script>