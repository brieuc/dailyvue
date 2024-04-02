<template>
<div style="align-content: center;">
    <div class="flex">
        <p class="paragraph">{{ label }}</p>
        <p class="paragraph">{{ description ? description : "NoDesc"}}</p>
        <p class="paragraph">{{ kcal }}</p>
        <p class="paragraph">{{ newQuantity }}</p>
        <p><button class="button" @click="onAdd"> + </button></p>
        <p><button class="button" @click="onSub"> - </button></p>
    </div>  
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
    --max-width: 10rem;
    min-width: 5rem;
}

.flex {
    display: flex;
    flex-direction: row;
    max-width: 20rem;
    min-width: 15rem;
    margin: auto;
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