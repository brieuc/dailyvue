<template v-slot:category>
    <div id="border">
        <div @click="selectDay()" style="min-height: 30px; display: grid; align-items: center; background-color: palevioletred; color: aliceblue;">
            <span>{{ date }}</span><span style="text-align: right;">+</span>
        </div>
        <div v-for="[,entry] in updatedEntries" :key="entry.id">
            <section>
                {{ entry.title }} ({{ entry.quantity }})
            </section>
        </div>
    </div>
    <slot name="category"></slot>
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
    margin: auto;
    max-width: 200px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.26);
    --padding: 1rem;
}
</style>