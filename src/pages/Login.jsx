import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Lock, User, Loader2, AlertCircle } from 'lucide-react'

export default function Login({ onLoginSuccess }) {
  const [usuarioInput, setUsuarioInput] = useState('')
  const [senhaInput, setSenhaInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErro('')

    try {
      // Busca o usuário no Supabase
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

      // Verifica a senha
      if (data.senha !== senhaInput.trim()) {
        setErro('Senha incorreta.')
        setLoading(false)
        return
      }

      // Prepara os dados do usuário logado (incluindo o cargo)
      const userData = {
        id: data.id,
        nome: data.nome,
        usuario: data.usuario,
        cargo: data.cargo // <-- Crucial para o filtro de telas funcionar
      }

      // Salva no localStorage para manter a sessão
      localStorage.setItem('vidracaria_user', JSON.stringify(userData))
      
      // Notifica o App.jsx
      onLoginSuccess(userData)
    } catch (err) {
      setErro('Erro de conexão ao tentar fazer login.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
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
                type="password" required placeholder="••••••••"
                value={senhaInput} onChange={(e) => setSenhaInput(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-md disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Acessar Sistema'}
          </button>
        </form>
      </div>
    </div>
  )
}