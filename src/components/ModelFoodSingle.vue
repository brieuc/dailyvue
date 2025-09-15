<template>
<div class="wrapper">
    <div>{{ title }}</div>
    <div>{{ kcal }}</div>
    <div><button class="button-10" @click="onAdd"> + </button></div>
    <div><button class="button-10" @click="onSub"> - </button></div>
</div>
</template>

<script>
import { logger } from '@/utils/logger';

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
            logger.log("onAddFoodEntry");
            debugger;
            this.$emit("onAddFoodEntry", this.model);
        },
        onSub() {
            this.$emit("onSubFoodEntry", this.model);
        }
    }
}
</script>

<style>

.wrapper {
  display: grid;
  grid-template-columns: 200px 70px 40px 40px;
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

.button-10 {
      padding: 6px 14px;
      font-family: -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif;
      border-radius: 6px;
      border: none;

      color: #fff;
      background: linear-gradient(180deg, #4B91F7 0%, #367AF6 100%);
      background-origin: border-box;
      box-shadow: 0px 0.5px 1.5px rgba(54, 122, 246, 0.25), inset 0px 0.8px 0px -0.25px rgba(255, 255, 255, 0.2);
      user-select: none;
      -webkit-user-select: none;
      touch-action: manipulation;
}
</style>