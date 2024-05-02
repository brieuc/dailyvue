<template>
  <p>sport</p>
  <select v-model="sportModelId">
    <option v-for="[modelId, sportTitle] in sportsMap" :key="modelId" :value="modelId">{{ sportTitle }}</option>
  </select>
  <p><input type="text" v-model="title"></p>
  <p><textarea v-model="description"></textarea></p>
  <p>Calories<input type="text" v-model="kcal"></p>
  <p>Duration<input type="text" v-model="duration"></p>
  Aerobic
  <select v-model="aerobic">
    <option v-for="val in selectValues" :key="val" :value="val">{{ val }}</option>
  </select>
  Aaerobic
  <select v-model="anaerobic">
    <option v-for="val in selectValues" :key="val" :value="val">{{ val }}</option>
  </select>
  <p>
    benefit
    <select v-model="benefit">
      <option v-for="possibleBenefit in benefits" :key="possibleBenefit" :value="possibleBenefit">{{ possibleBenefit }}
      </option>
    </select>
  </p>
  <p><button @click="addSportEntry()">Add Entry</button></p>
</template>

<script>
import { ref } from 'vue'

export default {
  props: {
    date: Date
  },
  emits: ["onAddSportEntry"],
  setup(props, { emit }) {

    let sportsMap = ref(new Map());
    const sportModelId = ref();
    const benefits = ['base', 'anaerobie', 'sprint', 'tempo'];

    const title = ref();
    const description = ref();
    const kcal = ref();
    const duration = ref();
    const aerobic = ref();
    const anaerobic = ref();
    const benefit = ref();
    const selectValues = ref([0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9,
      1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9,
      2.0, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9,
      3.0, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9,
      4.0, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9]);


    function getModels() {
      console.log('getModels sport');
      fetch(process.env.VUE_APP_URL + '/model/sport')
        .then(response => response.json())
        .then(json => {
          json.forEach(sport => {
            console.log('stringify' + JSON.stringify(sport));
            sportsMap.value.set(sport.id, sport.title);
          });
        })
    }

    function addSportEntry() {

      const bodyToAdd = {
        title: title.value,
        description: description.value,
        kcal: kcal.value,
        duration: duration.value,
        aerobic: aerobic.value,
        anaerobic: anaerobic.value,
        benefit: benefit.value,
        modelId: sportModelId.value,
        date: props.date
      };

      console.log(JSON.stringify(bodyToAdd));

      fetch(process.env.VUE_APP_URL + '/entry/sport', {
        method: 'POST',
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(bodyToAdd),
      })
        .then(response => response.json())
        .then(json => {
          emit('onAddSportEntry', bodyToAdd);
        });
    }

    return {
      title,
      description,
      kcal,
      duration,
      aerobic,
      anaerobic,
      benefit,
      selectValues,

      addSportEntry,
      getModels,

      sportsMap,
      sportModelId,
      benefits
    }
  },

  mounted() {
    console.log('onMounted');
    this.getModels();
  }
}

</script>