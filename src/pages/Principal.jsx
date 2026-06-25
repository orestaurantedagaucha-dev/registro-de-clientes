import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function Principal({ onLogout }) {
  const [nome, setNome] = useState('')
  const [endereco, setEndereco] = useState('')
  const [telefone, setTelefone] = useState('')
  const [valor, setValor] = useState('')
  const [estaPago, setEstaPago] = useState(false)
  const [deveCobrar, setDeveCobrar] = useState(false)

  const [cadNome, setCadNome] = useState('')
  const [cadTelefone, setCadTelefone] = useState('')
  const [cadEndereco, setCadEndereco] = useState('')
  const [loading, setLoading] = useState(false)
  const [mensagem, setMensagem] = useState('')

  const formatarTelefone = (num) => {
    const clean = num.replace(/\D/g, '')
    if (clean.length === 11) {
      return `(${clean.substring(0,2)}) ${clean.substring(2,7)}-${clean.substring(7)}`
    } else if (clean.length === 10) {
      return `(${clean.substring(0,2)}) ${clean.substring(2,6)}-${clean.substring(6)}`
    }
    return num
  }

  const salvarCliente = async () => {
    const nomeLimpo = cadNome.trim()
    const telefoneLimpo = cadTelefone.replace(/\D/g, '')
    const enderecoLimpo = cadEndereco.trim()

    if (!telefoneLimpo || !nomeLimpo || !enderecoLimpo) {
      setMensagem('Por favor, preencha todos os campos para cadastrar.')
      return
    }

    setLoading(true)
    setMensagem('')

    try {
      const { error } = await supabase
        .from('clientes')
        .upsert({ nome: nomeLimpo, telefone: telefoneLimpo, endereco: enderecoLimpo }, {
          onConflict: 'telefone'
        })

      if (error) throw error

      setMensagem('Cliente cadastrado/atualizado com sucesso!')
      setCadNome('')
      setCadTelefone('')
      setCadEndereco('')
    } catch (error) {
      console.error('Erro ao salvar:', error)
      setMensagem('Erro ao salvar no banco. Verifique se o RLS está configurado.')
    } finally {
      setLoading(false)
    }
  }

  const buscarCliente = async () => {
    const telefoneBusca = telefone.replace(/\D/g, '')

    if (!telefoneBusca) {
      setMensagem('Digite um telefone para buscar.')
      return
    }

    setLoading(true)
    setMensagem('')

    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('telefone', telefoneBusca)
        .single()

      if (error || !data) {
        setMensagem('Cliente não encontrado no Banco de Dados.')
      } else {
        setNome(data.nome)
        setEndereco(data.endereco)
        setTelefone(formatarTelefone(data.telefone))
        setMensagem('Cliente encontrado e carregado!')
      }
    } catch (error) {
      console.error('Erro na busca:', error)
      setMensagem('Erro ao buscar dados.')
    } finally {
      setLoading(false)
    }
  }

  const limparFormularioPedido = () => {
    setNome('')
    setEndereco('')
    setTelefone('')
    setValor('')
    setEstaPago(false)
    setDeveCobrar(false)
    setMensagem('')
  }

  const imprimir = () => {
    if (!nome || !valor) {
      setMensagem('Por favor, preencha pelo menos o Nome e o Valor.')
      return
    }

    const valorFormatado = valor.replace('.', ',')

    const cupom = `
      <div style="text-align: center; font-weight: bold; margin-bottom: 15px; border-bottom: 1px solid #000; padding-bottom: 5px; font-size: 14pt;">
        COMPROVANTE DE PEDIDO
      </div>

      ${estaPago ? `<div style="font-size: 16pt; font-weight: 900; border: 2px solid #000; text-align: center; padding: 5px; margin: 10px 0; text-transform: uppercase;">PEDIDO PAGO</div>` : ''}
      ${deveCobrar ? `<div style="font-size: 16pt; font-weight: 900; border: 2px solid #000; text-align: center; padding: 5px; margin: 10px 0; text-transform: uppercase;">COBRAR NO LOCAL</div>` : ''}

      <div style="margin-bottom: 10px; page-break-inside: avoid;">
        <span style="font-size: 14pt; font-weight: normal; display: block; text-transform: uppercase;">Cliente:</span>
        <span style="font-size: 14pt; font-weight: bold; display: block; white-space: pre-wrap; word-wrap: break-word;">${nome.toUpperCase()}</span>
      </div>

      ${endereco ? `
      <div style="margin-bottom: 10px; page-break-inside: avoid;">
        <span style="font-size: 14pt; font-weight: normal; display: block; text-transform: uppercase;">Endereço:</span>
        <span style="font-size: 14pt; font-weight: bold; display: block; white-space: pre-wrap; word-wrap: break-word;">${endereco.toUpperCase()}</span>
      </div>
      ` : ''}

      ${telefone ? `
      <div style="margin-bottom: 10px; page-break-inside: avoid;">
        <span style="font-size: 14pt; font-weight: normal; display: block; text-transform: uppercase;">Telefone:</span>
        <span style="font-size: 14pt; font-weight: bold; display: block;">${telefone}</span>
      </div>
      ` : ''}

      <div style="margin-top: 15px; padding-top: 10px; border-top: 1px dashed #000; text-align: right; page-break-inside: avoid;">
        <span style="font-size: 14pt; font-weight: normal; display: block; text-transform: uppercase;">TOTAL:</span>
        <span style="font-size: 18pt; font-weight: 900;">R$ ${valorFormatado}</span>
      </div>

      <div style="height: 30px; display: block;"></div>
      <div style="text-align: center; font-size: 10pt; font-weight: bold;">*** Fim do Cupom ***</div>
      <div style="height: 30px; display: block;"></div>
    `

    const win = window.open('', '_blank', 'width=400,height=600')
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Cupom</title>
        <style>
          @page { size: 80mm auto; margin: 0; }
          body { background: #fff; margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        </style>
      </head>
      <body>${cupom}</body>
      </html>
    `)
    win.document.close()
    win.print()
  }

  return (
    <div style={{ minHeight: '100vh', background: '#e9ecef', padding: '40px 20px' }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        display: 'flex',
        gap: '20px',
        flexWrap: 'wrap'
      }}>
        {/* Painel de Clientes */}
        <div style={{
          flex: '1 1 300px',
          background: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h2 style={{ color: '#333', margin: 0, borderBottom: '2px solid #000', paddingBottom: '10px' }}>
              Clientes
            </h2>
            <button
              onClick={onLogout}
              style={{
                background: '#dc3545',
                color: '#fff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 'bold',
                width: 'auto'
              }}
            >
              Sair
            </button>
          </div>

          <h3 style={{ color: '#555', marginTop: 0, marginBottom: '15px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>
            Cadastrar Novo / Atualizar
          </h3>

          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555', fontSize: '0.9em' }}>
            Telefone (Apenas números):
          </label>
          <input
            type="text"
            value={cadTelefone}
            onChange={(e) => setCadTelefone(e.target.value.replace(/\D/g, ''))}
            placeholder="Ex: 11999998888"
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
            Nome do Cliente:
          </label>
          <input
            type="text"
            value={cadNome}
            onChange={(e) => setCadNome(e.target.value)}
            placeholder="Ex: JOÃO DA SILVA"
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
            value={cadEndereco}
            onChange={(e) => setCadEndereco(e.target.value)}
            placeholder="Rua, Número, Bairro, Cidade..."
            rows="3"
            style={{
              width: '100%',
              marginBottom: '15px',
              padding: '10px',
              boxSizing: 'border-box',
              border: '1px solid #ccc',
              borderRadius: '6px',
              fontSize: '15px',
              resize: 'vertical'
            }}
          />

          <button
            onClick={salvarCliente}
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
            {loading ? 'SALVANDO...' : 'SALVAR NO BANCO'}
          </button>
        </div>

        {/* Painel de Pedidos */}
        <div style={{
          flex: '1 1 300px',
          background: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ color: '#333', marginTop: 0, borderBottom: '2px solid #000', paddingBottom: '10px' }}>
            Pedido Sweda SI-250
          </h2>

          <div style={{
            display: 'flex',
            gap: '10px',
            background: '#e2f0d9',
            padding: '10px',
            borderRadius: '6px',
            marginBottom: '15px'
          }}>
            <input
              type="text"
              value={telefone}
              onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
              placeholder="Buscar Telefone no Banco..."
              style={{
                flex: 1,
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
            <button
              onClick={buscarCliente}
              disabled={loading}
              style={{
                width: 'auto',
                padding: '10px 15px',
                background: loading ? '#6c757d' : '#007bff',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontSize: '14px',
                transition: 'background 0.3s'
              }}
            >
              {loading ? '...' : 'BUSCAR'}
            </button>
          </div>

          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555', fontSize: '0.9em' }}>
            Nome do Cliente:
          </label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
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
            Endereço:
          </label>
          <textarea
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
            placeholder="Endereço de entrega"
            rows="3"
            style={{
              width: '100%',
              marginBottom: '15px',
              padding: '10px',
              boxSizing: 'border-box',
              border: '1px solid #ccc',
              borderRadius: '6px',
              fontSize: '15px',
              resize: 'vertical'
            }}
          />

          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#555', fontSize: '0.9em' }}>
            Telefone:
          </label>
          <input
            type="text"
            value={telefone}
            onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
            placeholder="Telefone de contato"
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
            Valor Total (R$):
          </label>
          <input
            type="text"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder="0,00"
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
            Status do Pagamento:
          </label>
          <div style={{
            marginBottom: '15px',
            display: 'flex',
            gap: '20px',
            background: '#f8f9fa',
            padding: '10px',
            borderRadius: '6px'
          }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', fontWeight: 'normal' }}>
              <input
                type="radio"
                name="status_pago"
                checked={estaPago}
                onChange={() => { setEstaPago(true); setDeveCobrar(false) }}
                style={{ width: 'auto', marginRight: '8px', marginBottom: 0 }}
              />
              PAGO
            </label>
            <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', fontWeight: 'normal' }}>
              <input
                type="radio"
                name="status_pago"
                checked={deveCobrar}
                onChange={() => { setDeveCobrar(true); setEstaPago(false) }}
                style={{ width: 'auto', marginRight: '8px', marginBottom: 0 }}
              />
              COBRAR NO LOCAL
            </label>
          </div>

          <button
            onClick={imprimir}
            style={{
              width: '100%',
              padding: '12px',
              background: '#28a745',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '16px',
              transition: 'background 0.3s',
              marginBottom: '10px'
            }}
          >
            IMPRIMIR CUPOM
          </button>
          <button
            onClick={limparFormularioPedido}
            style={{
              width: '100%',
              padding: '12px',
              background: '#6c757d',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '16px',
              transition: 'background 0.3s'
            }}
          >
            LIMPAR CAMPOS
          </button>
        </div>
      </div>

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
          zIndex: 1000,
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