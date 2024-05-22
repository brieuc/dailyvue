<template>
	<div id="border">
		<p>Title<input type="text" v-model="title"></p>
		<p>Description<textarea v-model="description"></textarea></p>
		<p><button @click="addFreeEntry()">{{ mode == 'update' ? "Upate Entry" : "Add Entry"}}</button></p>
	</div>
</template>

<script setup>
import { ref, defineEmits, onMounted, defineProps } from 'vue'

const emit = defineEmits(['onAddFreeEntry']);
const props = defineProps(["date", "title", "description", "entryId", "mode"]);

const title = ref(props.title);
const description = ref(props.description);
let modelId;

onMounted(() => {
	console.log('onMounted');
	getModels();
});

function getModels() {
	fetch(process.env.VUE_APP_URL + '/model/free')
		.then(response => response.json())
		.then(json => {
			console.log(JSON.stringify(json));
			const model = json.at(0);
			console.log(model.id);
			modelId = model.id;
		})
}

function addFreeEntry() {
	console.log("entry Id " + props.entryId);
	let fetchMethod = "";
	let fetchURL = "";
	let bodyToAdd = {};
	if (props.entryId) {
		fetchURL = process.env.VUE_APP_URL + '/entry/' + props.entryId + '/free'
		console.log(fetchURL);
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
	
	console.log('body ' + JSON.stringify(bodyToAdd));
	fetch(fetchURL, {
		method: fetchMethod,
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Content-Type': 'application/json',
			'Accept': 'application/json',
		},
		body: JSON.stringify(bodyToAdd),
	})
	.then(response => response.json())
	.then(json => {
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