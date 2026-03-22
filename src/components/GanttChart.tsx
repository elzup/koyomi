import { useMemo, useRef, useState } from 'react'
import type { ContentCategory, ContentItem } from '../types/content.ts'
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../types/content.ts'
import {
  computeTimelineRange,
  formatPeriod,
  generateYearMarkers,
  getBarPosition,
} from '../lib/timeline.ts'
import './GanttChart.css'

type Props = {
  readonly items: readonly ContentItem[]
}

type TooltipState = {
  readonly item: ContentItem
  readonly x: number
  readonly y: number
} | null

const GanttChart = ({ items }: Props) => {
  const [selectedCategories, setSelectedCategories] = useState<
    ReadonlySet<ContentCategory>
  >(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [zoomRange, setZoomRange] = useState<{
    startYear: number
    endYear: number
  } | null>(null)
  const [tooltip, setTooltip] = useState<TooltipState>(null)
  const chartRef = useRef<HTMLDivElement>(null)

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (
        selectedCategories.size > 0 &&
        !selectedCategories.has(item.category)
      ) {
        return false
      }
      if (
        searchQuery &&
        !item.title.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false
      }
      return true
    })
  }, [items, selectedCategories, searchQuery])

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category)
      }
      return a.startYear - b.startYear
    })
  }, [filteredItems])

  const fullRange = useMemo(() => computeTimelineRange(items), [items])

  const range = zoomRange ?? fullRange

  const yearMarkers = useMemo(() => generateYearMarkers(range), [range])

  const toggleCategory = (category: ContentCategory) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }

  const categories = useMemo(() => {
    const set = new Set<ContentCategory>()
    for (const item of items) {
      set.add(item.category)
    }
    return [...set].sort()
  }, [items])

  const handleBarHover = (
    item: ContentItem,
    event: React.MouseEvent
  ) => {
    setTooltip({ item, x: event.clientX, y: event.clientY })
  }

  const handleBarLeave = () => {
    setTooltip(null)
  }

  const zoomPresets = [
    { label: '全期間', start: fullRange.startYear, end: fullRange.endYear },
    { label: '1980s', start: 1980, end: 1989 },
    { label: '1990s', start: 1990, end: 1999 },
    { label: '2000s', start: 2000, end: 2009 },
    { label: '2010s', start: 2010, end: 2019 },
    { label: '2020s', start: 2020, end: 2029 },
  ]

  return (
    <div className="gantt-container">
      <div className="gantt-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="タイトルで検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="category-filters">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`category-btn ${selectedCategories.has(cat) ? 'active' : ''}`}
              style={{
                '--cat-color': CATEGORY_COLORS[cat],
              } as React.CSSProperties}
              onClick={() => toggleCategory(cat)}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
          {selectedCategories.size > 0 && (
            <button
              className="category-btn reset"
              onClick={() => setSelectedCategories(new Set())}
            >
              リセット
            </button>
          )}
        </div>

        <div className="zoom-controls">
          {zoomPresets.map((preset) => (
            <button
              key={preset.label}
              className={`zoom-btn ${
                zoomRange?.startYear === preset.start &&
                zoomRange?.endYear === preset.end
                  ? 'active'
                  : preset.label === '全期間' && zoomRange === null
                    ? 'active'
                    : ''
              }`}
              onClick={() =>
                setZoomRange(
                  preset.label === '全期間'
                    ? null
                    : { startYear: preset.start, endYear: preset.end }
                )
              }
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="gantt-info">
        <span className="item-count">{sortedItems.length} 件</span>
      </div>

      <div className="gantt-chart" ref={chartRef}>
        <div className="gantt-header">
          <div className="gantt-label-col">タイトル</div>
          <div className="gantt-timeline-col">
            {yearMarkers.map((year) => {
              const totalYears = range.endYear - range.startYear + 1
              const leftPercent =
                ((year - range.startYear) / totalYears) * 100
              return (
                <div
                  key={year}
                  className="year-marker"
                  style={{ left: `${leftPercent}%` }}
                >
                  <span className="year-label">{year}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="gantt-body">
          {sortedItems.map((item) => {
            const { leftPercent, widthPercent } = getBarPosition(item, range)
            return (
              <div key={item.id} className="gantt-row">
                <div className="gantt-label-col">
                  <span
                    className="category-dot"
                    style={{ backgroundColor: CATEGORY_COLORS[item.category] }}
                  />
                  <span className="item-title" title={item.title}>
                    {item.title}
                  </span>
                </div>
                <div className="gantt-timeline-col">
                  <div
                    className={`gantt-bar ${item.ongoing ? 'ongoing' : ''}`}
                    style={{
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                      backgroundColor: CATEGORY_COLORS[item.category],
                    }}
                    onMouseEnter={(e) => handleBarHover(item, e)}
                    onMouseMove={(e) => handleBarHover(item, e)}
                    onMouseLeave={handleBarLeave}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {tooltip && (
        <div
          className="gantt-tooltip"
          style={{ left: tooltip.x + 12, top: tooltip.y + 12 }}
        >
          <div className="tooltip-title">{tooltip.item.title}</div>
          <div className="tooltip-period">{formatPeriod(tooltip.item)}</div>
          <div className="tooltip-category">
            {CATEGORY_LABELS[tooltip.item.category]}
          </div>
          {tooltip.item.description && (
            <div className="tooltip-desc">{tooltip.item.description}</div>
          )}
        </div>
      )}
    </div>
  )
}

export default GanttChart
