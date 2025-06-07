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

const models = ref([]);
const foodTypeArray = ref(["ALCOHOL", "YOGHOURT", "MEAL", "ICECREAM", "JUNKFOOD", "CHOCO"]);

const dailyStore = useDailyStore();
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

/*
function getModels() {
	fetch(process.env.VUE_APP_URL + '/model/free', {
		method: 'GET',
		headers: {
			'Authorization' : 'Bearer ' + localStorage.getItem("token"),
		}
	})
	.then(response => response.json())
	.then(json => {
		//const model = json.at(0);
		//modelId = model.id;
		models.value = json;
		if (selectedModel.value == null) {
			selectedModel.value = models.value.at(0);
		}
		else {
			selectedModel.value = props.model;
		}
		console.log("models " + JSON.stringify(models.value));
	})
}
*/

function onUpdateFreeEntry() {
	let emitMethod = "";
	let fetchMethod = "";
	let fetchURL = "";
	let bodyToAdd = {};
	if (props.entryId) {
		fetchMethod = 'PUT';
		emitMethod = "onUpdateFreeEntry";
		bodyToAdd = {
			modelId:  props.modelId,
			date: props.date,
			id: props.entryId,
			title: title.value,
			description: description.value,
		};
		console.log("selectedModel " + JSON.stringify(selectedModel.value));
		if (selectedModel.value.title === 'Free Food') {
			console.log("PUT model " + selectedModel.value.title);
			fetchURL = process.env.VUE_APP_URL + '/entry/' + props.entryId + '/free/food'
			bodyToAdd.foodType = foodType.value;
			bodyToAdd.kcal = kcal.value;
		}
		else {
			console.log("PUT model " + selectedModel.value.title);
			selectedModel.value.title
			fetchURL = process.env.VUE_APP_URL + '/entry/' + props.entryId + '/free'
		}
	}
	else {
		fetchMethod = "POST";
		emitMethod = "onAddFreeEntry";
		bodyToAdd = {
			title: title.value,
			description: description.value,
			date: props.date,
			modelId: selectedModel.value.id
		};
		console.log("selectedModel " + JSON.stringify(selectedModel.value));
		if (selectedModel.value.title === 'Free Food') {
			fetchURL = process.env.VUE_APP_URL + '/entry/free/food';
			bodyToAdd.foodType = foodType.value;
			bodyToAdd.kcal = kcal.value;
		}
		else {
			fetchURL = process.env.VUE_APP_URL + '/entry/free';
		}
	}
	
	let statusCode = 0;
	fetch(fetchURL, {
		method: fetchMethod,
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Content-Type': 'application/json',
			'Accept': 'application/json',
			'Authorization' : 'Bearer ' + localStorage.getItem("token"),
		},
		body: JSON.stringify(bodyToAdd),
	})
	.then(response => {
		statusCode = response.status;
		return response.json()
	})
	.then(json => {
		dailyStore.errorMessage = json.message;
		emit(emitMethod, json);
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