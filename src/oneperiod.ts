import { ref } from 'vue'
export function useOnePeriodItem(date, loaded) {

      const startDate = new Date(date);
      const hasBeenLoaded = ref(loaded);

      return {
            startDate,
            hasBeenLoaded
      }
}