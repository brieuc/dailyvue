<template>
<div id="border">
	<p>Title &nbsp;<input type="text" v-model="title"></p>
	<p>Description<textarea rows="5" cols="33" v-model="description"></textarea></p>
	<p><button @click="addFreeEntry()">{{ mode == 'update' ? "Upate Entry" : "Add Entry"}}</button></p>
</div>
</template>

<script setup>
import { ref, defineEmits, onMounted, defineProps } from 'vue'
import { useDailyStore } from '@/dailyStore';

const dailyStore = useDailyStore();
const emit = defineEmits(['onAddFreeEntry']);
const props = defineProps(["date", "title", "description", "entryId", "mode"]);

const title = ref(props.title);
const description = ref(props.description);
let modelId;

onMounted(() => {
	getModels();
});

function getModels() {
	fetch(process.env.VUE_APP_URL + '/model/free', {
		method: 'GET',
		headers: {
			'Authorization' : 'Bearer ' + localStorage.getItem("token"),
		}
	})
	.then(response => response.json())
	.then(json => {
		const model = json.at(0);
		modelId = model.id;
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
		fetchURL = process.env.VUE_APP_URL + '/entry/free';
		fetchMethod = "POST";
		bodyToAdd = {
			title: title.value,
			description: description.value,
			date: props.date,
			modelId: modelId
		};
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