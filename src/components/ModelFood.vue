<template>
<div style="padding-top: 10px; padding-bottom: 10px; border: 1px black solid" >
    <div style="padding-left:10px;" v-for="model in models" :key="model.id">
        <model-food-single @on-add-food-entry="onAddFoodEntry" @on-sub-food-entry="onSubFoodEntry" 
                :title="model.title"
                :description="model.description"
                :kcal="model.kcal"
                :model="model">
        </model-food-single>
    </div>
</div>
</template>
    
<script setup>
import { reactive, defineEmits, defineProps, ref, onMounted } from 'vue';
import ModelFoodSingle from './ModelFoodSingle.vue';
import { createModelFood } from '@/modelfood';
import { useDailyStore } from '@/dailyStore';

const emit = defineEmits(['onUpdateFoodEntry']);
const props = defineProps(["date"]);
const dailyStore = useDailyStore();


const selectedDay = ref(props.date);
const models = ref([]);
const entriesByModelId = ref(new Map());



function onAddFoodEntry(model) {
    let activeEntry = entriesByModelId.value.get(model.id);
    let quantity = 1;
    if (activeEntry != null) {
        quantity = activeEntry.quantity + 1;
    }
    console.log("active entry " + JSON.stringify(model) + " " + quantity);
    updateFoodEntry(activeEntry, model, quantity);
}

function onSubFoodEntry(model) {
    let activeEntry = entriesByModelId.value.get(model.id);
    // If there is no entry, so there is nothing to substract
    if (activeEntry != null) {
        updateFoodEntry(activeEntry, model, activeEntry.quantity - 1);
    }
}

function updateFoodEntry(activeEntry, model, newQuantity) {
    let fetchMethod = '';
    let url = '';
    let bodyFetch = '';
    // If there is no entry for this model Id, we need to POST
    if (activeEntry != null) {
        activeEntry.quantity = newQuantity;
        fetchMethod = 'PUT';
        url = process.env.VUE_APP_URL + '/entry/' + activeEntry.id + '/food';
        bodyFetch = JSON.stringify({
            id: activeEntry.id,
            title: activeEntry.title,
            description: activeEntry.description,
            quantity: newQuantity,
        });
    }
    else {
        fetchMethod = 'POST';
        url = process.env.VUE_APP_URL + '/entry/food';
        console.log(url);
        bodyFetch = JSON.stringify({
            quantity: newQuantity,
            modelId: model.id,
            date: selectedDay.value,
            title: model.title,
            description: model.description
        });
    }
    console.log("body fetch " + JSON.stringify(bodyFetch));
    fetch(url, {
        method: fetchMethod,
        headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization' : 'Bearer ' + localStorage.getItem("token"),
        },
        body: bodyFetch,
    })
    .then(response => {
        if (response.ok)
            return response.json();
    })
    .then(json => {
        const newEntry = json;
        entriesByModelId.value.set(newEntry.modelId, newEntry);
        emit("onUpdateFoodEntry", newEntry);
    });
}
            
function getModels() {
    models.value = dailyStore.foodModels;
}

onMounted(() => {
    getModels();
});

</script>

<style>
</style>