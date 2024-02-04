<template>
    <div class="border" @click="selectDay()" style="align-content: center;">
        <p>{{ date }}</p>
        <div v-for="[,entry] in updatedEntries" :key="entry.id">
            <section>
                {{ entry.description }} ({{ entry.quantity }})
            </section>
        </div>
    </div>
</template>

<script>
export default {
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
.border {
    align-content: center;
    border-style: solid;
    border-color: black;
    width:fit-content;
    height: fit-content;
    border-radius: 2px;
}
</style>