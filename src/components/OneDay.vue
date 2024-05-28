<template>
    <div id="border">
        <div @click="selectDay()" style="min-height: 30px; background-color:darkslategray; color: white;">
            <span>{{ day }}</span> <span>{{ date }}</span>
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
    computed: {
        day() {
            const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
            let now = new Date(this.date);
            return days[now.getDay()];
        },

        
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
    border: 1px;
    --border-radius: 5px;
    border-color: black;
    border-style: solid;
    cursor: pointer;
    margin: auto;
    width: 200px;
    --box-shadow: 0 2px 2px rgba(0, 0, 0, 0.26);
    --padding: 1rem;
}

@media only screen and (max-width: 393px) {
  #border {
    border: 1px;
    --border-radius: 5px;
    border-color: black;
    border-style: solid;
    cursor: pointer;
    width: 100%;
    --box-shadow: 0 2px 2px rgba(0, 0, 0, 0.26);
  }
}
</style>