import { describe, it, expect } from 'vitest'
import type { ContentItem } from '../types/content.ts'
import {
  computeTimelineRange,
  formatPeriod,
  getBarPosition,
  getContentEndYear,
  getContentStartMonth,
  generateYearMarkers,
} from './timeline.ts'

const makeItem = (overrides: Partial<ContentItem> = {}): ContentItem => ({
  id: 'test',
  title: 'Test Item',
  category: 'anime',
  startYear: 2020,
  startMonth: 4,
  endYear: 2021,
  endMonth: 3,
  ...overrides,
})

describe('getContentEndYear', () => {
  it('returns endYear for finished content', () => {
    expect(getContentEndYear(makeItem({ endYear: 2023 }))).toBe(2023)
  })

  it('returns current year for ongoing content', () => {
    const currentYear = new Date().getFullYear()
    expect(
      getContentEndYear(makeItem({ ongoing: true, endYear: undefined }))
    ).toBe(currentYear)
  })

  it('returns startYear when endYear is undefined', () => {
    expect(
      getContentEndYear(makeItem({ endYear: undefined }))
    ).toBe(2020)
  })
})

describe('getContentStartMonth', () => {
  it('returns startMonth when defined', () => {
    expect(getContentStartMonth(makeItem({ startMonth: 7 }))).toBe(7)
  })

  it('returns 1 when startMonth is undefined', () => {
    expect(getContentStartMonth(makeItem({ startMonth: undefined }))).toBe(1)
  })
})

describe('computeTimelineRange', () => {
  it('returns default range for empty items', () => {
    const range = computeTimelineRange([])
    expect(range.startYear).toBe(2000)
  })

  it('computes range from items', () => {
    const items = [
      makeItem({ startYear: 1995 }),
      makeItem({ startYear: 2010, endYear: 2023 }),
    ]
    const range = computeTimelineRange(items)
    expect(range.startYear).toBe(1995)
    expect(range.endYear).toBe(2023)
  })
})

describe('getBarPosition', () => {
  it('calculates position within range', () => {
    const item = makeItem({
      startYear: 2020,
      startMonth: 1,
      endYear: 2020,
      endMonth: 12,
    })
    const range = { startYear: 2020, endYear: 2020 }
    const { leftPercent, widthPercent } = getBarPosition(item, range)
    expect(leftPercent).toBe(0)
    expect(widthPercent).toBe(100)
  })

  it('positions item in the middle of range', () => {
    const item = makeItem({
      startYear: 2021,
      startMonth: 1,
      endYear: 2021,
      endMonth: 12,
    })
    const range = { startYear: 2020, endYear: 2021 }
    const { leftPercent } = getBarPosition(item, range)
    expect(leftPercent).toBe(50)
  })

  it('ensures minimum width for point events', () => {
    const item = makeItem({
      startYear: 2020,
      startMonth: 6,
      endYear: 2020,
      endMonth: 6,
    })
    const range = { startYear: 2000, endYear: 2025 }
    const { widthPercent } = getBarPosition(item, range)
    expect(widthPercent).toBeGreaterThanOrEqual(0.3)
  })
})

describe('generateYearMarkers', () => {
  it('generates consecutive year markers', () => {
    const markers = generateYearMarkers({ startYear: 2020, endYear: 2023 })
    expect(markers).toEqual([2020, 2021, 2022, 2023])
  })

  it('generates single year marker', () => {
    const markers = generateYearMarkers({ startYear: 2020, endYear: 2020 })
    expect(markers).toEqual([2020])
  })
})

describe('formatPeriod', () => {
  it('formats date range with months', () => {
    const result = formatPeriod(
      makeItem({ startYear: 2020, startMonth: 4, endYear: 2021, endMonth: 3 })
    )
    expect(result).toBe('2020/4 - 2021/3')
  })

  it('formats ongoing content', () => {
    const result = formatPeriod(
      makeItem({ startYear: 2020, startMonth: 1, ongoing: true })
    )
    expect(result).toBe('2020/1 - 現在')
  })

  it('formats point event', () => {
    const result = formatPeriod(
      makeItem({
        startYear: 2020,
        startMonth: 6,
        endYear: 2020,
        endMonth: 6,
      })
    )
    expect(result).toBe('2020/6')
  })

  it('formats without month', () => {
    const result = formatPeriod(
      makeItem({
        startYear: 2020,
        startMonth: undefined,
        endYear: 2023,
        endMonth: undefined,
      })
    )
    expect(result).toBe('2020 - 2023')
  })
})
