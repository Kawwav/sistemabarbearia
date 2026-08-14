import { useNavigate } from 'react-router-dom'
import './cadastrosabas.css'

const ABAS_CADASTRO = [
  { rota: '/admin/barbeiros', label: 'Barbeiros' },
  { rota: '/admin/servicos', label: 'Serviços' },
  { rota: '/admin/filiais', label: 'Filiais' },
]

// navegação simples entre as telas de cadastro (barbeiros, serviços, filiais)
function CadastrosAbas({ ativa }) {
  const navigate = useNavigate()

  return (
    <nav className="cadastros-abas">
      {ABAS_CADASTRO.map((aba) => (
        <button
          key={aba.rota}
          type="button"
          className={`cadastros-aba ${ativa === aba.rota ? 'cadastros-aba-ativa' : ''}`}
          onClick={() => navigate(aba.rota)}
        >
          {aba.label}
        </button>
      ))}
    </nav>
  )
}

export default CadastrosAbas
