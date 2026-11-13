import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import ModalDialog from '@/components/ModalDialog.vue'

const mountModal = () =>
  mount(ModalDialog, {
    props: { title: 'Lundi' },
    slots: { default: '<p class="content">Saisie</p>' },
    attachTo: document.body,
  })

afterEach(() => {
  document.body.innerHTML = ''
})

describe('ModalDialog', () => {
  it('affiche le titre et le contenu dans <body>', () => {
    mountModal()

    expect(document.body.querySelector('[role="dialog"]')?.getAttribute('aria-label')).toBe('Lundi')
    expect(document.body.querySelector('.content')?.textContent).toBe('Saisie')
  })

  it('émet close sur Échap, sur le fond et sur ×, pas sur un clic dans le panneau', () => {
    const wrapper = mountModal()

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    ;(document.body.querySelector('.backdrop') as HTMLElement).click()
    ;(document.body.querySelector('.close') as HTMLElement).click()
    ;(document.body.querySelector('.content') as HTMLElement).click()

    expect(wrapper.emitted('close')).toHaveLength(3)
  })

  it('n’écoute plus le clavier une fois démonté', () => {
    const wrapper = mountModal()
    wrapper.unmount()

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

    expect(wrapper.emitted('close')).toBeUndefined()
  })
})
