import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as api from '@/api/generated'
import DayView from '@/components/days/DayView.vue'
import FoodModelRow from '@/components/entries/FoodModelRow.vue'
import ModalDialog from '@/components/ModalDialog.vue'
import { useModels } from '@/composables/useModels'

vi.mock('@/api/generated', () => ({
  EntryFreeFoodDtoAllOfFoodType: {},
  createEntry: vi.fn(),
  deleteEntry: vi.fn(),
  getEntries: vi.fn(),
  getSummaryInfo: vi.fn(),
  updateEntry: vi.fn(),
}))

const DATE = '2026-01-05'
// Le modal est téléporté dans <body> : on le garde dans le wrapper pour l'inspecter.
const mountDay = (props: Record<string, unknown> = {}) =>
  mount(DayView, { props: { date: DATE, ...props }, global: { stubs: { teleport: true } } })

const ok = <T>(data: T) => ({ data, status: 200, headers: new Headers() }) as never

const foodEntry = (version: number, quantity: number) => ({
  id: 'e1',
  version,
  quantity,
  title: 'Pizza',
  date: DATE,
  modelId: 'm1',
  model: { id: 'm1', kcal: 800 },
  type: 'FOOD',
})

const sportEntry = (version: number, title: string) => ({
  id: 's1',
  version,
  title,
  date: DATE,
  modelId: 'sm1',
  type: 'SPORT',
})

const openEditForm = async () => {
  const wrapper = mountDay({ expanded: true })
  await flushPromises()
  await clickButton(wrapper, 'Modifier')
  return wrapper
}

const openModal = async () => {
  const wrapper = mountDay()
  await flushPromises()
  await wrapper.get('.add').trigger('click')
  return wrapper
}

const clickFoodPlus = async (wrapper: ReturnType<typeof mount>) => {
  await wrapper.getComponent(FoodModelRow).get('[aria-label="Ajouter"]').trigger('click')
  await flushPromises()
}

const clickButton = async (wrapper: ReturnType<typeof mount>, label: string) => {
  const button = wrapper.findAll('button').find((item) => item.text() === label)
  await button?.trigger('click')
  await flushPromises()
}

// Clic sur « Ajouter » / « Enregistrer » ou touche Entrée : le formulaire émet submit.
const submitForm = async (wrapper: ReturnType<typeof mount>) => {
  await wrapper.get('form').trigger('submit')
  await flushPromises()
}

beforeEach(() => {
  vi.clearAllMocks()
  useModels().resetModels()
  useModels().foodModels.value = [{ id: 'm1', title: 'Pizza', kcal: 800 } as never]
  vi.mocked(api.getSummaryInfo).mockResolvedValue(ok({}))
})

describe('DayView', () => {
  it('n’affiche le bouton « + » qu’une fois les entrées chargées', async () => {
    let resolveEntries: (value: never) => void = () => {}
    vi.mocked(api.getEntries).mockReturnValue(
      new Promise((resolve) => {
        resolveEntries = resolve as never
      }),
    )
    const wrapper = mountDay()
    await flushPromises()
    expect(wrapper.find('.add').exists()).toBe(false)

    resolveEntries(ok([]))
    await flushPromises()
    expect(wrapper.find('.add').exists()).toBe(true)
  })

  it('modifie l’entrée déjà saisie au lieu d’en créer une autre', async () => {
    vi.mocked(api.getEntries).mockResolvedValue(ok([foodEntry(3, 2)]))
    vi.mocked(api.updateEntry).mockResolvedValue(ok(foodEntry(4, 3)))
    const wrapper = await openModal()

    await clickFoodPlus(wrapper)

    expect(api.createEntry).not.toHaveBeenCalled()
    expect(api.updateEntry).toHaveBeenCalledWith(
      'e1',
      expect.objectContaining({ version: 3, quantity: 3 }),
    )
  })

  it('réutilise la version renvoyée par l’API au « + » suivant, sans recharger', async () => {
    vi.mocked(api.getEntries).mockResolvedValue(ok([]))
    vi.mocked(api.createEntry).mockResolvedValue(ok(foodEntry(0, 1)))
    vi.mocked(api.updateEntry).mockResolvedValue(ok(foodEntry(1, 2)))
    const wrapper = await openModal()

    await clickFoodPlus(wrapper)
    await clickFoodPlus(wrapper)

    expect(api.createEntry).toHaveBeenCalledTimes(1)
    expect(api.updateEntry).toHaveBeenCalledWith(
      'e1',
      expect.objectContaining({ version: 0, quantity: 2 }),
    )
    expect(api.getEntries).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted('entriesChanged')).toHaveLength(2)
  })

  it('garde le modal ouvert après un « + » réussi', async () => {
    vi.mocked(api.getEntries).mockResolvedValue(ok([]))
    vi.mocked(api.createEntry).mockResolvedValue(ok(foodEntry(0, 1)))
    const wrapper = await openModal()

    await clickFoodPlus(wrapper)

    expect(wrapper.findComponent(ModalDialog).exists()).toBe(true)
    expect(wrapper.findComponent(FoodModelRow).exists()).toBe(true)
  })

  it('ne signale aucun changement quand l’écriture échoue', async () => {
    vi.mocked(api.getEntries).mockResolvedValue(ok([]))
    vi.mocked(api.createEntry).mockRejectedValue(new Error('boom'))
    const wrapper = await openModal()

    await clickFoodPlus(wrapper)

    expect(wrapper.emitted('entriesChanged')).toBeUndefined()
  })

  it('ouvre le formulaire de modification à la place de l’entrée', async () => {
    vi.mocked(api.getEntries).mockResolvedValue(ok([sportEntry(2, 'Vélo')]))
    const wrapper = await openEditForm()

    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
    expect(wrapper.findAll('button').some((item) => item.text() === 'Enregistrer')).toBe(true)
  })

  it('referme le formulaire de modification après un enregistrement réussi', async () => {
    vi.mocked(api.getEntries).mockResolvedValue(ok([sportEntry(2, 'Vélo')]))
    vi.mocked(api.updateEntry).mockResolvedValue(ok(sportEntry(3, 'Vélo')))
    const wrapper = await openEditForm()

    await submitForm(wrapper)

    expect(api.updateEntry).toHaveBeenCalledWith('s1', expect.objectContaining({ version: 2 }))
    expect(wrapper.findAll('button').some((item) => item.text() === 'Enregistrer')).toBe(false)
    expect(wrapper.findAll('button').some((item) => item.text() === 'Modifier')).toBe(true)
  })

  it('garde le formulaire de modification ouvert quand l’écriture échoue', async () => {
    vi.mocked(api.getEntries).mockResolvedValue(ok([sportEntry(2, 'Vélo')]))
    vi.mocked(api.updateEntry).mockRejectedValue(new Error('boom'))
    const wrapper = await openEditForm()

    await submitForm(wrapper)

    expect(wrapper.findAll('button').some((item) => item.text() === 'Enregistrer')).toBe(true)
  })

  it('abandonne la modification quand on referme le détail', async () => {
    vi.mocked(api.getEntries).mockResolvedValue(ok([sportEntry(2, 'Vélo')]))
    const wrapper = await openEditForm()

    await wrapper.setProps({ expanded: false })
    await wrapper.setProps({ expanded: true })

    expect(wrapper.findAll('button').some((item) => item.text() === 'Enregistrer')).toBe(false)
  })

  it('ouvre le modal sur la saisie food', async () => {
    vi.mocked(api.getEntries).mockResolvedValue(ok([]))
    const wrapper = await openModal()

    expect(wrapper.getComponent(ModalDialog).props('title')).toBe('Lundi 5 janv.')
    expect(wrapper.findComponent(FoodModelRow).exists()).toBe(true)
  })

  it('ne déplie pas le jour quand on clique sur « + »', async () => {
    vi.mocked(api.getEntries).mockResolvedValue(ok([]))
    const wrapper = await openModal()

    expect(wrapper.emitted('update:expanded')).toBeUndefined()
  })

  it('ferme le modal après une création réussie par formulaire', async () => {
    vi.mocked(api.getEntries).mockResolvedValue(ok([]))
    vi.mocked(api.createEntry).mockResolvedValue(ok(sportEntry(0, 'Vélo')))
    const wrapper = await openModal()

    await clickButton(wrapper, 'Sport')
    await submitForm(wrapper)

    expect(api.createEntry).toHaveBeenCalledWith(expect.objectContaining({ type: 'SPORT', date: DATE }))
    expect(wrapper.findComponent(ModalDialog).exists()).toBe(false)
    expect(wrapper.text()).toContain('Vélo')
  })

  it('garde le modal ouvert quand la création échoue', async () => {
    vi.mocked(api.getEntries).mockResolvedValue(ok([]))
    vi.mocked(api.createEntry).mockRejectedValue(new Error('boom'))
    const wrapper = await openModal()

    await clickButton(wrapper, 'Sport')
    await submitForm(wrapper)

    expect(wrapper.findComponent(ModalDialog).exists()).toBe(true)
  })

  it('ferme le modal avec le bouton ×', async () => {
    vi.mocked(api.getEntries).mockResolvedValue(ok([]))
    const wrapper = await openModal()

    await wrapper.get('[aria-label="Fermer"]').trigger('click')

    expect(wrapper.findComponent(ModalDialog).exists()).toBe(false)
  })

  it('affiche la quantité saisie dans la liste food', async () => {
    vi.mocked(api.getEntries).mockResolvedValue(ok([foodEntry(3, 2)]))
    const wrapper = await openModal()

    expect(wrapper.getComponent(FoodModelRow).props('quantity')).toBe(2)
  })

  it('annule une modification sans rien enregistrer', async () => {
    vi.mocked(api.getEntries).mockResolvedValue(ok([sportEntry(2, 'Vélo')]))
    const wrapper = await openEditForm()

    await clickButton(wrapper, 'Annuler')

    expect(api.updateEntry).not.toHaveBeenCalled()
    expect(wrapper.findAll('button').some((item) => item.text() === 'Modifier')).toBe(true)
  })
})
