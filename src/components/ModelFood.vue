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
    
<script>
    import ModelFoodSingle from './ModelFoodSingle.vue';
    export default {
        name: 'ModelFood',
        emits: ["onUpdateFoodEntry"],
        components: {
            ModelFoodSingle
        },
        props: {
            date: String
        },
        data() {
            return {
                selectedDay: this.date,
                models: new Array(),
                entriesByModelId: new Map(),
            }
        },
        methods: {
            onAddFoodEntry(model) {
                let activeEntry = this.entriesByModelId.get(model.id);
                let quantity = 1;
                if (activeEntry != null) {
                    quantity = activeEntry.quantity + 1;
                }
                this.updateFoodEntry(activeEntry, model, quantity);
            },
            onSubFoodEntry(model) {
                let activeEntry = this.entriesByModelId.get(model.id);
                // If there is no entry, so there is nothing to substract
                if (activeEntry != null) {
                    this.updateFoodEntry(activeEntry, model, activeEntry.quantity - 1);
                }
            },
            updateFoodEntry(activeEntry, model, newQuantity) {
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
                        date: this.selectedDay,
                        title: model.title,
                        description: model.description
                    });
                }
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
                    this.entriesByModelId.set(newEntry.modelId, newEntry);
                    this.$emit("onUpdateFoodEntry", newEntry);
                });
            },
            getModels() {
                fetch(process.env.VUE_APP_URL + '/model/food', {
                    method: 'GET',
                    headers: {
                        'Authorization' : 'Bearer ' + localStorage.getItem("token"),
                    }
                })
                .then(response => {
                    if(response.ok) {
                    return response.json()
                    }
                })
                .then(json => {
                    json.forEach(model => {
                        this.models.push(model);
                    });
                    this.getEntries();
                })
            },
            getEntries() {
                fetch(process.env.VUE_APP_URL + '/entry/' + this.selectedDay + '/food', {
                    method: 'GET',
                    headers: {
                        'Authorization' : 'Bearer ' + localStorage.getItem("token"),
                    }
                    }
                )
                .then(response => {
                    if(response.ok) {
                        return response.json(); 
                    }
                })
                .then(json => {
                    console.log("json for each " + JSON.stringify(json));
                    json.forEach(entry => {
                        this.entriesByModelId.set(entry.modelId, entry)
                    });   
                })
            }
        },
        mounted() {
            this.getModels();
        }
    }
</script>

<style>
</style>