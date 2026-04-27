const relativeFormatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

type RelativeUnit = Intl.RelativeTimeFormatUnit

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const WEEK = 7 * DAY
const MONTH = 30 * DAY
const YEAR = 365 * DAY

function formatValue(value: number, unit: RelativeUnit) {
  return relativeFormatter.format(Math.round(value), unit)
}

export function formatRelativeUpdatedTime(iso: string, now = Date.now()) {
  const updatedAt = new Date(iso).getTime()
  if (Number.isNaN(updatedAt)) return 'updated recently'

  const diff = updatedAt - now
  const absDiff = Math.abs(diff)

  if (absDiff < MINUTE) return formatValue(diff / SECOND, 'second')
  if (absDiff < HOUR) return formatValue(diff / MINUTE, 'minute')
  if (absDiff < DAY) return formatValue(diff / HOUR, 'hour')
  if (absDiff < WEEK) return formatValue(diff / DAY, 'day')
  if (absDiff < MONTH) return formatValue(diff / WEEK, 'week')
  if (absDiff < YEAR) return formatValue(diff / MONTH, 'month')
  return formatValue(diff / YEAR, 'year')
}
