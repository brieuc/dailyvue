import { ref } from 'vue'
import {
  createModel,
  getFoodModels,
  getFreeModels,
  getSportModels,
  type EntryFreeFoodDto,
  type ModelFoodDto,
  type ModelFreeDto,
  type ModelSportDto,
} from '@/api/generated'
import { LOAD_ERROR, useNotification } from '@/composables/useNotification'

const foodModels = ref<ModelFoodDto[]>([])
const sportModels = ref<ModelSportDto[]>([])
const freeModels = ref<ModelFreeDto[]>([])
// Incrémenté au reset : une réponse arrivée après une déconnexion est ignorée.
let session = 0

type FoodModelSource = Pick<EntryFreeFoodDto, 'title' | 'description' | 'kcal' | 'foodType'>

export function useModels() {
  const { run } = useNotification()

  const fetchModels = async () => {
    const currentSession = session
    const responses = await run(
      () => Promise.all([getFoodModels(), getSportModels(), getFreeModels()]),
      { error: LOAD_ERROR },
    )
    if (!responses || currentSession !== session) return
    const [food, sport, free] = responses
    foodModels.value = food.data as ModelFoodDto[]
    sportModels.value = sport.data as ModelSportDto[]
    freeModels.value = free.data as ModelFreeDto[]
  }

  const addFoodModelFromEntry = async (entry: FoodModelSource) => {
    const response = await run(
      () =>
        createModel({
          title: entry.title,
          description: entry.description,
          kcal: entry.kcal,
          foodType: entry.foodType,
          type: 'FOOD',
        }),
      { success: 'Modèle créé !' },
    )
    const model = response?.data as ModelFoodDto | undefined
    if (model) foodModels.value.push(model)
    return model
  }

  const resetModels = () => {
    session++
    foodModels.value = []
    sportModels.value = []
    freeModels.value = []
  }

  return { foodModels, sportModels, freeModels, fetchModels, addFoodModelFromEntry, resetModels }
}
