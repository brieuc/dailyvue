<template>
<div class="modelFlex">
    <div>{{ title }}</div>
    <div>{{ kcal }}</div>
    <div>
        <span class="button" @click="onAdd"> + </span>
        <span class="button" @click="onSub"> - </span>
    </div>

</div>
</template>

<script>
export default {
    name: 'ModelFoodSingle',
    emits: ["onAddFoodEntry", "onSubFoodEntry"],
    props: {
        title: String,
        description: String,
        kcal: Number,
        model: null
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
    methods: {
        onAdd() {
            console.log("model : ", JSON.stringify(this.model));
            this.$emit("onAddFoodEntry", this.model);
        },
        onSub() {
            this.$emit("onSubFoodEntry", this.model);
        }
    }
}
</script>

<style>

.modelFlex {
    display: flex;
    gap: 10px;
    height: 40px;
}


.button {
  background-color: #655263; /* Green */
  cursor: pointer;
  color: white;
  padding: 5px 10px;
  text-decoration: none;
  font-size: 16px;
  border-style: solid 1px;
  --border-radius: 2px;
  border-style: solid;
  border-color: rgb(57, 55, 55);
  border-width: 1px;  
}
</style>