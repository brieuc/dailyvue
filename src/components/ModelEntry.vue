<template>
<div style="display:flex; border-style: solid; border-color: black;">
    {{ label }}
    {{ description ? description : "NoDesc"}}
    {{ kcal }}
    {{ newQuantity }}
    <button class="button" @click="onAdd"> + </button>
    <button class="button" @click="onSub"> - </button>
</div>    

</template>

<script>
export default {
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
            this.delta = this.delta - 1;
            this.$emit("onUpdateEntry", this.modelId, this.entryId, this.newQuantity);
        }
    },
    updated() {
        this.delta = 0;
        console.log('updated entryId ' + this.entryId + ' ');
    }
}
</script>

<style>
tr {
    width: max-contentnt;
}

.button {
  background-color: #04AA6D; /* Green */
  border: none;
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  border-style: solid;
}
</style>