import { ref } from 'vue'

export function createModelSport(modelId, modelTitle, modelDescription, modelSport) {
      let id = modelId;
      let title = modelTitle;
      let description = modelDescription;
      let sport = modelSport;

      return {id, title, description, sport}
}