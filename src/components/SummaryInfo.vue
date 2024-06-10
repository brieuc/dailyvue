<template>
<div>Du {{ fromDate }} au {{ toDate }}</div>
<div>Activités sportives {{ sportDuration }} min</div>
<div>Calories dépensées {{ spentKcal }} kcal</div>
<div>Calories ingérées {{ ingestedKcal }}</div>
</template>

<script setup>

import { ref, defineEmits, defineProps, onUpdated, onMounted } from 'vue'
const props = defineProps(["fromDate", "toDate", "ingestedKcal", "spentKcal", "sportDuration"]);
</script>