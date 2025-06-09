import { ref, reactive } from "vue";
import { useDailyStore } from "./dailyStore";
import { createOneDayItem } from "./oneday";

export function useFetchOneDayItem(date) {
      const oneDayItem = reactive(createOneDayItem([], date, false, false));
      const dailyStore = useDailyStore();
      const modelsMap = dailyStore.getModelsMap();

      fetch(process.env.VUE_APP_URL + '/entry/' + date, {
            method: 'GET',
            headers: {
                  'Authorization' : 'Bearer ' + localStorage.getItem("token"),
            }
            })
      .then(response => response.json())
      .then(data => {
            oneDayItem.entries = data;
            console.log(data);
            oneDayItem.entries.forEach(e => {
                  e.model = modelsMap.value.get(e.modelId);
            });
      })
                
      return { oneDayItem };
}
