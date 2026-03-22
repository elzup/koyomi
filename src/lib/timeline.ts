import type { ContentItem, TimelineRange } from '../types/content.ts'

const CURRENT_YEAR = new Date().getFullYear()

export const getContentEndYear = (item: ContentItem): number =>
  item.ongoing ? CURRENT_YEAR : (item.endYear ?? item.startYear)

export const getContentEndMonth = (item: ContentItem): number =>
  item.ongoing ? 12 : (item.endMonth ?? item.startMonth ?? 1)

export const getContentStartMonth = (item: ContentItem): number =>
  item.startMonth ?? 1

export const computeTimelineRange = (
  items: readonly ContentItem[]
): TimelineRange => {
  if (items.length === 0) return { startYear: 2000, endYear: CURRENT_YEAR }

  const startYear = Math.min(...items.map((item) => item.startYear))
  const endYear = Math.max(...items.map((item) => getContentEndYear(item)))

  return { startYear, endYear }
}

export const getBarPosition = (
  item: ContentItem,
  range: TimelineRange
): { leftPercent: number; widthPercent: number } => {
  const totalMonths = (range.endYear - range.startYear + 1) * 12
  const startMonth = getContentStartMonth(item)
  const endYear = getContentEndYear(item)
  const endMonth = getContentEndMonth(item)

  const offsetMonths =
    (item.startYear - range.startYear) * 12 + (startMonth - 1)
  const durationMonths =
    (endYear - item.startYear) * 12 + (endMonth - startMonth) + 1

  const leftPercent = (offsetMonths / totalMonths) * 100
  const widthPercent = Math.max(
    (durationMonths / totalMonths) * 100,
    0.3 // minimum width for point events
  )

  return { leftPercent, widthPercent }
}

export const generateYearMarkers = (
  range: TimelineRange
): readonly number[] => {
  const years: number[] = []
  for (let y = range.startYear; y <= range.endYear; y++) {
    years.push(y)
  }
  return years
}

export const formatPeriod = (item: ContentItem): string => {
  const start = item.startMonth
    ? `${item.startYear}/${item.startMonth}`
    : `${item.startYear}`

  if (item.ongoing) return `${start} - 現在`

  const endYear = item.endYear ?? item.startYear
  const endMonth = item.endMonth ?? item.startMonth
  const end = endMonth ? `${endYear}/${endMonth}` : `${endYear}`

  if (start === end) return start
  return `${start} - ${end}`
}
