<template>
<p>food single</p>
<div class="flex">
    <div class="paragraph">{{ title }}</div>
    <!--<div class="paragraph">{{ description }}</div>-->
    <div style="max-width: 3rem; min-width: 3rem;">{{ kcal }}</div>
    <div class="button" @click="onAdd"> + </div>
    <div class="button" @click="onSub"> - </div>
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
  cursor: pointer;
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