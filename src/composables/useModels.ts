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
import { useNotification } from '@/composables/useNotification'

const LOAD_ERROR = 'Erreur lors du chargement des données'

const foodModels = ref<ModelFoodDto[]>([])
const sportModels = ref<ModelSportDto[]>([])
const freeModels = ref<ModelFreeDto[]>([])
const loaded = ref(false)
// Incrémenté au reset : une réponse arrivée après une déconnexion est ignorée.
let session = 0

type FoodModelSource = Pick<EntryFreeFoodDto, 'title' | 'description' | 'kcal' | 'foodType'>

export function useModels() {
  const { notify, notifyError, clear } = useNotification()

  const fetchModels = async () => {
    if (loaded.value) return
    const currentSession = session
    try {
      const [food, sport, free] = await Promise.all([
        getFoodModels(),
        getSportModels(),
        getFreeModels(),
      ])
      if (currentSession !== session) return
      foodModels.value = food.data as ModelFoodDto[]
      sportModels.value = sport.data as ModelSportDto[]
      freeModels.value = free.data as ModelFreeDto[]
      loaded.value = true
    } catch {
      notify(LOAD_ERROR)
    }
  }

  const addFoodModelFromEntry = async (entry: FoodModelSource) => {
    clear()
    try {
      const { data } = await createModel({
        title: entry.title,
        description: entry.description,
        kcal: entry.kcal,
        foodType: entry.foodType,
        type: 'FOOD',
      })
      foodModels.value.push(data as ModelFoodDto)
      notify('Modèle créé !')
      return data as ModelFoodDto
    } catch (error) {
      notifyError(error)
      return undefined
    }
  }

  const resetModels = () => {
    session++
    foodModels.value = []
    sportModels.value = []
    freeModels.value = []
    loaded.value = false
  }

  return { foodModels, sportModels, freeModels, fetchModels, addFoodModelFromEntry, resetModels }
}
