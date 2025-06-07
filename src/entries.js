import { ref } from "vue";
import { useDailyStore } from "./dailyStore";

export async function useFetchEntries(date) {
      const entries = ref([]);
      const dailyStore = useDailyStore();
      const modelsMap = dailyStore.getModelsMap();
      
      if (date instanceof Date && !isNaN(date)) {
            entries.value = [];
      }
      else {
            const elements = await loadEntriesByDate(date);
            elements.forEach(e => {
                  entries.value.push(e);
            });
      }

      entries.value.forEach(e => {
            e.model = modelsMap.value.get(e.modelId);
      });

      return { entries };
}

async function loadEntriesByDate(sDate) {
      let entries = new Array();
      const response = await fetch(process.env.VUE_APP_URL + '/entry/' + sDate, {
		method: 'GET',
		headers: {
			'Authorization' : 'Bearer ' + localStorage.getItem("token"),
		}
	});
      if (response.ok) {
            const data = await response.json();
            data.forEach(async element => {
                  var count = entries.push(element);
            });
      }
      console.log("fini de récupérer les modls");
      return entries;
}
