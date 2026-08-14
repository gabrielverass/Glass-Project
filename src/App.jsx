import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import { 
  LayoutDashboard, Package, Calculator, ShoppingBag, 
  Calendar, LogOut, User 
} from 'lucide-react'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Estoque from './pages/Estoque'
import Cotador from './pages/Cotador'
import Pedidos from './pages/Pedidos'
import Visitas from './pages/Visitas'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userSalvo = localStorage.getItem('vidracaria_user')
    if (userSalvo) {
      setSession(JSON.parse(userSalvo))
    }
    setLoading(false)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('vidracaria_user')
    setSession(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-sm font-semibold">
        Carregando sistema...
      </div>
    )
  }

  if (!session) {
    return <Login onLoginSuccess={(user) => setSession(user)} />
  }

  // Definição de Permissões por Cargo
  const cargo = session.cargo || ''
  const isTotal = cargo === 'Gerente' || cargo === 'Suporte' || cargo === 'Dona' || cargo === 'Administrador'
  const isVendedor = cargo === 'Vendedor'
  const isOperador = cargo === 'Operador' || cargo === 'Atendimento' || cargo === 'Estoquista'

  // Define a página inicial padrão de cada perfil
  const getRotaInicial = () => {
    if (isVendedor) return "/cotador"
    if (isOperador) return "/pedidos"
    return "/"
  }

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-slate-50 font-sans antialiased relative">
        {/* Sidebar Nav */}
        <aside className="w-64 bg-slate-900 text-white flex flex-col border-r border-slate-800">
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-xl font-bold text-blue-400 tracking-tight">Millenium Glass</h2>
            <span className="text-xs text-slate-400 font-medium">Gestão & Esquadrias</span>
          </div>
          
          <nav className="flex-1 p-4 space-y-1">
            {/* Dashboard: Apenas Gerente, Suporte, Dona e Administrador */}
            {isTotal && (
              <NavItem to="/" icon={<LayoutDashboard size={18} />} label="Dashboard" />
            )}

            {/* Controle de Estoque */}
            {isTotal && (
              <NavItem to="/estoque" icon={<Package size={18} />} label="Controle de Estoque" />
            )}

            {/* Cotador de Insumos */}
            {(isTotal || isVendedor) && (
              <NavItem to="/cotador" icon={<Calculator size={18} />} label="Cotador de Insumos" />
            )}

            {/* Pedidos & Vendas */}
            {(isTotal || isOperador) && (
              <NavItem to="/pedidos" icon={<ShoppingBag size={18} />} label="Pedidos & Vendas" />
            )}

            {/* Visitas Técnicas */}
            {(isTotal || isOperador) && (
              <NavItem to="/visitas" icon={<Calendar size={18} />} label="Visitas Técnicas" />
            )}
          </nav>

          {/* Dados do Usuário Logado, Botão Sair & Marca Gv Dev Systems */}
          <div className="p-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <User size={16} className="text-blue-400" />
              <div>
                <span className="font-semibold block text-white">{session.nome}</span>
                <span className="text-slate-400 text-[10px]">{session.cargo}</span>
              </div>
            </div>

            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-500/10 transition cursor-pointer"
            >
              <LogOut size={16} /> Sair da Conta
            </button>

            {/* Assinatura no Rodapé do Menu */}
            <div className="pt-2.5 border-t border-slate-800/60 text-center select-none">
              <span className="text-[10px] tracking-wider text-slate-500 font-mono">
                Powered by <strong className="text-slate-300 font-bold">Gv Dev Systems</strong>
              </span>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto relative">
          <Routes>
            <Route 
              path="/" 
              element={isTotal ? <Dashboard /> : <Navigate to={getRotaInicial()} replace />} 
            />
            <Route 
              path="/estoque" 
              element={isTotal ? <Estoque /> : <Navigate to={getRotaInicial()} replace />} 
            />
            <Route 
              path="/cotador" 
              element={(isTotal || isVendedor) ? <Cotador /> : <Navigate to={getRotaInicial()} replace />} 
            />
            <Route 
              path="/pedidos" 
              element={(isTotal || isOperador) ? <Pedidos /> : <Navigate to={getRotaInicial()} replace />} 
            />
            <Route 
              path="/visitas" 
              element={(isTotal || isOperador) ? <Visitas /> : <Navigate to={getRotaInicial()} replace />} 
            />
            <Route path="*" element={<Navigate to={getRotaInicial()} replace />} />
          </Routes>

          {/* Marca d'água discreta e fixa no canto inferior direito */}
          <div className="fixed bottom-3 right-4 pointer-events-none select-none text-[11px] font-mono text-slate-500/60 font-semibold tracking-wider z-50 bg-slate-200/50 backdrop-blur-xs px-2.5 py-1 rounded-md border border-slate-300/40 shadow-xs">
            Gv Dev Systems
          </div>
        </main>
      </div>
    </BrowserRouter>
  )
}

function NavItem({ to, icon, label }) {
  const location = useLocation()
  const isActive = location.pathname === to

  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
        isActive 
          ? 'bg-blue-600 text-white shadow-sm' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
      }`}
    >
      {icon}
      {label}
    </Link>
  )
}