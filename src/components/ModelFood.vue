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
import { defineEmits, defineProps, ref, onMounted } from 'vue';
import ModelFoodSingle from './ModelFoodSingle.vue';
import { useDailyStore } from '@/dailyStore';
import { useEntries } from '@/composables/useEntries';

const emit = defineEmits(['onUpdateFoodEntry']);
const props = defineProps(["date"]);
const dailyStore = useDailyStore();
const {createEntry, updateEntry} = useEntries();


const selectedDay = ref(props.date);
const models = ref([]);
const entriesByModelId = ref(new Map());



function onAddFoodEntry(model) {
    let activeEntry = entriesByModelId.value.get(model.id);
    let quantity = 1;
    if (activeEntry != null) {
        quantity = activeEntry.quantity + 1;
    }
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
    let entryPromise;

    if (activeEntry != null) {
        entryPromise = updateEntry(activeEntry.id, {
            id: activeEntry.id,
            title: activeEntry.title,
            description: activeEntry.description,
            quantity: newQuantity,
            modelId: model.id,
            date: activeEntry.date,
            type: "FOOD"
        });
    }
    else {
        entryPromise = createEntry({
            quantity: newQuantity,
            modelId: model.id,
            date: selectedDay.value,
            title: model.title,
            description: model.description,
            type: "FOOD"
        });
    }

    entryPromise
    .then(newEntry => {
        entriesByModelId.value.set(newEntry.model.id, newEntry);
        emit("onUpdateFoodEntry", newEntry);
    })
    .catch(error => {
        console.error('Erreur:', error);
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