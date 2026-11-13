// Les dates de l'API sont des jours calendaires "YYYY-MM-DD".
// Tous les calculs se font en UTC : en heure locale, un passage à l'heure d'été
// décale toISOString() sur la veille.

/** Nombre de jours d'une période. */
export const PERIOD_DAYS = 7

const WEEK_DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
const MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']

const parseDay = (day: string): Date => new Date(`${day}T00:00:00Z`)

/** Le jour courant "YYYY-MM-DD" dans le fuseau de l'utilisateur. */
export const today = (now: Date = new Date()): string =>
  new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10)

export const addDays = (day: string, days: number): string => {
  const date = parseDay(day)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export const weekDayName = (day: string): string => WEEK_DAYS[parseDay(day).getUTCDay()] as string

/** "2026-01-05" → "5 janv." */
export const shortDate = (day: string): string => {
  const date = parseDay(day)
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]}`
}

/** Les jours d'une période déjà commencés, du plus récent au plus ancien. */
export const elapsedDaysDescending = (
  startDay: string,
  numberOfDays: number,
  now: Date = new Date(),
): string[] => {
  const lastAllowedDay = today(now)
  return Array.from({ length: numberOfDays }, (_, index) => addDays(startDay, index))
    .filter((day) => day <= lastAllowedDay)
    .reverse()
}
