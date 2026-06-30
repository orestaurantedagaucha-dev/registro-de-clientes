import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [forgotPassword, setForgotPassword] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (forgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        })
        if (error) throw error
        setResetSent(true)
      } else if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        alert('Cadastro realizado! Verifique seu email para confirmar.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        navigate('/')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleForgotPassword = () => {
    setForgotPassword(!forgotPassword)
    setError('')
    setResetSent(false)
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
          {forgotPassword ? 'Recuperar Senha' : (isSignUp ? 'Criar Conta' : 'Login')}
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
          </div>
        )}

        {resetSent ? (
          <div style={{
            background: '#d4edda',
            color: '#155724',
            padding: '20px',
            borderRadius: '6px',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            <p style={{ fontWeight: 'bold', fontSize: '16px', margin: '0 0 10px 0' }}>
              Email enviado!
            </p>
            <p style={{ margin: 0 }}>
              Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: forgotPassword ? '20px' : '15px' }}>
              <label style={{
                display: 'block',
                marginBottom: '5px',
                fontWeight: 'bold',
                color: '#555',
                fontSize: '0.9em'
              }}>
                Email:
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  fontSize: '15px',
                  boxSizing: 'border-box'
                }}
                placeholder="seu@email.com"
              />
            </div>

            {!forgotPassword && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '5px',
                  fontWeight: 'bold',
                  color: '#555',
                  fontSize: '0.9em'
                }}>
                  Senha:
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    fontSize: '15px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="******"
                />
              </div>
            )}

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
              {loading ? 'Carregando...' : (forgotPassword ? 'ENVIAR EMAIL' : (isSignUp ? 'CADASTRAR' : 'ENTRAR'))}
            </button>
          </form>
        )}

        <div style={{
          textAlign: 'center',
          marginTop: '20px',
          fontSize: '14px',
          color: '#555'
        }}>
          {forgotPassword ? (
            <button
              onClick={toggleForgotPassword}
              style={{
                background: 'none',
                border: 'none',
                color: '#007bff',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: '14px',
                padding: '0',
                width: 'auto'
              }}
            >
              Voltar ao Login
            </button>
          ) : (
            <>
              {!isSignUp && (
                <div style={{ marginBottom: '10px' }}>
                  <button
                    onClick={toggleForgotPassword}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#6c757d',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      fontSize: '13px',
                      padding: '0',
                      width: 'auto'
                    }}
                  >
                    Esqueci minha senha
                  </button>
                </div>
              )}
              <div>
                {isSignUp ? 'Já tem conta?' : 'Não tem conta?'}
                <button
                  onClick={() => {
                    setIsSignUp(!isSignUp)
                    setError('')
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#007bff',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    fontSize: '14px',
                    padding: '0',
                    width: 'auto',
                    marginLeft: '5px'
                  }}
                >
                  {isSignUp ? 'Fazer Login' : 'Criar conta'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
