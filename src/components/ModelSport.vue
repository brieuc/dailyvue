<template>
  <div id="border">
  Sport Model
  <select v-model="rSportModelId">
    <option v-for="[modelId, sportTitle] in sportsMap" :key="modelId" :value="modelId">{{ sportTitle }}</option>
  </select>
  <p>Title &nbsp;<input type="text" v-model="rTitle"></p>
  <p>Description<textarea rows="5" cols="33" v-model="rDescription"></textarea></p>
  <p>Calories &nbsp;<input type="text" v-model="rKcal"></p>
  <p>Duration &nbsp;<input type="text" v-model="rDuration"></p>
  <p>
    Aerobic
    <select v-model="rAerobic">
      <option v-for="val in selectValues" :key="val" :value="val">{{ val }}</option>
    </select>
  </p>
  <p>
    Aaerobic
    <select v-model="rAnaerobic">
      <option v-for="val in selectValues" :key="val" :value="val">{{ val }}</option>
    </select>
  </p>
  <p>
    benefit
    <select v-model="rBenefit">
      <option v-for="possibleBenefit in benefits" :key="possibleBenefit" :value="possibleBenefit">{{ possibleBenefit }}
      </option>
    </select>
  </p>
  <p><button @click="addSportEntry()">{{ mode == 'update' ? "Upate Entry" : "Add Entry" }}</button></p>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useDailyStore } from '@/dailyStore';

export default {
  props: {
    mode: null,
    entryId: null,
    date: Date,
    title: String,
    description: String,
    kcal: Number,
    duration: Number,
    aerobic: Number,
    anaerobic: Number,
    benefit: String,
    sportModelId: null

  },
  emits: ["onAddSportEntry"],
  setup(props, { emit }) {

    const dailyStore = useDailyStore();

    let sportsMap = ref(new Map());
    const benefits = ['base', 'anaerobie', 'sprint', 'tempo', 'vo2max'];

    const rTitle = ref(props.title);
    const rDescription = ref(props.description);
    const rKcal = ref(props.kcal);
    const rDuration = ref(props.duration);
    const rAerobic = ref(props.aerobic);
    const rAnaerobic = ref(props.anaerobic);
    const rBenefit = ref(props.benefit);
    const rSportModelId = ref(props.sportModelId);
    const selectValues = ref([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9,
      1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9,
      2.0, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9,
      3.0, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9,
      4.0, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9]);


    function getModels() {
      console.log('getModels sport');
      fetch(process.env.VUE_APP_URL + '/model/sport', {
          method: 'GET',
          headers: {
            'Authorization' : 'Bearer ' + localStorage.getItem("token"),
          }
        })
        .then(response => response.json())
        .then(json => {
          json.forEach(sport => {
            console.log('stringify' + JSON.stringify(sport));
            sportsMap.value.set(sport.id, sport.title);
          });
        })
    }

    function addSportEntry() {
      console.log("entry Id " + props.entryId);
      let fetchMethod = "";
      let fetchURL = "";
      let bodyToAdd = {};

      if (props.entryId) {
        fetchURL = process.env.VUE_APP_URL + '/entry/' + props.entryId + '/sport'
        console.log(fetchURL);
        fetchMethod = 'PUT';
        bodyToAdd = {
          id: props.entryId,
          title: rTitle.value,
          description: rDescription.value,
          kcal: rKcal.value,
          duration: rDuration.value,
          aerobic: rAerobic.value,
          anaerobic: rAnaerobic.value,
          benefit: rBenefit.value,
        };
      }
      else {
        fetchURL = process.env.VUE_APP_URL + '/entry/sport';
        fetchMethod = "POST";
        bodyToAdd = {
          title: rTitle.value,
          description: rDescription.value,
          kcal: rKcal.value,
          duration: rDuration.value,
          aerobic: rAerobic.value,
          anaerobic: rAnaerobic.value,
          benefit: rBenefit.value,
          modelId: rSportModelId.value,
          date: props.date
        };
      }

      console.log(JSON.stringify(bodyToAdd));

      fetch(fetchURL, {
        method: fetchMethod,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization' : 'Bearer ' + localStorage.getItem("token"),
        },
        body: JSON.stringify(bodyToAdd),
      })
        .then(response => response.json())
        .then(json => {
          dailyStore.errorMessage = json.message;
          emit('onAddSportEntry', bodyToAdd);
        });
    }

    return {
      rTitle,
      rDescription,
      rKcal,
      rDuration,
      rAerobic,
      rAnaerobic,
      rBenefit,
      rSportModelId,
      selectValues,

      addSportEntry,
      getModels,

      sportsMap,
      benefits
    }
  },

  mounted() {
    console.log('onMounted');
    this.getModels();
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