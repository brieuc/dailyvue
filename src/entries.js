import { ref, reactive } from "vue";
import { createOneDayItem } from "./oneday";
import { useDailyStore } from "./dailyStore";

export function useFetchOneDayItem(date) {
      const dailyStore = useDailyStore();
      const modelsMap = dailyStore.getModelsMap();
      const oneDayItem = reactive(createOneDayItem([], date, false, false));

      fetch(process.env.VUE_APP_URL + '/entry/' + date, {
            method: 'GET',
            headers: {
                  'Authorization' : 'Bearer ' + localStorage.getItem("token"),
            }
      })
      .then(response => response.json())
      .then(data => {
            oneDayItem.entries = data;      
            oneDayItem.entries.forEach(e => {
                  e.model = modelsMap.value.get(e.modelId);
            });
      })      
      return { oneDayItem };
}
