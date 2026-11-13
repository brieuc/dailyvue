import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ChoiceChips from '@/components/ChoiceChips.vue'
import ErrorView from '@/components/ErrorView.vue'
import IntensitySlider from '@/components/entries/IntensitySlider.vue'
import { useNotification } from '@/composables/useNotification'

const OPTIONS = [
  { value: 'base', label: 'Base' },
  { value: 'tempo', label: 'Tempo' },
]

describe('ChoiceChips', () => {
  it('sélectionne une valeur, puis la désélectionne au second clic', async () => {
    const wrapper = mount(ChoiceChips, { props: { label: 'Bénéfice', options: OPTIONS, modelValue: undefined } })

    await wrapper.findAll('button')[1]?.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['tempo'])

    await wrapper.setProps({ modelValue: 'tempo' })
    expect(wrapper.findAll('button')[1]?.attributes('aria-pressed')).toBe('true')

    await wrapper.findAll('button')[1]?.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[1]).toEqual([undefined])
  })
})

describe('IntensitySlider', () => {
  it('reste non renseigné tant qu’on ne touche pas au curseur', async () => {
    const wrapper = mount(IntensitySlider, { props: { label: 'Aérobie', modelValue: undefined } })

    expect(wrapper.get('.value').text()).toBe('—')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    await wrapper.get('input').setValue('2.3')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([2.3])
  })

  it('affiche la valeur existante', () => {
    const wrapper = mount(IntensitySlider, { props: { label: 'Aérobie', modelValue: 4 } })

    expect(wrapper.get('.value').text()).toBe('4.0')
  })
})

describe('ErrorView', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    useNotification().clear()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('efface un succès tout seul', async () => {
    const wrapper = mount(ErrorView)
    useNotification().notify('Entrée créée !')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Entrée créée !')

    vi.advanceTimersByTime(3000)
    expect(useNotification().message.value).toBe('')
  })

  it('garde une erreur jusqu’à sa fermeture', async () => {
    const wrapper = mount(ErrorView)
    useNotification().notifyError(new Error('HTTP 500'))
    await wrapper.vm.$nextTick()

    vi.advanceTimersByTime(10000)
    expect(wrapper.get('[role="alert"]').text()).toContain('HTTP 500')

    await wrapper.get('button').trigger('click')
    expect(useNotification().message.value).toBe('')
  })
})
