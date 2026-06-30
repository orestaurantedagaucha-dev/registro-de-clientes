import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [verifying, setVerifying] = useState(true)

  useEffect(() => {
    // O Supabase já lida com o token de recovery automaticamente
    // via onAuthStateChange, então só precisamos verificar se
    // a sessão foi estabelecida
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError('Link inválido ou expirado. Solicite um novo reset de senha.')
      }
      setVerifying(false)
    }
    checkSession()
  }, [])

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      setError('As senhas não conferem.')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({ password })

      if (error) throw error

      setSuccess(true)
      setTimeout(() => {
        navigate('/')
      }, 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (verifying) {
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
          Verificando link de recuperação...
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#e9ecef',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h2 style={{
          textAlign: 'center',
          color: '#333',
          marginBottom: '30px',
          borderBottom: '2px solid #000',
          paddingBottom: '10px'
        }}>
          Redefinir Senha
        </h2>

        {error && (
          <div style={{
            background: '#f8d7da',
            color: '#721c24',
            padding: '10px',
            borderRadius: '6px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {error}
            {error.includes('inválido') && (
              <div style={{ marginTop: '10px', textAlign: 'center' }}>
                <button
                  onClick={() => navigate('/')}
                  style={{
                    background: '#007bff',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}
                >
                  VOLTAR AO LOGIN
                </button>
              </div>
            )}
          </div>
        )}

        {success ? (
          <div style={{
            background: '#d4edda',
            color: '#155724',
            padding: '20px',
            borderRadius: '6px',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            <p style={{ fontWeight: 'bold', fontSize: '16px', margin: '0 0 10px 0' }}>
              Senha redefinida com sucesso!
            </p>
            <p style={{ margin: 0 }}>
              Redirecionando para o login...
            </p>
          </div>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{
                display: 'block',
                marginBottom: '5px',
                fontWeight: 'bold',
                color: '#555',
                fontSize: '0.9em'
              }}>
                Nova Senha:
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  fontSize: '15px',
                  boxSizing: 'border-box'
                }}
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '5px',
                fontWeight: 'bold',
                color: '#555',
                fontSize: '0.9em'
              }}>
                Confirmar Nova Senha:
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  fontSize: '15px',
                  boxSizing: 'border-box'
                }}
                placeholder="Repita a nova senha"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                background: loading ? '#6c757d' : '#28a745',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontSize: '16px',
                transition: 'background 0.3s'
              }}
            >
              {loading ? 'REDEFININDO...' : 'REDEFINIR SENHA'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}