import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as api from '@/api/generated'
import { useEntries } from '@/composables/useEntries'
import { useModels } from '@/composables/useModels'
import { LOAD_ERROR, useNotification } from '@/composables/useNotification'
import { usePeriods } from '@/composables/usePeriods'
import { useSummary } from '@/composables/useSummary'
import { PERIOD_DAYS } from '@/utils/dates'

vi.mock('@/api/generated', () => ({
  createEntry: vi.fn(),
  createModel: vi.fn(),
  deleteEntry: vi.fn(),
  getEntries: vi.fn(),
  getFirstDate: vi.fn(),
  getFoodModels: vi.fn(),
  getFreeModels: vi.fn(),
  getRelevantDates: vi.fn(),
  getSportModels: vi.fn(),
  getSummaryInfo: vi.fn(),
  updateEntry: vi.fn(),
}))

const ok = <T>(data: T) => ({ data, status: 200, headers: new Headers() }) as never

const mockModels = () => {
  vi.mocked(api.getFoodModels).mockResolvedValue(ok([{ id: 'f', type: 'FOOD' }]))
  vi.mocked(api.getSportModels).mockResolvedValue(ok([{ id: 's', type: 'SPORT' }]))
  vi.mocked(api.getFreeModels).mockResolvedValue(ok([{ id: 'l', type: 'FREE' }]))
}

beforeEach(() => {
  vi.clearAllMocks()
  useModels().resetModels()
  useNotification().clear()
})

describe('useModels', () => {
  it('partage l’état entre les appels', async () => {
    mockModels()
    await useModels().fetchModels()
    expect(useModels().foodModels.value).toHaveLength(1)
  })

  it('recharge après un reset', async () => {
    mockModels()
    await useModels().fetchModels()
    useModels().resetModels()
    expect(useModels().sportModels.value).toEqual([])
    await useModels().fetchModels()
    expect(api.getFoodModels).toHaveBeenCalledTimes(2)
  })

  it('ignore une réponse reçue après un reset', async () => {
    mockModels()
    const pending = useModels().fetchModels()
    useModels().resetModels()
    await pending
    expect(useModels().foodModels.value).toEqual([])
  })

  it('reste rechargeable après un échec', async () => {
    mockModels()
    vi.mocked(api.getFoodModels).mockRejectedValueOnce(new Error('boom'))
    await useModels().fetchModels()
    expect(useNotification().message.value).toBe('Erreur lors du chargement des données')
    await useModels().fetchModels()
    expect(useModels().foodModels.value).toHaveLength(1)
  })

  it('ajoute le modèle créé depuis une entrée', async () => {
    vi.mocked(api.createModel).mockResolvedValue(ok({ id: 'new', type: 'FOOD' }))
    await useModels().addFoodModelFromEntry({ title: 'Pizza', kcal: 800, foodType: 'MEAL' })
    expect(api.createModel).toHaveBeenCalledWith({
      title: 'Pizza',
      description: undefined,
      kcal: 800,
      foodType: 'MEAL',
      type: 'FOOD',
    })
    expect(useModels().foodModels.value[0]?.id).toBe('new')
    expect(useNotification().message.value).toBe('Modèle créé !')
  })
})

describe('usePeriods', () => {
  const mockDates = (dates: string[]) => {
    vi.mocked(api.getFirstDate).mockResolvedValue(ok(['2026-01-05']))
    vi.mocked(api.getRelevantDates).mockResolvedValue(ok(dates))
  }

  it('charge les 4 premières périodes seulement', async () => {
    mockDates(['a', 'b', 'c', 'd', 'e'])
    const { periods, fetchPeriods } = usePeriods()
    await fetchPeriods()
    expect(api.getRelevantDates).toHaveBeenCalledWith('2026-01-05', { numberOfDays: PERIOD_DAYS })
    expect(periods.value.map((period) => period.loaded)).toEqual([
      true,
      true,
      true,
      true,
      false,
    ])
  })

  it('a un état propre à chaque appel', async () => {
    mockDates(['a'])
    const first = usePeriods()
    await first.fetchPeriods()
    expect(first.periods.value).toHaveLength(1)
    expect(usePeriods().periods.value).toEqual([])
  })

  it('gère un compte sans entrée', async () => {
    vi.mocked(api.getFirstDate).mockResolvedValue(ok([]))
    const { periods, fetchPeriods } = usePeriods()
    await fetchPeriods()
    expect(api.getRelevantDates).not.toHaveBeenCalled()
    expect(periods.value).toEqual([])
  })

  it('peut tout marquer comme chargé', async () => {
    mockDates(['a', 'b', 'c', 'd', 'e'])
    const { periods, fetchPeriods, loadAllPeriods } = usePeriods()
    await fetchPeriods()
    loadAllPeriods()
    expect(periods.value.every((period) => period.loaded)).toBe(true)
  })
})

describe('useEntries', () => {
  const DAY = '2026-01-05'
  const entry = { title: 'x', modelId: 'm', type: 'FREE' as const }
  const stored = (id: string, version = 0) => ({ ...entry, date: DAY, id, version })

  it('a un état propre à chaque appel', async () => {
    vi.mocked(api.getEntries).mockResolvedValue(ok([stored('1')]))
    const first = useEntries(DAY)
    const second = useEntries(DAY)
    await first.fetchEntries()
    expect(api.getEntries).toHaveBeenCalledWith(DAY)
    expect(first.entries.value).toHaveLength(1)
    expect(second.entries.value).toEqual([])
  })

  it('indique que les entrées sont chargées seulement après un succès', async () => {
    vi.mocked(api.getEntries).mockRejectedValueOnce(new Error('boom'))
    vi.mocked(api.getEntries).mockResolvedValueOnce(ok([stored('1')]))
    const { loaded, fetchEntries } = useEntries(DAY)
    await fetchEntries()
    expect(loaded.value).toBe(false)
    expect(useNotification().message.value).toBe(LOAD_ERROR)
    await fetchEntries()
    expect(loaded.value).toBe(true)
  })

  it('crée une entrée sans id à la date du jour', async () => {
    vi.mocked(api.createEntry).mockResolvedValue(ok(stored('1')))
    const { entries, saveEntry } = useEntries(DAY)
    const saved = await saveEntry(entry)
    expect(api.createEntry).toHaveBeenCalledWith({ ...entry, date: DAY })
    expect(saved?.id).toBe('1')
    expect(entries.value.map((item) => item.id)).toEqual(['1'])
    expect(useNotification().message.value).toBe('Entrée créée !')
  })

  it('met à jour une entrée avec id et la remplace par la réponse de l’API', async () => {
    vi.mocked(api.getEntries).mockResolvedValue(ok([stored('1'), stored('2')]))
    vi.mocked(api.updateEntry).mockResolvedValue(ok(stored('1', 1)))
    const { entries, fetchEntries, saveEntry } = useEntries(DAY)
    await fetchEntries()
    await saveEntry({ ...entry, id: '1', version: 0 })
    expect(api.updateEntry).toHaveBeenCalledWith('1', { ...entry, id: '1', version: 0, date: DAY })
    expect(entries.value.map((item) => [item.id, item.version])).toEqual([
      ['1', 1],
      ['2', 0],
    ])
  })

  it('retire l’entrée supprimée de la liste, même avec un corps vide', async () => {
    vi.mocked(api.getEntries).mockResolvedValue(ok([stored('1')]))
    vi.mocked(api.deleteEntry).mockResolvedValue(ok(undefined))
    const { entries, fetchEntries, removeEntry } = useEntries(DAY)
    await fetchEntries()
    await expect(removeEntry('1')).resolves.toBe(true)
    expect(entries.value).toEqual([])
  })

  it('laisse la liste intacte et notifie l’erreur quand une écriture échoue', async () => {
    vi.mocked(api.getEntries).mockResolvedValue(ok([stored('1')]))
    vi.mocked(api.updateEntry).mockRejectedValue(new Error('HTTP 409: Conflict'))
    vi.mocked(api.deleteEntry).mockRejectedValue(new Error('nope'))
    const { entries, fetchEntries, saveEntry, removeEntry } = useEntries(DAY)
    await fetchEntries()
    await expect(saveEntry({ ...entry, id: '1' })).resolves.toBeUndefined()
    expect(useNotification().message.value).toBe('HTTP 409: Conflict')
    await expect(removeEntry('1')).resolves.toBe(false)
    expect(entries.value).toHaveLength(1)
  })

  describe('quantités food', () => {
    const model = { id: 'm1', title: 'Pizza', description: 'Margherita', kcal: 800, type: 'FOOD' as const }
    const food = (version: number, quantity: number) => ({
      id: 'e1',
      version,
      quantity,
      title: 'Ma pizza',
      date: DAY,
      modelId: 'm1',
      model,
      type: 'FOOD',
    })

    it('donne la quantité saisie par modèle', async () => {
      vi.mocked(api.getEntries).mockResolvedValue(ok([food(0, 2), stored('2')]))
      const { foodQuantities, fetchEntries } = useEntries(DAY)
      await fetchEntries()
      expect([...foodQuantities.value]).toEqual([['m1', 2]])
    })

    it('crée l’entrée depuis le modèle au premier ajout', async () => {
      vi.mocked(api.getEntries).mockResolvedValue(ok([]))
      vi.mocked(api.createEntry).mockResolvedValue(ok(food(0, 1)))
      const { fetchEntries, setFoodQuantity } = useEntries(DAY)
      await fetchEntries()
      await setFoodQuantity(model, 1)
      expect(api.createEntry).toHaveBeenCalledWith({
        title: 'Pizza',
        description: 'Margherita',
        quantity: 1,
        modelId: 'm1',
        type: 'FOOD',
        date: DAY,
      })
    })

    it('met à jour l’entrée existante avec sa version et son titre', async () => {
      vi.mocked(api.getEntries).mockResolvedValue(ok([food(3, 2)]))
      vi.mocked(api.updateEntry).mockResolvedValue(ok(food(4, 1)))
      const { foodQuantities, fetchEntries, setFoodQuantity } = useEntries(DAY)
      await fetchEntries()
      await setFoodQuantity(model, 1)
      expect(api.createEntry).not.toHaveBeenCalled()
      expect(api.updateEntry).toHaveBeenCalledWith(
        'e1',
        expect.objectContaining({ id: 'e1', version: 3, quantity: 1, title: 'Ma pizza' }),
      )
      expect(foodQuantities.value.get('m1')).toBe(1)
    })
  })
})

describe('useSummary', () => {
  it('remplace les valeurs nulles par 0', async () => {
    vi.mocked(api.getSummaryInfo).mockResolvedValue(ok({ spentKcal: 120, aerobic: null }))
    const { summary, loaded, fetchSummary } = useSummary('a', 'b')
    await fetchSummary()
    expect(api.getSummaryInfo).toHaveBeenCalledWith({ fromDate: 'a', toDate: 'b' })
    expect(summary.value.spentKcal).toBe(120)
    expect(summary.value.aerobic).toBe(0)
    expect(summary.value.drinkingBeer).toBe(0)
    expect(loaded.value).toBe(true)
  })
})

describe('useNotification', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('efface un succès tout seul et garde une erreur', () => {
    const { message, notify, notifyError } = useNotification()
    notify('ok')
    vi.advanceTimersByTime(3000)
    expect(message.value).toBe('')

    notifyError(new Error('HTTP 500'))
    vi.advanceTimersByTime(10000)
    expect(message.value).toBe('HTTP 500')
  })

  it('ne laisse pas un ancien minuteur effacer le message suivant', () => {
    const { message, notify } = useNotification()
    notify('premier')
    vi.advanceTimersByTime(2000)
    notify('second', 'error')
    vi.advanceTimersByTime(2000)
    expect(message.value).toBe('second')
  })

  it('run renvoie undefined et notifie le message choisi en cas d’échec', async () => {
    const { message, run } = useNotification()
    await expect(run(() => Promise.reject(new Error('boom')), { error: LOAD_ERROR })).resolves.toBeUndefined()
    expect(message.value).toBe(LOAD_ERROR)
  })
})
