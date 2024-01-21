<template>
    <p>{{ date.toLocaleString() }}</p>
    <p v-for="entry in entries" :key="entry.id">
        {{ entry.description }} : {{ entry.quantity }}
    </p>
</template>

<script>
export default {
    props: {
        date: Date
    },
    data() {
        return {
            entries: []
        }
    },
    mounted() {
        console.log('onMounted');
        this.loadEntriesByDate();
    },
    methods: {
        loadEntriesByDate() {
            fetch('http://localhost:8080/entry/' + this.date.toISOString().split("T")[0])
            .then(response => {
                console.log('response');
                return response.json();
            })
            .then(data => {
                console.log('affectation data dans entries');
                this.entries = data;
                console.log(this.entries)
            })
        }
    }
}
</script>

<style>
td {
    width: 100px;
    height: 100px;
}
</style>