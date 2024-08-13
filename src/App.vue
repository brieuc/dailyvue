<template>
<error-view></error-view>
<login-entry  :display-login="error403"
              v-on:on-generated-token="onGeneratedToken"></login-entry>
<div v-for="date in dates" :key="date">
  <one-period :initial-date=date
              :number-of-days=7>
  </one-period>
  <p></p>
</div>
</template>

<script>
import ErrorView from './components/ErrorView.vue'
import LoginEntry from './components/LoginEntry.vue'
import OnePeriod from './components/OnePeriod.vue'

export default {
  name: 'App',
  components: {
    OnePeriod,
    LoginEntry,
    ErrorView,
  },
  data() {
    return {
      dates: new Array(),
      error403: Boolean,
      token: String,
      machin: 'truc'
    }
  },
  computed: {
    errorMessage() {
      console.log('computed : ' + this.error)
      return this.error
    }

  },
  provide: {
    error: 'test error from parent',
  },
  methods: {
    onGeneratedToken(token) {
      console.log("onGeneratedToken " + token);
      this.token = token;
      localStorage.setItem("token", token);
      this.error403 = false;
      this.initDates();
    },
    async initDates() {

      if (localStorage.getItem("token") == null) {
        return;
      }

      let minDate = await this.getMinDate();
      if (minDate != -1) {
        let minDateStr = minDate;
        let d = null;
        fetch(process.env.VUE_APP_URL + '/entry/get/' + minDateStr + '?numberOfDays=7', {
            method: 'GET',
            headers: {
              'Authorization' : 'Bearer ' + localStorage.getItem("token"),
            }
          }
        )
        .then(response => response.json())
        .then(entries => {
          entries.forEach(element => {
            d = new Date(element);
            this.dates.push(d);
          });
        })
      }
    },
    //Remonté au dessus directement en utilisant le then juste après.
    async getMinDate() {
      const response = await fetch(process.env.VUE_APP_URL + '/entry/firstDate', {
          method: 'GET',
          headers: {
            'Authorization' : 'Bearer ' + localStorage.getItem("token"),
          }
        }
      );
      if (response.status == 403) {
        this.error403 = true;
        return -1;
      }
      else if (response.ok) {
        this.error403 = false;
        const data = await response.json();
        let minDate = data.pop();
        console.log('data ' + minDate);
        return minDate;
      }
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

body {
  /*
  --background-image: linear-gradient(to top, #dad4ec 0%, #dad4ec 1%, #f3e7e9 100%);
  --background: url("../../public/images/burger1.jpg") no-repeat center center fixed;
  /Users/brieuc/Documents/vue/dailymon/src/assets/
  */
  background-image: url("./assets/pexels-padrinan-255379.jpg");
  background-attachment: fixed;
}

@media only screen and (max-width: 393px) {
  body {
    background-image: url("./assets/pexels-padrinan-255379.jpg");
    background-repeat: repeat;
    /*background-attachment: fixed;*/
  }
}

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
