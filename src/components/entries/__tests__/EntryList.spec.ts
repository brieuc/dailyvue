import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import EntryList from '@/components/entries/EntryList.vue'
import FoodEntryCard from '@/components/entries/FoodEntryCard.vue'
import FreeEntryCard from '@/components/entries/FreeEntryCard.vue'
import SportEntryCard from '@/components/entries/SportEntryCard.vue'
import type { DayEntry } from '@/types/entries'

const DATE = '2026-01-05'
const entries = [
  { id: 's1', version: 0, title: 'Vélo', date: DATE, modelId: 'sm1', type: 'SPORT' },
  { id: 'f1', version: 0, title: 'Notes', date: DATE, modelId: 'fm1', type: 'FREE' },
  { id: 'e1', version: 0, title: 'Pizza', date: DATE, modelId: 'm1', model: { id: 'm1', kcal: 800 }, quantity: 2, type: 'FOOD' },
] as DayEntry[]

const buttons = (wrapper: ReturnType<typeof mount>, label: string) =>
  wrapper.findAll('button').filter((item) => item.text() === label)

describe('EntryList', () => {
  it('affiche chaque entrée avec la carte de son type', () => {
    const wrapper = mount(EntryList, { props: { entries } })

    expect(wrapper.getComponent(SportEntryCard).props('entry')).toEqual(entries[0])
    expect(wrapper.getComponent(FreeEntryCard).props('entry')).toEqual(entries[1])
    expect(wrapper.getComponent(FoodEntryCard).text()).toContain('1600kcal')
  })

  it('émet les actions sans appeler l’API', async () => {
    const wrapper = mount(EntryList, { props: { entries } })

    await buttons(wrapper, 'Modifier')[0]?.trigger('click')
    await buttons(wrapper, 'Créer un modèle')[0]?.trigger('click')
    await buttons(wrapper, 'Supprimer')[2]?.trigger('click')

    expect(wrapper.emitted('edit')).toEqual([[entries[0]]])
    expect(wrapper.emitted('createModel')).toEqual([[entries[1]]])
    expect(wrapper.emitted('delete')).toEqual([[entries[2]]])
  })

  it('ne propose pas de modifier une entrée food', () => {
    const wrapper = mount(EntryList, { props: { entries } })

    expect(buttons(wrapper, 'Modifier')).toHaveLength(2)
  })

  it('affiche le slot edit à la place de l’entrée modifiée', () => {
    const wrapper = mount(EntryList, {
      props: { entries, editingEntryId: 'f1' },
      slots: { edit: '<template #edit="{ entry }"><p class="form">{{ entry.title }}</p></template>' },
    })

    expect(wrapper.get('.form').text()).toBe('Notes')
    expect(wrapper.findComponent(FreeEntryCard).exists()).toBe(false)
    expect(wrapper.text()).toContain('Vélo')
    expect(buttons(wrapper, 'Créer un modèle')).toHaveLength(0)
  })
})
