// src/composables/useModels.js
import { onMounted } from 'vue';
import { useApi } from './useApi.js';
import { modelService } from '@/services/models.js';
import { useDailyStore } from '@/dailyStore.js';

export function useModels() {
  const { loading, execute } = useApi();
  const store = useDailyStore();

  const loadAllModels = async () => {
    const [food, sport, free] = await Promise.all([
      execute(() => modelService.getFoodModels()),
      execute(() => modelService.getSportModels()),
      execute(() => modelService.getFreeModels())
    ]);

    // Vider et remplir les stores
    store.foodModels.splice(0, store.foodModels.length, ...food);
    store.sportModels.splice(0, store.sportModels.length, ...sport);
    store.freeModels.splice(0, store.freeModels.length, ...free);
  };

  const createFoodModelFromEntry = async (entry) => {
    const newModel = await execute(
      () => modelService.createFromEntry(entry),
      'Modèle créé !'
    );
    store.foodModels.push(newModel);
    return newModel;
  };

  // Auto-load au montage
  onMounted(loadAllModels);

  return {
    loading,
    loadAllModels,
    createFoodModelFromEntry
  };
}