<template>
    <section @click="selectDay()">
        <p>{{ date.toLocaleString() }}</p>
        <div v-for="entry in entries" :key="entry.id">
            <section>
                {{ entry.description }} ({{ entry.quantity }})
            </section>
        </div>
    </section>
</template>

<script>
export default {
    props: {
        date: Date
    },
    data() {
        return {
            entries: [],
            selectedEntry: null
        }
    },
    mounted() {
        console.log('onMounted');
        this.loadEntriesByDate();
    },
    methods: {
        selectDay() {
            this.$emit('onChangeDay', this.date);
        },
        loadEntriesByDate() {
            fetch('http://localhost:8080/entry/' + this.date.toISOString().split("T")[0])
            .then(response => {
                return response.json();
            })
            .then(data => {
                this.entries = data;
            })
        }
    }
}
</script>

<style>
td {
    width: 100px;
    height: 100px;
};
div {
    border-style: solid;
    border-width: 10px;
}
</style>