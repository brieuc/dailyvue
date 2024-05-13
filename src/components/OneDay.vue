<template>
    <div id="border">
        <div @click="selectDay()" style="min-height: 30px; display: grid; align-items: center; background-color: palevioletred; color: aliceblue;">
            <span>{{ date }}</span><span style="text-align: right;">+</span>
        </div>
        <div v-for="entry in entries" :key="entry.id" @click="displayDay()">
            <section>
                {{ entry.title }} {{ entry.quantity ? "(" + entry.quantity +")":"" }}

            </section>
        </div>
    </div>
    <slot name="category"></slot>
    <slot></slot>
</template>

<script>
export default {
    emits: ["onChangeDay", "onDisplayDay"],
    props: {
        date: String,
        entries: null,
    },
    data() {
        return {
        }
    },
    computed() {
    },
    mounted() {
        console.log("on mounted oneday");
    },
    methods: {
        selectDay() {
            this.$emit('onChangeDay', this.date);
        },
        displayDay() {
            this.$emit('onDisplayDay', this.date);
        },
    }
}
</script>

<style>
#border {
    border-radius: 5px;
    border-color: black;
    border-style: solid;
    cursor: pointer;
    margin: auto;
    max-width: 200px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.26);
    --padding: 1rem;
}

@media only screen and (max-width: 393px) {
  #border {
    border-radius: 5px;
    border-color: black;
    border-style: solid;
    cursor: pointer;
    margin: auto;
    max-width: 100%;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.26);
  }
}
</style>