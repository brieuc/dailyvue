<template>
<div v-if="shouldBeDisplayed" style="background-color:azure;">
      <div v-for="entry in entries" :key="entry.id" class="div-entry-center">
            <div v-if="entry.type === 'SPORT'">
                  <div v-if="entry.editMode">
                        <model-sport :date="selectedDay"
                                    mode="update"
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
                  <div>
                        <div>{{ entry.title }}</div>
                        <div>{{ entry.description }}</div>
                        <table class="center">
                              <tr><td>Modèle</td><td><b>{{ entry.model.title }}</b></td></tr>
                              <tr><td>Sport</td><td>{{ entry.model.sport }}</td></tr>
                              <tr><td>Duration</td><td>{{ entry.duration }}</td></tr>
                              <tr><td>Calories</td><td>{{ entry.kcal }}</td></tr>
                              <tr><td>Aerobic</td><td>{{ entry.aerobic }}</td></tr>
                              <tr><td>Anaerobic</td><td>{{ entry.anaerobic }}</td></tr>
                              <tr><td>Benefit</td><td>{{ entry.benefit }}</td></tr>
                        </table>
                  </div>
            </div>

            <div v-if="entry.type === 'FREE'">
                  <div v-if="entry.editMode">
                        <model-free :date="entry.date" 
                                    mode="update"
                                    :title="entry.title"
                                    :description="entry.description"
                                    :entryId="entry.id"
                                    @on-add-free-entry="onAddFreeEntry(entry)">
                        </model-free>
                  </div>
                  <div v-else>
                        <div>{{ entry.title }}</div>
                        <div>{{ entry.description }}</div>
                  </div>
            </div>
            <div v-if="entry.type === 'FOOD'">
                  <div>{{ entry.title }}</div>
                  <div>Calories {{ entry.quantity * entry.model.kcal }}</div>
            </div>
            <button class="button-color" v-if="entry.type != 'FOOD' && entry.editMode !== true" @click="onEditEntry(entry)">Edit</button> 
            &nbsp;
            <button class="button-color" v-if="entry.editMode !== true" @click="onDeleteEntry(entry)">Delete</button>
      </div>
</div>
</template>

<script setup>
import ModelFree from './ModelFree.vue';
import ModelSport from './ModelSport.vue';
import { ref, defineEmits, defineProps, onUpdated, onMounted } from 'vue'

const emit = defineEmits(['onUpdateFreeEntry', 'onUpdateSportEntry', 'onDeleteEntry']);
const props = defineProps(["date", "entries", "shouldBeDisplayed"]);
let editMode = ref(false);

onUpdated(() => {
      editMode = false;
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
      editMode = true;
}

function onDeleteEntry(entry) {
      console.log("onDeleteEntry : " + JSON.stringify(entry));
      fetch(process.env.VUE_APP_URL + '/entry/' + entry.id, {method: "DELETE"})
      .then(_ => emit('onDeleteEntry', entry));
}
</script>

<style>
.center {
      margin: auto;
}

.div-entry-center {
    border: 1px;
    --border-radius: 5px;
    border-color: black;
    border-style: solid;
    margin: auto;
    width: 400px;
    --box-shadow: 0 2px 2px rgba(0, 0, 0, 0.26);
    --padding: 1rem;
}

@media only screen and (max-width: 393px) {
  .div-entry-center {
    border: 1px;
    --border-radius: 5px;
    border-color: black;
    border-style: solid;
    width: 100%;
    margin: auto;
    text-align: center;
    --box-shadow: 0 2px 2px rgba(0, 0, 0, 0.26);
  }
}
</style>