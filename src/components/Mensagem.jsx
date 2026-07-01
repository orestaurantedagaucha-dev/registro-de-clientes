const cores = {
  success: { background: '#d4edda', color: '#155724' },
  error: { background: '#f8d7da', color: '#721c24' },
  warning: { background: '#e1ec1f', color: '#000000' }
}

export default function Mensagem({ mensagem, tipo, onClose }) {
  if (!mensagem) return null

  const estilo = cores[tipo] || cores.success

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: estilo.background,
      color: estilo.color,
      padding: '15px 20px',
      borderRadius: '6px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      maxWidth: '500px',
      zIndex: 1000,
      fontSize: '16px',
      fontWeight: 'bold'
    }}>
      {mensagem}
      <button
        onClick={onClose}
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
  )
}