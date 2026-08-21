import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Lock, User, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react'

export default function Login({ onLoginSuccess }) {
  const [usuarioInput, setUsuarioInput] = useState('')
  const [senhaInput, setSenhaInput] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErro('')

    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('usuario', usuarioInput.trim())
        .single()

      if (error || !data) {
        setErro('Usuário não encontrado.')
        setLoading(false)
        return
      }

      if (data.senha !== senhaInput.trim()) {
        setErro('Senha incorreta.')
        setLoading(false)
        return
      }

      const userData = {
        id: data.id,
        nome: data.nome,
        usuario: data.usuario,
        cargo: data.cargo
      }

      // sessionStorage encerra a sessão automaticamente ao fechar o navegador/aba
      sessionStorage.setItem('vidracaria_user', JSON.stringify(userData))
      localStorage.removeItem('vidracaria_user') // Limpa resíduos antigos
      onLoginSuccess(userData)
    } catch (err) {
      setErro('Erro de conexão ao tentar fazer login.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 relative">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">Millenium Glass Esquadrias</h1>
          <p className="text-sm text-slate-500">Acesse com seu usuário e senha</p>
        </div>

        {erro && (
          <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs font-medium border border-red-200 flex items-center gap-2">
            <AlertCircle size={16} /> {erro}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nome de Usuário</label>
            <div className="relative flex items-center">
              <User size={18} className="absolute left-3 text-slate-400" />
              <input 
                type="text" required placeholder="Ex: Samuel"
                value={usuarioInput} onChange={(e) => setUsuarioInput(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Senha</label>
            <div className="relative flex items-center">
              <Lock size={18} className="absolute left-3 text-slate-400" />
              <input 
                type={mostrarSenha ? "text" : "password"} 
                required 
                placeholder="••••••••"
                value={senhaInput} 
                onChange={(e) => setSenhaInput(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl text-sm focus:border-blue-600 focus:outline-none"
              />
              <button
                type="button"
                onMouseDown={() => setMostrarSenha(true)}
                onMouseUp={() => setMostrarSenha(false)}
                onMouseLeave={() => setMostrarSenha(false)}
                onTouchStart={() => setMostrarSenha(true)}
                onTouchEnd={() => setMostrarSenha(false)}
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                title="Clique ou segure para visualizar"
              >
                {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-md disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Acessar Sistema'}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center select-none">
          <span className="text-[11px] tracking-wider text-slate-400 font-mono">
            Powered by <strong className="text-slate-700 font-bold">Gv Dev Systems</strong>
          </span>
        </div>
      </div>

      <div className="absolute bottom-4 text-center select-none">
        <span className="text-[10px] tracking-widest text-slate-600 font-mono uppercase">
          Gv Dev Systems • Soluções Web
        </span>
      </div>
    </div>
  )
}