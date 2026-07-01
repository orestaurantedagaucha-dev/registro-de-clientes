import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import Mensagem from '../components/Mensagem'

export default function Principal({ onLogout }) {
  const navigate = useNavigate()
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
  const [tipoMensagem, setTipoMensagem] = useState('')

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
      setTipoMensagem('warning')
      return
    }

    setLoading(true)
    setMensagem('')

    try {
      // Verificar se o telefone já existe
      const { data: existente } = await supabase
        .from('clientes')
        .select('id, nome')
        .eq('telefone', telefoneLimpo)
        .maybeSingle()

      if (existente) {
        if (existente.nome !== nomeLimpo) {
          setMensagem(`Telefone já cadastrado para "${existente.nome}". Use outro telefone ou atualize o cliente existente.`)
          setTipoMensagem('warning')
          setLoading(false)
          return
        }

        // Já existe com o mesmo nome → atualizar sem alterar created_at
        const { error } = await supabase
          .from('clientes')
          .update({ nome: nomeLimpo, endereco: enderecoLimpo })
          .eq('id', existente.id)

        if (error) throw error
      } else {
        // Novo cliente → inserir com data de cadastro
        const { error } = await supabase
          .from('clientes')
          .insert({ nome: nomeLimpo, telefone: telefoneLimpo, endereco: enderecoLimpo, created_at: new Date().toISOString() })

        if (error) throw error
      }

      setMensagem('Cliente cadastrado/atualizado com sucesso!')
      setTipoMensagem('success')
      setCadNome('')
      setCadTelefone('')
      setCadEndereco('')
    } catch (error) {
      console.error('Erro ao salvar:', error)
      setMensagem('Erro ao salvar no banco.')
      setTipoMensagem('error')
    } finally {
      setLoading(false)
    }
  }

  const buscarCliente = async () => {
    const telefoneBusca = telefone.replace(/\D/g, '')

    if (!telefoneBusca) {
      setMensagem('Digite um telefone para buscar.')
      setTipoMensagem('warning')
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
        setTipoMensagem('warning')
      } else {
        setNome(data.nome)
        setEndereco(data.endereco)
        setTelefone(formatarTelefone(data.telefone))
        setMensagem('Cliente encontrado e carregado!')
        setTipoMensagem('success')
      }
    } catch (error) {
      console.error('Erro na busca:', error)
      setMensagem('Erro ao buscar dados.')
      setTipoMensagem('error')
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
    setTipoMensagem('')
  }

  const imprimir = async () => {
    if (!nome) {
      setMensagem('Por favor, preencha pelo menos o Nome')
      setTipoMensagem('warning')
      return
    }
    
    if( !valor ) {
      setMensagem('Por favor, informe o valor total do pedido.')
      setTipoMensagem('warning')
      return
    }
    const valorNumerico = parseFloat(valor.replace(',', '.'))
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      setMensagem('Por favor, informe um valor total válido (maior que zero).')
      setTipoMensagem('warning')
      return
    }

    if (!estaPago && !deveCobrar) {
      setMensagem('Por favor, selecione o status do pagamento.')
      setTipoMensagem('warning')
      return
    }

    setLoading(true)
    setMensagem('')

    try {
      // Salvar cupom no banco de dados
      const { error } = await supabase
        .from('cupom')
        .insert({
          cliente_nome: nome.trim(),
          cliente_endereco: endereco.trim() || null,
          cliente_telefone: telefone.replace(/\D/g, '') || null,
          valor: valorNumerico,
          esta_pago: estaPago,
          deve_cobrar: deveCobrar
        })

      if (error) throw error

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
    } catch (error) {
      console.error('Erro ao salvar cupom:', error)
      setMensagem('Erro ao salvar cupom no banco de dados.')
      setTipoMensagem('error')
    } finally {
      setLoading(false)
    }
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
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => navigate('/clientes')}
              style={{
                background: '#007bff',
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
              GERENCIAR CLIENTES
            </button>
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

      <Mensagem
        mensagem={mensagem}
        tipo={tipoMensagem}
        onClose={() => setMensagem('')}
      />
    </div>
  )
}