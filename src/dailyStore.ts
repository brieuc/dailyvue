import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDailyStore = defineStore('dailystore', () => {


      const foodModels = ref([]);
      const sportModels = ref([]);
      const freeModels = ref([]);
      const errorMessage = ref('');

      errorMessage.value = "";
      
      function getModelsMap() {
            const modelsMap = ref(new Map());
            sportModels.value.forEach(s => {
                  modelsMap.value.set(s.id, s);
            });
            foodModels.value.forEach(f => {
                  modelsMap.value.set(f.id, f);
            });
            freeModels.value.forEach(f => {
                  modelsMap.value.set(f.id, f);
            });
            return modelsMap;
      }
      //const doubleCount = computed(() => count.value * 2)

      return { errorMessage, foodModels, sportModels, freeModels, getModelsMap }
})