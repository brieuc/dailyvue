<template>
<div id="border">
	<p>
	Model
	<select v-model="selectedModel">
		<option v-for="model in models" :key="model" :value="model">{{ model.title }}</option>
	</select>
	</p>
	<p>Title &nbsp;<input type="text" v-model="title"></p>
	<p>Description<textarea rows="5" cols="33" v-model="description"></textarea></p>
	<p v-if="isModelIsFreeFood()">
	Food type
	<select v-model="foodType">
		<option v-for="val in foodTypeArray" :key="val" :value="val">{{ val }}</option>
	</select>
	</p>
	<p v-if="isModelIsFreeFood()">Calories &nbsp;<input type="text" v-model="kcal"></p>
	<p><button @click="onUpdateFreeEntry()">{{ mode == 'update' ? "Upate Entry" : "Add Entry"}}</button></p>
</div>
</template>

<script setup>
import { ref, defineEmits, onMounted, defineProps, isRef, onUpdated } from 'vue'
import { useDailyStore } from '@/dailyStore';
import { useEntries } from '@/composables/useEntries';

const models = ref([]);
const foodTypeArray = ref(["ALCOHOL", "YOGHOURT", "MEAL", "ICECREAM", "JUNKFOOD", "CHOCO"]);

const dailyStore = useDailyStore();
const { createEntry, updateEntry } = useEntries();
const emit = defineEmits(['onAddFreeEntry', 'onUpdateFreeEntry']);
const props = defineProps(["date", "title", "description", "entryId", "mode",
					"foodType", "kcal", "model", "modelId"]);

const title = ref(props.title);
const description = ref(props.description);
const foodType = ref(props.foodType);
const kcal = ref(props.kcal);
const selectedModel = ref(props.model);

onMounted(() => {
	getModels();
});

function isModelIsFreeFood() {
	console.log("isModelIsFreeFood " + selectedModel.value);
	if(!selectedModel.value)
		return false;
	if(selectedModel.value.title == "Free Food") {
		return true;
	}
	return false;
}

function getModels() {
	models.value = dailyStore.freeModels;
	console.log("getModels free ", JSON.stringify(models.value));
	if (selectedModel.value == null && props.model == null) {
		selectedModel.value = models.value.at(0);
		//console.log("selected null ", selectedModel.value );
	}
	else {
		selectedModel.value = props.model;
		console.log("props free ", JSON.stringify(props.model));
	}
}

function onUpdateFreeEntry() {
	let emitMethod = "";
	let fetchMethod = "";
	let fetchURL = "";
	let bodyToAdd = {};

	let entryPromise;
	if (props.entryId) {

		const isFreeFoodModel = selectedModel.value.title === 'Free Food';

		entryPromise = updateEntry(props.entryId, {
			title: title.value,
			description: description.value,
			date: props.date,
			type: isFreeFoodModel ? "FREE_FOOD" : "FREE",
			...(isFreeFoodModel && {
				foodType: foodType.value,
				kcal: kcal.value
			})
		});
	}
	else {
		entryPromise = createEntry({
			title: title.value,
			description: description.value,
			date: props.date,
			modelId: selectedModel.value.id,
			...(selectedModel.value.title === 'Free Food' 
			? { 
				type: "FREE_FOOD",
				foodType: foodType.value,
				kcal: kcal.value 
				}
			: { 
				type: "FREE" 
				}
			)
		});
	}

	entryPromise
	.then(newEntry => {
		emit(emitMethod, newEntry);
	});
}
</script>

<style>
#border {
    border: 1px;
    --border-radius: 5px;
    border-color: black;
    border-style: solid;
    cursor: pointer;
    margin: auto;
    width: 200px;
    --box-shadow: 0 2px 2px rgba(0, 0, 0, 0.26);
    --padding: 1rem;
}

@media only screen and (max-width: 393px) {
  #border {
    border: 1px;
    --border-radius: 5px;
    border-color: black;
    border-style: solid;
    cursor: pointer;
    width: 100%;
    --box-shadow: 0 2px 2px rgba(0, 0, 0, 0.26);
  }
}
</style>