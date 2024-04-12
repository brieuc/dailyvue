<template>
<div class="flex">
        <div class="paragraph">{{ label }}</div>
        <!--<div class="paragraph">{{ description }}</div>-->
        <div style="max-width: 3rem; min-width: 3rem;">{{ kcal }}</div>
        <div style="max-width: 1rem; min-width: 1rem">{{ newQuantity }}</div>
        <div class="button" @click="onAdd"> + </div>
        <div class="button" @click="onSub"> - </div>
</div>
</template>

<script>
export default {
    name: 'ModelEntry',
    emits: ["onUpdateEntry"],
    props: {
        label: String,
        description: String,
        kcal: Number,
        quantity: Number,
        entryId: String,
        modelId: String
    },
    data() {
        return {
            // impossible to do that, the newQuantity isn't diplayed.
            // isn't set either.
            // newQuantity: this.quantity
            // We're trying something else.
            delta: 0,

        }
    },
    computed: {
        newQuantity() {
            return this.quantity + this.delta;
        }
    },
    methods: {
        onAdd() {
            console.log('onAdd  ' + this.entryId);
            this.delta = this.delta + 1;
            this.$emit("onUpdateEntry", this.modelId, this.entryId, this.newQuantity);
        },
        onSub() {
            if (this.newQuantity > 0) {
                this.delta = this.delta - 1;
                this.$emit("onUpdateEntry", this.modelId, this.entryId, this.newQuantity);
            }
        }
    },
    updated() {
        this.delta = 0;
        console.log('updated entryId ' + this.entryId + ' ');
    }
}
</script>

<style>

.paragraph {
    max-width: 10rem;
    min-width: 5rem;
}

.flex {
    border-radius: 5px;
    border-color: black;
    border-style: solid;
    display: flex;
    flex-direction: row;
    max-width:min-content;  
    margin: auto;
    border-width: 1px;
}

.button {
  background-color: #71a6af; /* Green */

  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  --display: inline-block;
  font-size: 16px;
  border-style: solid 1px;
  border-radius: 2px;
  border-style: solid;
  border-color: rgb(57, 55, 55);
  border-width: 1px;  
}
</style>