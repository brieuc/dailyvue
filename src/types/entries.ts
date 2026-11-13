import type {
  EntryFoodDto,
  EntryFreeFoodDto,
  EntryFreeFoodDtoAllOfFoodType,
  EntrySportDto,
  EntrySportDtoAllOfBenefit,
  ModelSportDtoAllOfSport,
} from '@/api/generated'

// Orval génère des unions non discriminées car `type` y est optionnel.
// Une entrée lue depuis l'API a toujours un id.
export type FoodEntry = EntryFoodDto & { id: string; type: 'FOOD' }
export type SportEntry = EntrySportDto & { id: string; type: 'SPORT' }
export type FreeEntry = EntryFreeFoodDto & { id: string; type: 'FREE' | 'FREE_FOOD' }

export type DayEntry = FoodEntry | SportEntry | FreeEntry

/** Entrée saisie par formulaire, donc modifiable. Une entrée food se règle par sa quantité. */
export type EditableEntry = SportEntry | FreeEntry

export type ModelCategory = 'food' | 'sport' | 'free'

/** Catégorie saisie par formulaire. */
export type FormCategory = Exclude<ModelCategory, 'food'>

export const isFoodEntry = (entry: DayEntry): entry is FoodEntry => entry.type === 'FOOD'

export const isSportEntry = (entry: DayEntry): entry is SportEntry => entry.type === 'SPORT'

export const isFreeEntry = (entry: DayEntry): entry is FreeEntry =>
  entry.type === 'FREE' || entry.type === 'FREE_FOOD'

export const isEditableEntry = (entry: DayEntry): entry is EditableEntry => !isFoodEntry(entry)

export const entryCategory = (entry: DayEntry): ModelCategory =>
  isFoodEntry(entry) ? 'food' : isSportEntry(entry) ? 'sport' : 'free'

export const FOOD_TYPE_LABELS: Record<EntryFreeFoodDtoAllOfFoodType, string> = {
  MEAL: 'Repas',
  JUNKFOOD: 'Junk food',
  CHOCO: 'Chocolat',
  ICECREAM: 'Glace',
  YOGHOURT: 'Yaourt',
  ALCOHOL: 'Alcool',
}

export const BENEFIT_LABELS: Record<EntrySportDtoAllOfBenefit, string> = {
  base: 'Base',
  tempo: 'Tempo',
  anaerobie: 'Anaérobie',
  vo2max: 'VO2max',
  sprint: 'Sprint',
}

export const SPORT_LABELS: Record<ModelSportDtoAllOfSport, string> = {
  RUNNING: 'Course',
  CYCLING: 'Vélo',
  BIKE: 'VTT',
  SWIMMING: 'Natation',
  HIKING: 'Randonnée',
  BOXING: 'Boxe',
  HIIT: 'HIIT',
  STREET_WORKOUT: 'Street workout',
  SKATE: 'Skate',
  SQUASH: 'Squash',
  FREE: 'Libre',
}
