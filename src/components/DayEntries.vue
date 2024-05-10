<template>
      <div v-if="shouldBeDisplayed">
            <div v-for="entry in entries" :key="entry.id">
                  <div>{{ entry.title }}</div>
                  <div>{{ entry.description }}</div>
                  <div v-if="entry.type === 'SPORT'">
                        <table class="center">
                              <tr><td>Modèle</td><td>{{ entry.model.title }}</td></tr>
                              <tr><td>Sport</td><td>{{ entry.model.sport }}</td></tr>
                              <tr><td>Duration</td><td>{{ entry.duration }}</td></tr>
                              <tr><td>Calories</td><td>{{ entry.kcal }}</td></tr>
                              <tr><td>Aerobic</td><td>{{ entry.aerobic }}</td></tr>
                              <tr><td>Anaerobic</td><td>{{ entry.anaerobic }}</td></tr>
                              <tr><td>Benefit</td><td>{{ entry.benefit }}</td></tr>
                        </table>
                        <div v-if="entry.editMode">
                              <model-sport :date="selectedDay"
                                     :title="entry.title"
                                     :description="entry.description"
                                     :duration="entry.duration"
                                     :kcal="entry.kcal"
                                     :aerobic="entry.aerobic"
                                     :anaerobic="entry.anaerobic"
                                     :benefit="entry.benefit"
                                     :sportModelId="entry.model.id"
                                     :entryId="entry.id"
                                    @on-add-sport-entry="onAddSportEntry">
                              </model-sport>
                        </div>
                  </div>

                  <div v-if="entry.type === 'FREE'">
                        <div v-if="entry.editMode">
                              <model-free :date="entry.date" 
                                          :title="entry.title"
                                          :description="entry.description"
                                          :entryId="entry.id"
                                          @on-add-free-entry="onAddFreeEntry(entry)">
                              </model-free>
                        </div>
                  </div>
                  <button @click="onEditEntry(entry)">Edit</button>
            </div>
      </div>
</template>

<script setup>
import ModelFree from './ModelFree.vue';
import ModelSport from './ModelSport.vue';
import { ref, defineEmits, defineProps, onUpdated, onMounted } from 'vue'

const emit = defineEmits(['onUpdateFreeEntry']);
const props = defineProps(["date", "entries", "shouldBeDisplayed"]);

onUpdated(() => {
      console.log("onUpdated refreshEntries : " + props.shouldBeDisplayed);
      props.entries.forEach(entry => {
            //getModel(entry);
      });
});

function onAddFreeEntry(entry) {
      console.log("DayEntries.vue onAddFreeEntry " + JSON.stringify(entry));
      emit('onUpdateFreeEntry', entry);
}

function onAddSportEntry(entry) {
      console.log("DayEntries.vue onAddSportEntry " + JSON.stringify(entry));
      emit('onUpdateSportEntry', entry);
}

function getModel(entry) {
      console.log("entry id " + process.env.VUE_APP_URL + '/model/' + entry.modelId);
      fetch(process.env.VUE_APP_URL + '/model/' + entry.modelId)
      .then(response => response.json())
      .then(model => {
            console.log("title model " + model.title);
            entry.model = model
      });
}

function onEditEntry(entry) {
      console.log("onEditEntry : " + JSON.stringify(entry));
      entry.editMode = true;
}
</script>

<style>
.center {
  margin-left: auto;
  margin-right: auto;
}
</style>