import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import * as api from '@/api/generated'
import DayView from '@/components/days/DayView.vue'
import PeriodView from '@/components/periods/PeriodView.vue'

vi.mock('@/api/generated', () => ({
  getEntries: vi.fn(),
  getSummaryInfo: vi.fn(),
}))

const ok = <T>(data: T) => ({ data, status: 200, headers: new Headers() }) as never

describe('PeriodView', () => {
  it('demande au parent de charger les jours, sans état local', async () => {
    vi.mocked(api.getSummaryInfo).mockResolvedValue(ok({}))
    vi.mocked(api.getEntries).mockResolvedValue(ok([]))
    const wrapper = mount(PeriodView, { props: { startDate: '2026-01-05', loaded: false } })
    await flushPromises()
    expect(api.getSummaryInfo).toHaveBeenCalledWith({ fromDate: '2026-01-05', toDate: '2026-01-11' })
    expect(wrapper.findComponent(DayView).exists()).toBe(false)

    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('update:loaded')).toEqual([[true]])

    await wrapper.setProps({ loaded: true })
    expect(wrapper.findAllComponents(DayView).length).toBeGreaterThan(0)
  })
})
