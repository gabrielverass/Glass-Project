import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { 
  Plus, Search, Edit3, Trash2, X, Loader2, Calendar, Clock, MapPin, Phone, MessageSquare, CheckCircle2 
} from 'lucide-react'

export default function Visitas() {
  const [visitas, setVisitas] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('Todas')

  // Modais
  const [modalAberto, setModalAberto] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  // Form State
  const [form, setForm] = useState({
    id: null,
    cliente: '',
    telefone: '',
    endereco: '',
    data_visita: '',
    horario: '09:00',
    status: 'Agendada',
    observacoes: ''
  })

  useEffect(() => {
    carregarVisitas()
  }, [])

  const carregarVisitas = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('visitas')
        .select('*')
        .order('data_visita', { ascending: true })

      if (!error && data) {
        setVisitas(data)
      }
    } catch (err) {
      console.error('Erro ao carregar visitas:', err)
    } finally {
      setLoading(false)
    }
  }

  // Alterar Status
  const handleAtualizarStatus = async (id, novoStatus) => {
    try {
      const { error } = await supabase
        .from('visitas')
        .update({ status: novoStatus })
        .eq('id', id)

      if (!error) {
        setVisitas(visitas.map(v => v.id === id ? { ...v, status: novoStatus } : v))
      } else {
        alert(`Erro ao alterar status: ${error.message}`)
      }
    } catch (err) {
      alert('Erro de conexão ao alterar status.')
    }
  }

  // Salvar (Criar ou Editar)
  const handleSalvarVisita = async (e) => {
    e.preventDefault()
    setSalvando(true)
    setErro('')

    try {
      const dadosVisita = {
        cliente: form.cliente.trim(),
        telefone: form.telefone.trim(),
        endereco: form.endereco.trim(),
        data_visita: form.data_visita,
        horario: form.horario,
        status: form.status,
        observacoes: form.observacoes.trim()
      }

      let res
      if (form.id) {
        res = await supabase.from('visitas').update(dadosVisita).eq('id', form.id)
      } else {
        res = await supabase.from('visitas').insert([dadosVisita])
      }

      if (res.error) {
        setErro(`Erro ao salvar: ${res.error.message}`)
      } else {
        setModalAberto(false)
        resetForm()
        carregarVisitas()
      }
    } catch (err) {
      setErro('Falha ao conectar com o banco.')
    } finally {
      setSalvando(false)
    }
  }

  const handleExcluir = async (id) => {
    if (!window.confirm('Deseja cancelar/excluir este agendamento de visita?')) return

    try {
      const { error } = await supabase.from('visitas').delete().eq('id', id)
      if (!error) {
        setVisitas(visitas.filter(v => v.id !== id))
      }
    } catch (err) {
      console.error('Erro ao excluir:', err)
    }
  }

  const abrirEdicao = (v) => {
    setForm({
      id: v.id,
      cliente: v.cliente || '',
      telefone: v.telefone || '',
      endereco: v.endereco || '',
      data_visita: v.data_visita || '',
      horario: v.horario || '09:00',
      status: v.status || 'Agendada',
      observacoes: v.observacoes || ''
    })
    setModalAberto(true)
  }

  const resetForm = () => {
    setForm({
      id: null,
      cliente: '',
      telefone: '',
      endereco: '',
      data_visita: '',
      horario: '09:00',
      status: 'Agendada',
      observacoes: ''
    })
  }

  // Abrir conversa no WhatsApp
  const abrirWhatsApp = (num) => {
    if (!num) return
    const numLimpo = num.replace(/\D/g, '')
    window.open(`https://wa.me/55${numLimpo}?text=Olá! Sobre a visita técnica agendada para medição na sua residência:`, '_blank')
  }

  // Badge Status
  const getBadgeStyle = (status) => {
    switch (status) {
      case 'Realizada':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300'
      case 'Em Andamento':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'Cancelada':
        return 'bg-red-100 text-red-800 border-red-300'
      default: // Agendada
        return 'bg-amber-100 text-amber-800 border-amber-300'
    }
  }

  // Filtros
  const visitasFiltradas = visitas.filter(v => {
    const atendeBusca = v.cliente.toLowerCase().includes(busca.toLowerCase()) ||
                        v.endereco.toLowerCase().includes(busca.toLowerCase())
    const atendeStatus = filtroStatus === 'Todas' || v.status === filtroStatus
    return atendeBusca && atendeStatus
  })

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Visitas Técnicas & Medições</h1>
          <p className="text-slate-500 text-sm">Organize a agenda de medição nos endereços dos clientes.</p>
        </div>

        <button 
          onClick={() => { resetForm(); setModalAberto(true); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <Plus size={18} /> Agendar Visita
        </button>
      </div>

      {/* Busca e Filtros */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-4 justify-between">
        <div className="flex items-center gap-3 w-full md:w-1/2">
          <Search size={18} className="text-slate-400" />
          <input 
            type="text"
            placeholder="Buscar por cliente ou endereço..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-transparent text-sm focus:outline-none text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {['Todas', 'Agendada', 'Em Andamento', 'Realizada', 'Cancelada'].map((st) => (
            <button
              key={st}
              onClick={() => setFiltroStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                filtroStatus === st 
                  ? 'bg-slate-900 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Lista / Tabela de Visitas */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 flex items-center justify-center gap-2">
            <Loader2 className="animate-spin" size={20} /> Carregando agenda de visitas...
          </div>
        ) : visitasFiltradas.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            Nenhuma visita técnica encontrada. Clique em <strong>Agendar Visita</strong> para cadastrar.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-4">Data & Hora</th>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Endereço de Medição</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visitasFiltradas.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 font-bold text-slate-900">
                        <Calendar size={15} className="text-blue-600" />
                        {new Date(item.data_visita + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock size={12} /> {item.horario || '09:00'}
                      </div>
                    </td>

                    <td className="p-4 font-semibold text-slate-900">
                      {item.cliente}
                      {item.telefone && (
                        <button 
                          onClick={() => abrirWhatsApp(item.telefone)}
                          className="ml-2 text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 text-xs font-normal underline cursor-pointer"
                        >
                          <Phone size={12} /> {item.telefone}
                        </button>
                      )}
                    </td>

                    <td className="p-4 text-slate-700">
                      <div className="flex items-start gap-1">
                        <MapPin size={15} className="text-slate-400 mt-0.5 shrink-0" />
                        <span>{item.endereco}</span>
                      </div>
                      {item.observacoes && (
                        <div className="text-xs text-slate-400 italic mt-1">
                          Obs: {item.observacoes}
                        </div>
                      )}
                    </td>

                    <td className="p-4">
                      <select 
                        value={item.status || 'Agendada'}
                        onChange={(e) => handleAtualizarStatus(item.id, e.target.value)}
                        className={`text-xs font-bold px-3 py-1 rounded-full border cursor-pointer focus:outline-none ${getBadgeStyle(item.status)}`}
                      >
                        <option value="Agendada">🟡 Agendada</option>
                        <option value="Em Andamento">🔵 Em Andamento</option>
                        <option value="Realizada">🟢 Realizada</option>
                        <option value="Cancelada">🔴 Cancelada</option>
                      </select>
                    </td>

                    <td className="p-4 text-right flex items-center justify-end gap-2">
                      <button 
                        onClick={() => abrirEdicao(item)}
                        className="text-slate-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50 transition"
                        title="Editar visita"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => handleExcluir(item.id)}
                        className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition"
                        title="Excluir visita"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL (AGENDAR / EDITAR VISITA) */}
      {modalAberto && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">
                {form.id ? 'Editar Visita Técnica' : 'Agendar Nova Visita'}
              </h2>
              <button onClick={() => setModalAberto(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            {erro && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg text-xs font-medium border border-red-200">
                {erro}
              </div>
            )}

            <form onSubmit={handleSalvarVisita} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nome do Cliente *</label>
                <input 
                  type="text" required placeholder="Ex: Carlos Eduardo"
                  value={form.cliente} onChange={(e) => setForm({...form, cliente: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Telefone / WhatsApp</label>
                  <input 
                    type="text" placeholder="(85) 98888-7777"
                    value={form.telefone} onChange={(e) => setForm({...form, telefone: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                  <select 
                    value={form.status} onChange={(e) => setForm({...form, status: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-600 focus:outline-none bg-white font-medium"
                  >
                    <option value="Agendada">Agendada</option>
                    <option value="Em Andamento">Em Andamento</option>
                    <option value="Realizada">Realizada</option>
                    <option value="Cancelada">Cancelada</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Endereço de Medição *</label>
                <input 
                  type="text" required placeholder="Rua, número, bairro e referência"
                  value={form.endereco} onChange={(e) => setForm({...form, endereco: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Data da Visita *</label>
                  <input 
                    type="date" required
                    value={form.data_visita} onChange={(e) => setForm({...form, data_visita: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Horário Previsto</label>
                  <input 
                    type="time"
                    value={form.horario} onChange={(e) => setForm({...form, horario: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Observações (Opcional)</label>
                <textarea 
                  rows="2" placeholder="Ex: Levar trena a laser, ap. no 3º andar sem elevador..."
                  value={form.observacoes} onChange={(e) => setForm({...form, observacoes: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" onClick={() => setModalAberto(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" disabled={salvando}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {salvando ? 'Salvando...' : 'Salvar Agendamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}