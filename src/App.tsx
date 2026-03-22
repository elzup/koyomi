import GanttChart from './components/GanttChart.tsx'
import ContentForm from './components/ContentForm.tsx'
import './components/ContentForm.css'
import { useAuth } from './hooks/useAuth.ts'
import { useContents } from './hooks/useContents.ts'
import './App.css'

const App = () => {
  const { user, loading: authLoading, login, logout } = useAuth()
  const { items, loading: dataLoading, addItem } = useContents(user)

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-top">
          <h1>Koyomi</h1>
          <div className="auth-area">
            {authLoading ? null : user ? (
              <button className="auth-button" onClick={logout}>
                {user.displayName ?? 'User'} - ログアウト
              </button>
            ) : (
              <button className="auth-button" onClick={login}>
                ログイン
              </button>
            )}
          </div>
        </div>
        <p className="app-subtitle">コンテンツの歴史をガントチャートで</p>
      </header>
      <main className="app-main">
        {user && <ContentForm onSubmit={addItem} />}
        {dataLoading ? (
          <p style={{ textAlign: 'center', color: '#888' }}>読み込み中...</p>
        ) : (
          <GanttChart items={items} />
        )}
      </main>
      <footer className="app-footer">
        <p>Koyomi - Content Timeline Viewer</p>
      </footer>
    </div>
  )
}

export default App
