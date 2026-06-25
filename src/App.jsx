import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import Login from './pages/Login'
import Principal from './pages/Principal'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogin = () => {
    // onLogin callback - session is already set by onAuthStateChange
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#e9ecef'
      }}>
        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          fontSize: '18px',
          color: '#555'
        }}>
          Carregando...
        </div>
      </div>
    )
  }

  if (!session) {
    return <Login onLogin={handleLogin} />
  }

  return <Principal onLogout={handleLogout} />
}

export default App