<template>
<error-view></error-view>
<login-entry  :display-login="error403"
              v-on:on-generated-token="onGeneratedToken"></login-entry>
<button hidden="true" @click="loadEntries()">Charger toutes les entrées</button>
<div v-for="period in periods" :key="period.startDate">
  <one-period :initial-date="period.startDate"
              :has-loaded-entries="period.hasBeenLoaded"
              :number-of-days=7>
  </one-period>
  <p></p>
</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import ErrorView from './components/ErrorView.vue'
import LoginEntry from './components/LoginEntry.vue'
import OnePeriod from './components/OnePeriod.vue'
import { useOnePeriodItem } from './oneperiod';


const periods = ref([]);
const error403 = ref(false);
const token = ref(""); 

const errorMessage = computed(()=> {
  return "ERROR MSG PB";
});
      

function loadEntries() {
  console.log("has been loaded");
  periods.value.forEach(p => {
    const {date, isLoaded} = p;
    console.log("period " + JSON.stringify(p));
    console.log("hasBeenLoaded " + isLoaded.value);
    //p.hasBeenLoaded.value = true;
  });
}

function onGeneratedToken(tokenRing) {
  token.value = tokenRing;
  localStorage.setItem("token", token);
  error403.value = false;
  initDates();
}

async function initDates() {

  let i = 0;
  if (localStorage.getItem("token") == null) {
    return;
  }

  let minDate = await getMinDate();
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
      entries.forEach(date => {
        //d = new Date(element);
        //this.dates.push(d);
        //console.log("d : " + d);
        if (i < 4)
          periods.value.push(useOnePeriodItem(date, true));
        else
          periods.value.push(useOnePeriodItem(date, false));
        i++;
        //console.log("period " + period.startDate);
      });
    })
  }
}

//Remonté au dessus directement en utilisant le then juste après.
async function getMinDate() {
  const response = await fetch(process.env.VUE_APP_URL + '/entry/firstDate', {
      method: 'GET',
      headers: {
        'Authorization' : 'Bearer ' + localStorage.getItem("token"),
      }
    }
  );
  if (response.status == 403) {
    error403.value = true;
    return -1;
  }
  else if (response.ok) {
    error403.value = false;
    const data = await response.json();
    let minDate = data.pop();
    return minDate;
  }
}

onMounted(() => {
  initDates();
});
</script>

<style>

body {
  background-image: linear-gradient(to right bottom, #d16ba5, #c777b9, #ba83ca, #aa8fd8, #9a9ae1, #8aa7ec, #79b3f4, #69bff8, #52cffe, #41dfff, #46eefa, #5ffbf1);
  /*background-image: url("./assets/pexels-padrinan-255379.jpg");*/

  background-attachment: fixed;
}

@media only screen and (max-width: 393px) {
  body {
    background-image: linear-gradient(to right bottom, #d16ba5, #c777b9, #ba83ca, #aa8fd8, #9a9ae1, #8aa7ec, #79b3f4, #69bff8, #52cffe, #41dfff, #46eefa, #5ffbf1);
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
