import { useState } from 'react'
import type { ContentCategory, ContentItem } from '../types/content'
import { CATEGORY_LABELS } from '../types/content'

type Props = {
  readonly onSubmit: (item: ContentItem) => void
}

const categories = Object.keys(CATEGORY_LABELS) as ContentCategory[]
const currentYear = new Date().getFullYear()

const ContentForm = ({ onSubmit }: Props) => {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<ContentCategory>('game')
  const [startYear, setStartYear] = useState(currentYear)
  const [startMonth, setStartMonth] = useState(1)
  const [endYear, setEndYear] = useState(currentYear)
  const [endMonth, setEndMonth] = useState(12)
  const [isOngoing, setIsOngoing] = useState(false)
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    const item: ContentItem = {
      id: crypto.randomUUID(),
      title: title.trim(),
      category,
      startYear,
      startMonth,
      ...(isOngoing
        ? { ongoing: true }
        : { endYear, endMonth }),
      ...(description.trim() ? { description: description.trim() } : {}),
    }

    onSubmit(item)
    setTitle('')
    setDescription('')
  }

  return (
    <form className="content-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <input
          type="text"
          placeholder="タイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as ContentCategory)}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_LABELS[cat]}
            </option>
          ))}
        </select>
      </div>
      <div className="form-row">
        <label>
          開始
          <input
            type="number"
            value={startYear}
            onChange={(e) => setStartYear(Number(e.target.value))}
            min={1970}
            max={2100}
          />
          <span>/</span>
          <input
            type="number"
            value={startMonth}
            onChange={(e) => setStartMonth(Number(e.target.value))}
            min={1}
            max={12}
          />
        </label>
        <label className="ongoing-label">
          <input
            type="checkbox"
            checked={isOngoing}
            onChange={(e) => setIsOngoing(e.target.checked)}
          />
          継続中
        </label>
        {!isOngoing && (
          <label>
            終了
            <input
              type="number"
              value={endYear}
              onChange={(e) => setEndYear(Number(e.target.value))}
              min={1970}
              max={2100}
            />
            <span>/</span>
            <input
              type="number"
              value={endMonth}
              onChange={(e) => setEndMonth(Number(e.target.value))}
              min={1}
              max={12}
            />
          </label>
        )}
      </div>
      <div className="form-row">
        <input
          type="text"
          placeholder="説明（任意）"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button type="submit">追加</button>
      </div>
    </form>
  )
}

export default ContentForm
