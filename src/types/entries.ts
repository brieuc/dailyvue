import type { EntryFoodDto, EntryFreeFoodDto, EntrySportDto } from '@/api/generated'

// Orval génère des unions non discriminées car `type` y est optionnel.
// Une entrée lue depuis l'API a toujours un id.
export type FoodEntry = EntryFoodDto & { id: string; type: 'FOOD' }
export type SportEntry = EntrySportDto & { id: string; type: 'SPORT' }
export type FreeEntry = EntryFreeFoodDto & { id: string; type: 'FREE' | 'FREE_FOOD' }

export type DayEntry = FoodEntry | SportEntry | FreeEntry

export type ModelCategory = 'food' | 'sport' | 'free'

/** "entering" : saisie d'entrées. "displaying" : détail des entrées du jour. */
export type DayMode = 'entering' | 'displaying'

export const isFoodEntry = (entry: DayEntry): entry is FoodEntry => entry.type === 'FOOD'

export const isSportEntry = (entry: DayEntry): entry is SportEntry => entry.type === 'SPORT'

export const isFreeEntry = (entry: DayEntry): entry is FreeEntry =>
  entry.type === 'FREE' || entry.type === 'FREE_FOOD'
