<template>
<div class="flexRow">
    <div @click="selectCategory('food')">Food</div>
    <div @click="selectCategory('sport')">Sport</div>
    <div @click="selectCategory('free')">Free</div>
</div>
</template>

<script>
import { ref } from 'vue'

export default {
    emits: ['onSelectModel'],
    setup(props, {emit}) {

        const selectedCategory = ref("");

        function selectCategory(categoryName) {
            if (categoryName == selectedCategory.value) {
                selectedCategory.value = null;
            }
            else {
                selectedCategory.value = categoryName;
            }
            emit('onSelectModel', selectedCategory.value);
        }

        return {
            selectedCategory,
            selectCategory
        }
    }
}
</script>

<style>

.flexRow {
    align-items: center;
    text-align: center;
    display:flex;
    flex-direction: row;
    justify-content: space-evenly;
    background-color:cornflowerblue;
    color: beige;
    cursor: pointer;
    width: 400px;
    --max-width: 400px;
}

@media only screen and (max-width: 393px) {
    .flexRow {
        width: 100%;
    }
}

</style>