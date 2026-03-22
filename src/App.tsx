import GanttChart from './components/GanttChart.tsx'
import { contents } from './data/contents.ts'
import './App.css'

const App = () => {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Koyomi</h1>
        <p className="app-subtitle">コンテンツの歴史をガントチャートで</p>
      </header>
      <main className="app-main">
        <GanttChart items={contents} />
      </main>
      <footer className="app-footer">
        <p>Koyomi - Content Timeline Viewer</p>
      </footer>
    </div>
  )
}

export default App
