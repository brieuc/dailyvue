import { ref } from 'vue'
export function useOnePeriodItem(date, loaded) {

      const startDate = new Date(date);
      console.log("loaded " + loaded);

      const hasBeenLoaded = ref(loaded);
      console.log("loaded ref " + hasBeenLoaded.value);

      return {
            startDate,
            hasBeenLoaded
      }
}