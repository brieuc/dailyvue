import { useDailyStore } from "./dailyStore";

export function createFoodModelFromEntity(entry) {
      const dailyStore = useDailyStore();
      const bodyToAdd = {
            "title": entry.title,
            "description": entry.description,
            "image": null,
            "foodType": entry.foodType,
            "kcal": entry.kcal
      };
      const fetchURL = process.env.VUE_APP_URL + '/model/food';
      fetch(fetchURL, {
            method: 'POST',
            headers: {
                  'Access-Control-Allow-Origin': '*',
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  'Authorization' : 'Bearer ' + localStorage.getItem("token"),
            },
            body: JSON.stringify(bodyToAdd),
      })
      .then(response => {
            //statusCode = response.status;
            return response.json()
      })
      .then(json => {
            dailyStore.errorMessage = "Model créé !"
      });
}