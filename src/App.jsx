import Dashboard from './pages/Dashboard'
import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, Package, Calculator, ShoppingBag, 
  Calendar, LogOut, User
} from 'lucide-react'

import Login from './pages/Login'
import Estoque from './pages/Estoque'
import Cotador from './pages/Cotador'
import Pedidos from './pages/Pedidos'
import Visitas from './pages/Visitas'
export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Carrega o usuário salvo no navegador
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

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-slate-50 font-sans antialiased">
        {/* Sidebar Nav */}
        <aside className="w-64 bg-slate-900 text-white flex flex-col border-r border-slate-800">
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-xl font-bold text-blue-400 tracking-tight">Millenium Glass Esquadrias</h2>
            <span className="text-xs text-slate-400 font-medium">Gestão & Estoque</span>
          </div>
          
          <nav className="flex-1 p-4 space-y-1">
            <NavItem to="/" icon={<LayoutDashboard size={18} />} label="Dashboard" />
            <NavItem to="/estoque" icon={<Package size={18} />} label="Controle de Estoque" />
            <NavItem to="/cotador" icon={<Calculator size={18} />} label="Cotador de Insumos" />
            <NavItem to="/pedidos" icon={<ShoppingBag size={18} />} label="Pedidos & Vendas" />
            <NavItem to="/visitas" icon={<Calendar size={18} />} label="Visitas Técnicas" />
          </nav>

          {/* Dados do Usuário Logado & Botão Sair */}
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
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-500/10 transition"
            >
              <LogOut size={16} /> Sair da Conta
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/estoque" element={<Estoque />} />
            <Route path="/cotador" element={<Cotador />} />
            <Route path="/pedidos" element={<Pedidos />} />
            <Route path="/visitas" element={<Visitas />} />
          </Routes>
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