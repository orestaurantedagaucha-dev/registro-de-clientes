import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useNavigate } from 'react-router-dom'

export default function ClientesLista() {
  const navigate = useNavigate()
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [mensagem, setMensagem] = useState('')

  // Modal de edição
  const [editModal, setEditModal] = useState(null)
  const [editNome, setEditNome] = useState('')
  const [editTelefone, setEditTelefone] = useState('')
  const [editEndereco, setEditEndereco] = useState('')
  const [saving, setSaving] = useState(false)

  const formatarTelefone = (num) => {
    const clean = num.replace(/\D/g, '')
    if (clean.length === 11) {
      return `(${clean.substring(0,2)}) ${clean.substring(2,7)}-${clean.substring(7)}`
    } else if (clean.length === 10) {
      return `(${clean.substring(0,2)}) ${clean.substring(2,6)}-${clean.substring(6)}`
    }
    return num
  }

  const carregarClientes = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('nome', { ascending: true })

      if (error) throw error
      setClientes(data || [])
    } catch (error) {
      console.error('Erro ao carregar:', error)
      setMensagem('Erro ao carregar clientes.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarClientes()
  }, [])

  const abrirEdicao = (cliente) => {
    setEditModal(cliente.id)
    setEditNome(cliente.nome)
    setEditTelefone(cliente.telefone)
    setEditEndereco(cliente.endereco || '')
  }

  const cancelarEdicao = () => {
    setEditModal(null)
    setEditNome('')
    setEditTelefone('')
    setEditEndereco('')
    setMensagem('')
  }

  const salvarEdicao = async (id) => {
    const nomeLimpo = editNome.trim()
    const telefoneLimpo = editTelefone.replace(/\D/g, '')
    const enderecoLimpo = editEndereco.trim()

    if (!nomeLimpo || !telefoneLimpo) {
      setMensagem('Nome e Telefone são obrigatórios.')
      return
    }

    setSaving(true)
    setMensagem('')

    try {
      // Verificar se o telefone já existe com outro ID
      const { data: existente } = await supabase
        .from('clientes')
        .select('id, nome')
        .eq('telefone', telefoneLimpo)
        .single()

      if (existente && existente.id !== id) {
        setMensagem(`Telefone já cadastrado para "${existente.nome}". Não é possível usar este telefone.`)
        setSaving(false)
        return
      }

      const { error } = await supabase
        .from('clientes')
        .update({ nome: nomeLimpo, telefone: telefoneLimpo, endereco: enderecoLimpo })
        .eq('id', id)

      if (error) throw error

      setMensagem('Cliente atualizado com sucesso!')
      cancelarEdicao()
      carregarClientes()
    } catch (error) {
      console.error('Erro ao atualizar:', error)
      setMensagem('Erro ao atualizar cliente.')
    } finally {
      setSaving(false)
    }
  }

  const excluirCliente = async (cliente) => {
    if (!window.confirm(`Tem certeza que deseja excluir "${cliente.nome}"?`)) {
      return
    }

    setMensagem('')

    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', cliente.id)

      if (error) throw error

      setMensagem(`Cliente "${cliente.nome}" excluído com sucesso!`)
      carregarClientes()
    } catch (error) {
      console.error('Erro ao excluir:', error)
      setMensagem('Erro ao excluir cliente.')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#e9ecef', padding: '40px 20px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        {/* Cabeçalho */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h1 style={{ color: '#333', margin: 0 }}>
            Gerenciar Clientes
          </h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={carregarClientes}
              disabled={loading}
              style={{
                padding: '8px 16px',
                background: loading ? '#6c757d' : '#007bff',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontSize: '14px'
              }}
            >
              {loading ? 'CARREGANDO...' : 'ATUALIZAR'}
            </button>
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '8px 16px',
                background: '#6c757d',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px'
              }}
            >
              VOLTAR
            </button>
          </div>
        </div>

        {/* Tabela */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#555', fontSize: '16px' }}>
              Carregando clientes...
            </div>
          ) : clientes.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#555', fontSize: '16px' }}>
              Nenhum cliente cadastrado ainda.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                  <th style={{ padding: '12px 15px', textAlign: 'left', color: '#333', fontSize: '14px', fontWeight: 'bold' }}>
                    Nome
                  </th>
                  <th style={{ padding: '12px 15px', textAlign: 'left', color: '#333', fontSize: '14px', fontWeight: 'bold' }}>
                    Telefone
                  </th>
                  <th style={{ padding: '12px 15px', textAlign: 'left', color: '#333', fontSize: '14px', fontWeight: 'bold' }}>
                    Endereço
                  </th>
                  <th style={{ padding: '12px 15px', textAlign: 'center', color: '#333', fontSize: '14px', fontWeight: 'bold', width: '110px' }}>
                    Cadastro
                  </th>
                  <th style={{ padding: '12px 15px', textAlign: 'center', color: '#333', fontSize: '14px', fontWeight: 'bold', width: '160px' }}>
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((cliente, index) => (
                  <tr
                    key={cliente.id}
                    style={{
                      borderBottom: '1px solid #eee',
                      background: index % 2 === 0 ? '#fff' : '#fafafa'
                    }}
                  >
                    <td style={{ padding: '12px 15px', color: '#333', fontSize: '14px', fontWeight: 'bold' }}>
                      {cliente.nome}
                    </td>
                    <td style={{ padding: '12px 15px', color: '#555', fontSize: '14px' }}>
                      {formatarTelefone(cliente.telefone)}
                    </td>
                    <td style={{ padding: '12px 15px', color: '#555', fontSize: '14px' }}>
                      {cliente.endereco || '-'}
                    </td>
                    <td style={{ padding: '12px 15px', textAlign: 'center', color: '#555', fontSize: '13px', whiteSpace: 'nowrap' }}>
                      {cliente.created_at ? new Date(cliente.created_at).toLocaleDateString('pt-BR') : '-'}
                    </td>
                    <td style={{ padding: '12px 15px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button
                          onClick={() => abrirEdicao(cliente)}
                          style={{
                            padding: '6px 12px',
                            background: '#ffc107',
                            color: '#333',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '12px'
                          }}
                        >
                          EDITAR
                        </button>
                        <button
                          onClick={() => excluirCliente(cliente)}
                          style={{
                            padding: '6px 12px',
                            background: '#dc3545',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '12px'
                          }}
                        >
                          EXCLUIR
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Informações */}
        {!loading && clientes.length > 0 && (
          <div style={{
            marginTop: '15px',
            color: '#666',
            fontSize: '13px',
            textAlign: 'center'
          }}>
            Total de {clientes.length} cliente{clientes.length !== 1 ? 's' : ''} cadastrado{clientes.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Modal de edição */}
      {editModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ color: '#333', margin: '0 0 20px 0', borderBottom: '2px solid #000', paddingBottom: '10px' }}>
              Editar Cliente
            </h3>

            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555', fontSize: '0.9em' }}>
              Nome do Cliente:
            </label>
            <input
              type="text"
              value={editNome}
              onChange={(e) => setEditNome(e.target.value)}
              placeholder="Nome do cliente"
              style={{
                width: '100%',
                marginBottom: '15px',
                padding: '10px',
                boxSizing: 'border-box',
                border: '1px solid #ccc',
                borderRadius: '6px',
                fontSize: '15px'
              }}
            />

            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555', fontSize: '0.9em' }}>
              Telefone (apenas números):
            </label>
            <input
              type="text"
              value={editTelefone}
              onChange={(e) => setEditTelefone(e.target.value.replace(/\D/g, ''))}
              placeholder="11999998888"
              style={{
                width: '100%',
                marginBottom: '15px',
                padding: '10px',
                boxSizing: 'border-box',
                border: '1px solid #ccc',
                borderRadius: '6px',
                fontSize: '15px'
              }}
            />

            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555', fontSize: '0.9em' }}>
              Endereço Completo:
            </label>
            <textarea
              value={editEndereco}
              onChange={(e) => setEditEndereco(e.target.value)}
              placeholder="Rua, Número, Bairro, Cidade..."
              rows="3"
              style={{
                width: '100%',
                marginBottom: '20px',
                padding: '10px',
                boxSizing: 'border-box',
                border: '1px solid #ccc',
                borderRadius: '6px',
                fontSize: '15px',
                resize: 'vertical'
              }}
            />

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => salvarEdicao(editModal)}
                disabled={saving}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: saving ? '#6c757d' : '#28a745',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}
              >
                {saving ? 'SALVANDO...' : 'SALVAR'}
              </button>
              <button
                onClick={cancelarEdicao}
                disabled={saving}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#6c757d',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}
              >
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mensagem toast */}
      {mensagem && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: mensagem.includes('Erro') ? '#f8d7da' : '#d4edda',
          color: mensagem.includes('Erro') ? '#721c24' : '#155724',
          padding: '15px 20px',
          borderRadius: '6px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          maxWidth: '400px',
          zIndex: 3000,
          fontSize: '14px'
        }}>
          {mensagem}
          <button
            onClick={() => setMensagem('')}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              float: 'right',
              fontSize: '18px',
              padding: 0,
              marginLeft: '10px'
            }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}