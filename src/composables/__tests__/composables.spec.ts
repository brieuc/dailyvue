import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as api from '@/api/generated'
import { useEntries } from '@/composables/useEntries'
import { useModels } from '@/composables/useModels'
import { useNotification } from '@/composables/useNotification'
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
  const entry = { title: 'x', date: '2026-01-05', modelId: 'm', type: 'FREE' as const }

  it('a un état propre à chaque appel', async () => {
    vi.mocked(api.getEntries).mockResolvedValue(ok([entry]))
    const first = useEntries()
    const second = useEntries()
    await first.fetchEntries('2026-01-05')
    expect(first.entries.value).toHaveLength(1)
    expect(second.entries.value).toEqual([])
  })

  it('indique que les entrées sont chargées seulement après un succès', async () => {
    vi.mocked(api.getEntries).mockRejectedValueOnce(new Error('boom'))
    vi.mocked(api.getEntries).mockResolvedValueOnce(ok([entry]))
    const { loaded, fetchEntries } = useEntries()
    await fetchEntries('d')
    expect(loaded.value).toBe(false)
    await fetchEntries('d')
    expect(loaded.value).toBe(true)
  })

  it('ajoute l’entrée créée à la liste', async () => {
    vi.mocked(api.createEntry).mockResolvedValue(ok({ ...entry, id: '1' }))
    const { entries, addEntry } = useEntries()
    await addEntry(entry)
    expect(entries.value.map((item) => item.id)).toEqual(['1'])
  })

  it('remplace l’entrée modifiée par la réponse de l’API', async () => {
    vi.mocked(api.getEntries).mockResolvedValue(
      ok([
        { ...entry, id: '1', version: 0 },
        { ...entry, id: '2', version: 0 },
      ]),
    )
    vi.mocked(api.updateEntry).mockResolvedValue(ok({ ...entry, id: '1', version: 1 }))
    const { entries, fetchEntries, editEntry } = useEntries()
    await fetchEntries('d')
    await editEntry('1', { ...entry, id: '1', version: 0 })
    expect(entries.value.map((item) => [item.id, item.version])).toEqual([
      ['1', 1],
      ['2', 0],
    ])
  })

  it('retire l’entrée supprimée de la liste', async () => {
    vi.mocked(api.getEntries).mockResolvedValue(ok([{ ...entry, id: '1' }]))
    vi.mocked(api.deleteEntry).mockResolvedValue(ok(undefined))
    const { entries, fetchEntries, removeEntry } = useEntries()
    await fetchEntries('d')
    await removeEntry('1')
    expect(entries.value).toEqual([])
  })

  it('laisse la liste intacte quand une écriture échoue', async () => {
    vi.mocked(api.getEntries).mockResolvedValue(ok([{ ...entry, id: '1' }]))
    vi.mocked(api.updateEntry).mockRejectedValue(new Error('HTTP 409: Conflict'))
    vi.mocked(api.deleteEntry).mockRejectedValue(new Error('nope'))
    const { entries, fetchEntries, editEntry, removeEntry } = useEntries()
    await fetchEntries('d')
    await editEntry('1', entry)
    await removeEntry('1')
    expect(entries.value).toHaveLength(1)
  })

  it('retourne l’entrée et notifie en cas de succès', async () => {
    vi.mocked(api.createEntry).mockResolvedValue(ok({ ...entry, id: '1' }))
    const saved = await useEntries().addEntry(entry)
    expect(saved?.id).toBe('1')
    expect(useNotification().message.value).toBe('Entrée créée !')
  })

  it('retourne undefined et notifie l’erreur en cas d’échec', async () => {
    vi.mocked(api.updateEntry).mockRejectedValue(new Error('HTTP 409: Conflict'))
    const saved = await useEntries().editEntry('1', entry)
    expect(saved).toBeUndefined()
    expect(useNotification().message.value).toBe('HTTP 409: Conflict')
  })

  it('confirme une suppression à corps vide', async () => {
    vi.mocked(api.deleteEntry).mockResolvedValue(ok(undefined))
    await expect(useEntries().removeEntry('1')).resolves.toBe(true)
  })

  it('signale une suppression en échec', async () => {
    vi.mocked(api.deleteEntry).mockRejectedValue(new Error('nope'))
    await expect(useEntries().removeEntry('1')).resolves.toBe(false)
  })
})

describe('useSummary', () => {
  it('remplace les valeurs nulles par 0', async () => {
    vi.mocked(api.getSummaryInfo).mockResolvedValue(ok({ spentKcal: 120, aerobic: null }))
    const { summary, fetchSummary } = useSummary()
    await fetchSummary('a', 'b')
    expect(api.getSummaryInfo).toHaveBeenCalledWith({ fromDate: 'a', toDate: 'b' })
    expect(summary.value.spentKcal).toBe(120)
    expect(summary.value.aerobic).toBe(0)
    expect(summary.value.drinkingBeer).toBe(0)
  })
})
