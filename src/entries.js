import { ref, reactive } from "vue";
import { createOneDayItem } from "./oneday";
import { useDailyStore } from "./dailyStore";

export function useFetchOneDayItem(date) {
      const requestCount = ref(0);
      const receiveCount = ref(0);
      const dailyStore = useDailyStore();
      const modelsMap = dailyStore.getModelsMap();
      const oneDayItem = reactive(createOneDayItem([], date, false, false));

      requestCount.value = requestCount.value+1;
      fetch(process.env.VUE_APP_URL + '/entry/' + date, {
            method: 'GET',
            headers: {
                  'Authorization' : 'Bearer ' + localStorage.getItem("token"),
            }
      })
      .then(response => response.json())
      .then(data => {
            receiveCount.value = receiveCount.value+1;
            oneDayItem.entries = data;      
            oneDayItem.entries.forEach(e => {
                  e.model = modelsMap.value.get(e.modelId);
            });
      })    
        
      return { oneDayItem, requestCount, receiveCount };
}
