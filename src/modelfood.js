import { ref } from 'vue'

export function createModelFood(modelId, modelTitle, modelDescription, modelKcal, modelFoodType) {
      let id = modelId;
      let title = modelTitle;
      let description = modelDescription;
      let kcal = modelKcal;
      let foodType = modelFoodType;

      return {id, title, description, kcal, foodType}
}