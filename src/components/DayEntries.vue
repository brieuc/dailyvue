<template>
      <div v-if="refresh">
            <div v-for="entry in entries" :key="entry.id">
                  <div>{{ entry.title }}</div>
                  <div>{{ entry.description }}</div>
                  <p v-if="entry.type === 'FOOD'">
                        {{ entry.quantity }}
                  </p>
                  
                  Model {{ entry.model.title }}
            </div>
      </div>
</template>

<script setup>
import { ref, defineEmits, onMouonUpdatednted, defineProps, onUpdated, onMounted } from 'vue'

const props = defineProps(["date", "entries", "refresh"]);

onUpdated(() => {
      console.log("onUpdated refreshEntries : " + props.refresh);
      props.entries.forEach(entry => {
            //getModel(entry);
      });
});

function getModel(entry) {
      console.log("entry id " + process.env.VUE_APP_URL + '/model/' + entry.modelId);
      fetch(process.env.VUE_APP_URL + '/model/' + entry.modelId)
      .then(response => response.json())
      .then(model => {
            console.log("title model " + model.title);
            entry.model = model
      });
}
</script>