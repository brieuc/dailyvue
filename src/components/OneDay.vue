<template>
    <div class="border" @click="selectDay()">
        <p>{{ date.toLocaleString() }}</p>
        <div v-for="entry in entries" :key="entry.id">
            <section>
                {{ entry.description }} ({{ entry.quantity }})
            </section>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        date: Date,
        reload: Boolean
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
    },
    updated() {
        console.log('one day update');
    }
}
</script>

<style>
#border {
    border-style: solid;
    border: 2px;
    border-color: black;
}
td {
    width: 100px;
    height: 100px;
};
div {
    border-style: solid;
    border-width: 10px;
}
</style>