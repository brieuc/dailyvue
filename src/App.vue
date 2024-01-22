<template>
  <ul v-for="date in dates" :key="date">
    <one-day :date="date" @on-change-entry="onChangeEntry"></one-day>
  </ul>
  <ul v-for="model in models" :key="model.id">
    <model-entry
      :label="model.label"
      :description="model.description"
      :kcal="model.kcal">
    </model-entry>
  </ul>

</template>

<script>
import ModelEntry from './components/ModelEntry.vue';
import OneDay from './components/OneDay.vue';

export default {
  name: 'App',
  components: {
    ModelEntry,
    OneDay
  },
  data() {
    return {
      dates: [

      ],
      models: [
        /*
        {
          id: 'a9671a7a-7206-42a3-a5b2-99c67abdcdec',
          label: 'Branche Cailler',
          description: '',
          kcal: 160
        }*/
      ]
    }
  },
  methods: {
    onChangeEntry(entry) {
      console.log('parent entry ' + entry.description);
    },
    initDates() {
      console.log('initDates');
      const today = new Date();
      const endDate = new Date().setDate(today.getDate() - 10);
      // loop from start date to end date
      console.log('today : ' + today);
      console.log('endDate : ' + endDate);
      for (
            let date = today; 
            date > endDate; 
            date.setDate(date.getDate() - 1)
          )
      {
        console.log('inside for' + date);
        this.dates.push(new Date(date));
      }
      console.log('Nb dates ' + this.dates.length);
    },
    getModels() {
      console.log('getModels');
      fetch('http://localhost:8080/model')
      .then(response => {
        if(response.ok) {
          return response.json()
        }
      })
      .then(json => {
        this.models = json;
      })
    }
  },
  mounted() {
    this.getModels();
    this.initDates();
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
