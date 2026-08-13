import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { User, Lock, AlertCircle } from 'lucide-react'

export default function Login({ onLoginSuccess }) {
  const [usuario, setUsuario] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErro('')

    // Promessa de timeout para evitar carregamento infinito
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Tempo limite excedido. Verifique sua conexão ou as chaves do .env.')), 5000)
    )

    try {
      const queryPromise = supabase
        .from('usuarios')
        .select('*')
        .eq('usuario', usuario.trim())
        .eq('senha', senha.trim())
        .maybeSingle()

      // Executa a consulta com tempo limite de 5s
      const { data, error } = await Promise.race([queryPromise, timeoutPromise])

      if (error) {
        setErro(`Erro de conexão: ${error.message}`)
      } else if (!data) {
        setErro('Usuário ou senha incorretos.')
      } else {
        localStorage.setItem('vidracaria_user', JSON.stringify(data))
        onLoginSuccess(data)
      }
    } catch (err) {
      setErro(err.message || 'Falha ao conectar com o servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">Vidraçaria App</h1>
          <p className="text-slate-500 text-sm">Acesse com seu usuário e senha</p>
        </div>

        {erro && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm flex items-center gap-2 border border-red-200">
            <AlertCircle size={16} /> {erro}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Nome de Usuário</label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-2.5 text-slate-400" />
              <input 
                type="text" 
                required
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Ex: admin"
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Senha</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-2.5 text-slate-400" />
              <input 
                type="password" 
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-semibold transition shadow-md disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Acessar Sistema'}
          </button>
        </form>
      </div>
    </div>
  )
}