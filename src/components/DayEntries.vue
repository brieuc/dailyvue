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
                  <div v-else>
                        <div>{{ entry.title }}</div>
                        <div class="formatted">{{ entry.description }}</div>
                        <table class="center">
                              <tbody>
                                    <tr><td>Modèle</td>
                                          <td v-if="entry.model"><b>{{ entry.model.title }}</b></td>
                                    </tr>
                                    <tr><td>Sport</td>
                                          <td v-if="entry.model">{{ entry.model.sport }}</td>
                                    </tr>
                                    <tr><td>Duration</td><td>{{ entry.duration }}</td></tr>
                                    <tr><td>Calories</td><td>{{ entry.kcal }}</td></tr>
                                    <tr><td>Aerobic</td><td>{{ entry.aerobic }}</td></tr>
                                    <tr><td>Anaerobic</td><td>{{ entry.anaerobic }}</td></tr>
                                    <tr><td>Benefit</td><td>{{ entry.benefit }}</td></tr>
                              </tbody>
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
                                    :foodType="entry.foodType"
                                    :kcal="entry.kcal"
                                    :model="entry.model"
                                    :modelId="entry.modelId"
                                    @on-add-free-entry="onAddFreeEntry(entry)"
                                    @on-update-free-entry="onUpdateFreeEntry(entry)">
                        </model-free>
                  </div>
                  <div v-else>
                        <div>{{ entry.title }}</div>
                        <div>{{ entry.description }}</div>
                        <div v-if="entry.foodType">{{ entry.foodType }}</div>
                        <div v-if="entry.kcal">{{ entry.kcal }}</div>
                  </div>
            </div>
            <div v-if="entry.type === 'FOOD'">
                  <div>{{ entry.title }}</div>
                  <div v-if="entry.model">
                        <div>Calories {{ entry.quantity * entry.model.kcal }}</div>
                  </div>
            </div>
            <button class="button-color" v-if="entry.type != 'FOOD' && entry.editMode !== true" @click="onEditEntry(entry)">Edit</button> 
            &nbsp;
            <button class="button-color" v-if="entry.editMode !== true" @click="onDeleteEntry(entry)">Delete</button>
            &nbsp;
            <button class="button-color" v-if="entry.type == 'FREE' && entry.editMode !== true" @click="onCreateFoodModel(entry)">Create Model</button>
      
      </div>
</div>
</template>

<script setup>
import ModelFree from './ModelFree.vue';
import ModelSport from './ModelSport.vue';
import { ref, defineEmits, defineProps, onUpdated, onMounted } from 'vue'
import { createFoodModelFromEntry } from '@/ModelService';

const emit = defineEmits(['onUpdateFreeEntry', 'onUpdateSportEntry', 'onDeleteEntry']);
const props = defineProps(["date", "entries", "shouldBeDisplayed"]);
let editMode = ref(false);

/*
onUpdated(() => {
      editMode = false;
      props.entries.forEach(entry => {
            //console.log(entry.title);
            console.log(entry.model.title);
            //getModel(entry);
      });
});
*/

function onCreateFoodModel(entry) {
      createFoodModelFromEntry(entry)
}

function onAddFreeEntry(entry) {
      console.log("Day Entries onAddFreeEntry");
      emit('onAddFreeEntry', entry);
}

function onUpdateFreeEntry(entry) {
      console.log("Day Entries onUpdateFreeEntry");
      emit('onUpdateFreeEntry', entry);
}

function onAddSportEntry(entry) {
      emit('onUpdateSportEntry', entry);
}

/*
function getModel(entry) {
      fetch(process.env.VUE_APP_URL + '/model/' + entry.modelId, {
          method: 'GET',
          headers: {
            'Authorization' : 'Bearer ' + localStorage.getItem("token"),
          }
      })
      .then(response => response.json())
      .then(model => {
            console.log("model " + model.title);
            entry.model = model
      });
}
*/
function onEditEntry(entry) {
      entry.editMode = true;
      editMode = true;
}

function onDeleteEntry(entry) {
      fetch(process.env.VUE_APP_URL + '/entry/' + entry.id, {
          method: 'DELETE',
          headers: {
            'Authorization' : 'Bearer ' + localStorage.getItem("token"),
          }
      })
      .then(_ => emit('onDeleteEntry', entry));
}
</script>

<style>
.formatted {
    white-space:pre-wrap;
}

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