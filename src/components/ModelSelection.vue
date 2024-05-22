<template v-slot:category>
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
            console.log(categoryName);
            console.log(selectCategory.value);
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
    border: 1px;
    align-items: center;
    text-align: center;
    border-style: solid;
    border-color: black;
    display:flex;
    flex-direction: row;
    justify-content: space-around;
    background-color:cornflowerblue;
    color: beige;
    cursor: pointer;
    width: 200px;
    max-width: 300px;
    margin: auto;
}

</style>