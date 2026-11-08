import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as api from '@/api/generated'
import { useEntries } from '@/composables/useEntries'
import { useModels } from '@/composables/useModels'
import { useNotification } from '@/composables/useNotification'
import { PERIOD_DAYS, usePeriods } from '@/composables/usePeriods'
import { useSummary } from '@/composables/useSummary'

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
  usePeriods().resetPeriods()
  useNotification().clear()
})

describe('useModels', () => {
  it('ne charge les modèles qu’une fois et partage l’état', async () => {
    mockModels()
    await useModels().fetchModels()
    await useModels().fetchModels()
    expect(api.getFoodModels).toHaveBeenCalledTimes(1)
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
    await usePeriods().fetchPeriods()
    expect(api.getRelevantDates).toHaveBeenCalledWith('2026-01-05', { numberOfDays: PERIOD_DAYS })
    expect(usePeriods().periods.value.map((period) => period.loaded)).toEqual([
      true,
      true,
      true,
      true,
      false,
    ])
  })

  it('ne recharge pas une seconde fois', async () => {
    mockDates(['a'])
    await usePeriods().fetchPeriods()
    await usePeriods().fetchPeriods()
    expect(api.getFirstDate).toHaveBeenCalledTimes(1)
  })

  it('gère un compte sans entrée', async () => {
    vi.mocked(api.getFirstDate).mockResolvedValue(ok([]))
    await usePeriods().fetchPeriods()
    expect(api.getRelevantDates).not.toHaveBeenCalled()
    expect(usePeriods().periods.value).toEqual([])
  })

  it('peut tout marquer comme chargé', async () => {
    mockDates(['a', 'b', 'c', 'd', 'e'])
    await usePeriods().fetchPeriods()
    usePeriods().loadAllPeriods()
    expect(usePeriods().periods.value.every((period) => period.loaded)).toBe(true)
  })

  it('vide les périodes au reset', async () => {
    mockDates(['a'])
    await usePeriods().fetchPeriods()
    usePeriods().resetPeriods()
    expect(usePeriods().periods.value).toEqual([])
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

  it('garde la réponse la plus récente quand deux chargements se croisent', async () => {
    let resolveSlow: (value: never) => void = () => {}
    vi.mocked(api.getEntries)
      .mockReturnValueOnce(new Promise((resolve) => { resolveSlow = resolve as never }))
      .mockResolvedValueOnce(ok([entry]))
    const { entries, fetchEntries } = useEntries()
    const slow = fetchEntries('d')
    await fetchEntries('d')
    resolveSlow(ok([]))
    await slow
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
