import { ref } from 'vue'

export function createModelFree(modelId, modelTitle, modelDescription) {
      let id = modelId;
      let title = modelTitle;
      let description = modelDescription;

      return {id, title, description}
}