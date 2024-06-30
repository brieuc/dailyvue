<template>
<div v-for="date in dates" :key="date">
  <one-period :initial-date=date
              :number-of-days=7>

  </one-period>
  <p></p>
</div>
</template>

<script>
import OnePeriod from './components/OnePeriod.vue';

export default {
  name: 'App',
  components: {
    OnePeriod
  },
  data() {
    return {
      dates: new Array()
    }
  },
  methods: {
    async initDates() {

      let minDate = await this.getMinDate();
      //console.log(minDate);
      
      let minDateStr = minDate;
      let d = null;
      //fetch(process.env.VUE_APP_URL+ '/entry/get/2024-05-11?numberOfDays=7')
      fetch(process.env.VUE_APP_URL + '/entry/get/' + minDateStr + '?numberOfDays=7')
      .then(response => response.json())
      .then(entries => {
        entries.forEach(element => {
          d = new Date(element);
          this.dates.push(d);
        });
      });
    },
    //Remonté au dessus directement en utilisant le then juste après.
    async getMinDate() {
      const response = await fetch(process.env.VUE_APP_URL + '/entry/firstDate');
      const data = await response.json();
      let minDate = data.pop();
      console.log('data ' + minDate);
      return minDate;
      },
  },
  mounted() {
    // dates array creation then fill the one-day component
    // which call the entry service for each date.
    // the entryMapForSelectedDay contains the entries for this specific day
    this.initDates();

  }
}
</script>

<style>
input[type="text"] {
  font-size: 16px;
}
textarea {
  font-size: 16px;
}

#app {
  border: 1px;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  width: 400px;
  max-width: 400px;
  margin: auto;
}

@media only screen and (max-width: 393px) {
  #app {
    border: 1px;
    width: 100%;
    text-align: center;
  }
}
</style>
