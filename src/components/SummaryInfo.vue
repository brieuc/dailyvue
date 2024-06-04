<template>
<div> {{ fromDate }} to {{ toDate }}</div>
</template>

<script setup>

import { ref, defineEmits, defineProps, onUpdated, onMounted } from 'vue'
const props = defineProps(["fromDate", "toDate"]);
</script>