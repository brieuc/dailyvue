<template>
	<p>free</p>
	<p><input type="text" v-model="title"></p>
	<p><textarea v-model="description"></textarea></p>
	<p><button @click="addFreeEntry()">Add Entry</button></p>
</template>

<script setup>
import { ref, defineEmits, onMounted, defineProps } from 'vue'

const emit = defineEmits(['onAddFreeEntry']);
const props = defineProps(["date"]);

const title = ref();
const description = ref();
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

	const bodyToAdd = {
		title: title.value,
		description: description.value,
		date: props.date,
		modelId: this.modelId
	};

	fetch(process.env.VUE_APP_URL + '/entry/free', {
		method: 'POST',
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Content-Type': 'application/json',
			'Accept': 'application/json',
		},
		body: JSON.stringify(bodyToAdd),
	})
	.then(response => response.json())
	.then(json => {
		emit('onAddFreeEntry', bodyToAdd);
	});
}
</script>