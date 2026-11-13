import { describe, expect, it } from 'vitest'
import { addDays, elapsedDaysDescending, shortDate, today, weekDayName } from '@/utils/dates'

describe('addDays', () => {
  it('reste sur le bon jour à travers le passage à l’heure d’été', () => {
    const week = Array.from({ length: 7 }, (_, index) => addDays('2026-03-23', index))
    expect(week).toEqual([
      '2026-03-23',
      '2026-03-24',
      '2026-03-25',
      '2026-03-26',
      '2026-03-27',
      '2026-03-28',
      '2026-03-29',
    ])
    expect(addDays('2026-03-28', 2)).toBe('2026-03-30')
  })

  it('passe les fins de mois et d’année', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29')
  })
})

describe('shortDate', () => {
  it('donne le jour et le mois abrégé, sans décalage de fuseau', () => {
    expect(shortDate('2026-01-05')).toBe('5 janv.')
    expect(shortDate('2026-03-29')).toBe('29 mars')
    expect(shortDate('2026-12-31')).toBe('31 déc.')
  })
})

describe('weekDayName', () => {
  it('donne le jour de la semaine', () => {
    expect(weekDayName('2026-11-08')).toBe('Dimanche')
    expect(weekDayName('2026-11-09')).toBe('Lundi')
  })
})

describe('today', () => {
  it('retourne un jour au format ISO', () => {
    expect(today(new Date(2026, 10, 8, 12))).toBe('2026-11-08')
  })

  it('utilise le jour local tard le soir', () => {
    expect(today(new Date(2026, 10, 8, 23, 59))).toBe('2026-11-08')
    expect(today(new Date(2026, 10, 9, 0, 1))).toBe('2026-11-09')
  })
})

describe('elapsedDaysDescending', () => {
  it('masque les jours futurs et commence par le plus récent', () => {
    const now = new Date(2026, 10, 4, 12)
    expect(elapsedDaysDescending('2026-11-02', 7, now)).toEqual([
      '2026-11-04',
      '2026-11-03',
      '2026-11-02',
    ])
  })

  it('retourne les 7 jours d’une semaine passée', () => {
    const now = new Date(2026, 10, 30, 12)
    const days = elapsedDaysDescending('2026-11-02', 7, now)
    expect(days).toHaveLength(7)
    expect(days[0]).toBe('2026-11-08')
    expect(days[6]).toBe('2026-11-02')
  })
})
