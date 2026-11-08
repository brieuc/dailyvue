
// src/composables/useEntries.js
import { useApi } from './useApi';
import { entryService } from '@/services/entries';
import { useDailyStore } from '@/dailyStore';

export function useEntries() {
  const { loading, execute } = useApi();
  const store = useDailyStore();

 // ✅ Cette méthode retourne déjà une Promise !
  const getEntriesWithModels = async (date) => {
    return execute(() => entryService.getByDate(date));
  };

  const createEntry = (data) => 
    execute(() => entryService.create(data), 'Entrée créée !');

  const updateEntry = (id, data) => 
    execute(() => entryService.update(id, data), 'Entrée mise à jour !');

  const deleteEntry = (id) => 
    execute(() => entryService.delete(id), 'Entrée supprimée !');

  const getSummary = (fromDate, toDate) => 
    execute(() => entryService.getSummary(fromDate, toDate));

  return {
    loading,
    getEntriesWithModels,
    createEntry,
    updateEntry, 
    deleteEntry,
    getSummary
  };
}