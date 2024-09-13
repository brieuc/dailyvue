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
	<p><button @click="addFreeEntry()">{{ mode == 'update' ? "Upate Entry" : "Add Entry"}}</button></p>
</div>
</template>

<script setup>
import { ref, defineEmits, onMounted, defineProps, isRef } from 'vue'
import { useDailyStore } from '@/dailyStore';

const models = ref([]);
const foodTypeArray = ref(["ALCOHOL"]);
const foodType = ref();
const kcal = ref();
const selectedModel = ref();

const dailyStore = useDailyStore();
const emit = defineEmits(['onAddFreeEntry']);
const props = defineProps(["date", "title", "description", "entryId", "mode"]);

const title = ref(props.title);
const description = ref(props.description);
let modelId;

onMounted(() => {
	getModels();
});

function isModelIsFreeFood() {
	if(!selectedModel.value)
		return false;
	if(selectedModel.value.title == "Free Food") {
		return true;
	}
	return false;
}

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
		console.log("models " + JSON.stringify(models.value));
	})
}

function addFreeEntry() {
	let fetchMethod = "";
	let fetchURL = "";
	let bodyToAdd = {};
	if (props.entryId) {
		fetchURL = process.env.VUE_APP_URL + '/entry/' + props.entryId + '/free'
		fetchMethod = 'PUT';
		bodyToAdd = {
			id: props.entryId,
			title: title.value,
			description: description.value,
		};
	}
	else {
		fetchMethod = "POST";
		bodyToAdd = {
			title: title.value,
			description: description.value,
			date: props.date,
			modelId: selectedModel.value.id
		};
		if (selectedModel.value.title === 'Free Food') {
			fetchURL = process.env.VUE_APP_URL + '/entry/free/food';
			bodyToAdd.kcal = kcal.value;
			bodyToAdd.foodType = foodType.value;
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
		emit('onAddFreeEntry', json);
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