import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDailyStore = defineStore('dailystore', () => {

      const errorMessage = ref('');
      function increment() {

      }
      //const doubleCount = computed(() => count.value * 2)

      return { errorMessage, increment }
})