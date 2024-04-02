<template>
    <div id="border" @click="selectDay()">
        <div style="background-color: palevioletred; color: aliceblue;">{{ date }}</div>
        <div v-for="[,entry] in updatedEntries" :key="entry.id">
            <section>
                {{ entry.description }} ({{ entry.quantity }})
            </section>
        </div>
    </div>
    <slot></slot>
</template>

<script>
export default {
    emits: ["onChangeDay"],
    props: {
        date: String,
        entries: Map,
    },
    data() {
        return {
            selectedEntry: null,
            updatedEntries: this.entries,
        }
    },
    computed() {
    },
    mounted() {
        console.log('onMounted');
        console.log('mountend entries size ' + this.updatedEntries.size);
        this.updatedEntries.forEach(entry => console.log(entry.id));
    },
    methods: {
        selectDay() {
            this.$emit('onChangeDay', this.date);
        },
    },
    updated() {
        console.log('updated entries size ' + this.updatedEntries.size);
    }
}
</script>

<style>
#border {
    border-radius: 5px;
    border-color: black;
    border-style: solid;
    cursor: pointer;
    margin: 2rem auto;
    max-width: 15rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.26);
    --padding: 1rem;
}
</style>