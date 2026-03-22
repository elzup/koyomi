import { useCallback, useMemo, useRef, useState } from 'react'
import type { ContentCategory, ContentItem, TimelineRange } from '../types/content.ts'
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

type DragState = {
  readonly startX: number
  readonly currentX: number
} | null

const ZOOM_FACTOR = 0.2
const MIN_RANGE_MONTHS = 6

const clampRange = (range: TimelineRange, full: TimelineRange): TimelineRange => ({
  startYear: Math.max(range.startYear, full.startYear),
  endYear: Math.min(range.endYear, full.endYear),
})

const GanttChart = ({ items }: Props) => {
  const [selectedCategories, setSelectedCategories] = useState<
    ReadonlySet<ContentCategory>
  >(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [zoomRange, setZoomRange] = useState<TimelineRange | null>(null)
  const [tooltip, setTooltip] = useState<TooltipState>(null)
  const [drag, setDrag] = useState<DragState>(null)
  const timelineRef = useRef<HTMLDivElement>(null)

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

  const handleBarHover = (item: ContentItem, event: React.MouseEvent) => {
    setTooltip({ item, x: event.clientX, y: event.clientY })
  }

  const handleBarLeave = () => {
    setTooltip(null)
  }

  // Pixel position → year (fractional)
  const pxToYear = useCallback(
    (clientX: number): number => {
      const el = timelineRef.current
      if (!el) return range.startYear
      const rect = el.getBoundingClientRect()
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      return range.startYear + ratio * (range.endYear - range.startYear + 1)
    },
    [range],
  )

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()
      const cursorYear = pxToYear(e.clientX)
      const span = range.endYear - range.startYear + 1
      const direction = e.deltaY > 0 ? 1 : -1 // down = zoom out, up = zoom in
      const delta = span * ZOOM_FACTOR * direction

      if (direction < 0 && span * 12 <= MIN_RANGE_MONTHS) return

      const cursorRatio = (cursorYear - range.startYear) / span
      const newStart = Math.round(range.startYear + delta * cursorRatio)
      const newEnd = Math.round(range.endYear - delta * (1 - cursorRatio))

      if (newEnd - newStart < 0) return

      setZoomRange(clampRange({ startYear: newStart, endYear: newEnd }, fullRange))
    },
    [range, fullRange, pxToYear],
  )

  const zoomIn = () => {
    const span = range.endYear - range.startYear + 1
    const delta = Math.max(1, Math.round(span * ZOOM_FACTOR))
    const half = Math.floor(delta / 2)
    setZoomRange(
      clampRange(
        { startYear: range.startYear + half, endYear: range.endYear - (delta - half) },
        fullRange,
      ),
    )
  }

  const zoomOut = () => {
    const span = range.endYear - range.startYear + 1
    const delta = Math.max(1, Math.round(span * ZOOM_FACTOR))
    const half = Math.floor(delta / 2)
    setZoomRange(
      clampRange(
        { startYear: range.startYear - half, endYear: range.endYear + (delta - half) },
        fullRange,
      ),
    )
  }

  const resetZoom = () => setZoomRange(null)

  // Drag to select range
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    setDrag({ startX: e.clientX, currentX: e.clientX })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (drag) {
      setDrag({ ...drag, currentX: e.clientX })
    }
  }

  const handleMouseUp = () => {
    if (!drag) return
    const startYear = pxToYear(Math.min(drag.startX, drag.currentX))
    const endYear = pxToYear(Math.max(drag.startX, drag.currentX))
    const spanYears = endYear - startYear

    if (spanYears >= 0.5) {
      setZoomRange(
        clampRange(
          { startYear: Math.floor(startYear), endYear: Math.ceil(endYear) },
          fullRange,
        ),
      )
    }
    setDrag(null)
  }

  // Drag selection overlay position
  const dragOverlay = useMemo(() => {
    if (!drag || !timelineRef.current) return null
    const rect = timelineRef.current.getBoundingClientRect()
    const left = Math.max(0, Math.min(drag.startX, drag.currentX) - rect.left)
    const right = Math.min(rect.width, Math.max(drag.startX, drag.currentX) - rect.left)
    return { left, width: right - left }
  }, [drag])

  const rangeLabel = `${range.startYear} - ${range.endYear}`

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
          <button className="zoom-btn" onClick={zoomIn} title="ズームイン">＋</button>
          <button className="zoom-btn" onClick={zoomOut} title="ズームアウト">ー</button>
          <button
            className={`zoom-btn ${zoomRange === null ? 'active' : ''}`}
            onClick={resetZoom}
          >
            全期間
          </button>
          <span className="zoom-range-label">{rangeLabel}</span>
        </div>
      </div>

      <div className="gantt-info">
        <span className="item-count">{sortedItems.length} 件</span>
        <span className="zoom-hint">ドラッグで範囲選択 / スクロールでズーム</span>
      </div>

      <div className="gantt-chart">
        <div className="gantt-header">
          <div className="gantt-label-col">タイトル</div>
          <div
            className="gantt-timeline-col"
            ref={timelineRef}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => { if (drag) setDrag(null) }}
          >
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
            {dragOverlay && (
              <div
                className="drag-overlay"
                style={{ left: dragOverlay.left, width: dragOverlay.width }}
              />
            )}
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
                <div
                  className="gantt-timeline-col"
                  onWheel={handleWheel}
                >
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
