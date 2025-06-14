import { ref, reactive } from "vue";
import { createOneDayItem } from "./oneday";

export function useFetchOneDayItem(date) {
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
      })      
      return { oneDayItem };
}
