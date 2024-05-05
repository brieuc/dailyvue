<template>
      <h1>Entries</h1>
      <div v-for="entry in entries" :key="entry.id">
            <p>{{ entry.title }}</p>
      </div>
      1
</template>

<script setup>
import { ref, defineEmits, onMounted, defineProps } from 'vue'

const props = defineProps(["date", "entries"]);

onMounted(() => {
	console.log('onMounted : ' + props.date);
      console.log('onMounted : ' + props.entries);
      props.entries.forEach(element => {
            console.log("element " + JSON.stringify(element));
      });
});

function loadEntriesByDate(sDate) {
}
</script>