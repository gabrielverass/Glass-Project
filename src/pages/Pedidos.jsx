import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { 
  Plus, Search, Edit3, Trash2, X, Loader2, DollarSign, Calendar, CheckCircle2, Clock, AlertCircle, RefreshCw 
} from 'lucide-react'

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('Todos')

  // Modais State
  const [modalNovoAberto, setModalNovoAberto] = useState(false)
  const [modalEditAberto, setModalEditAberto] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  // Form State
  const [form, setForm] = useState({
    id: null,
    cliente: '',
    descricao: '',
    valor_total: '',
    status: 'Pendente',
    forma_pagamento: 'PIX',
    data_entrega: ''
  })

  useEffect(() => {
    carregarPedidos()
  }, [])

  const carregarPedidos = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setPedidos(data)
      }
    } catch (err) {
      console.error('Erro ao carregar pedidos:', err)
    } finally {
      setLoading(false)
    }
  }

  // Alterar Status diretamente na tabela
  const handleAtualizarStatus = async (id, novoStatus) => {
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({ status: novoStatus })
        .eq('id', id)

      if (!error) {
        setPedidos(pedidos.map(p => p.id === id ? { ...p, status: novoStatus } : p))
      } else {
        alert(`Erro ao atualizar status: ${error.message}`)
      }
    } catch (err) {
      alert('Erro de conexão ao alterar status.')
    }
  }

  // Criar ou Editar Pedido
  const handleSalvarPedido = async (e) => {
    e.preventDefault()
    setSalvando(true)
    setErro('')

    try {
      const dadosPedido = {
        cliente: form.cliente.trim(),
        descricao: form.descricao.trim(),
        valor_total: Number(form.valor_total || 0),
        status: form.status,
        forma_pagamento: form.forma_pagamento,
        data_entrega: form.data_entrega || null
      }

      let res

      if (form.id) {
        // Atualizar
        res = await supabase.from('pedidos').update(dadosPedido).eq('id', form.id)
      } else {
        // Inserir Novo
        res = await supabase.from('pedidos').insert([dadosPedido])
      }

      if (res.error) {
        setErro(`Erro ao salvar: ${res.error.message}`)
      } else {
        setModalNovoAberto(false)
        setModalEditAberto(false)
        resetForm()
        carregarPedidos()
      }
    } catch (err) {
      setErro('Falha na comunicação com o servidor.')
    } finally {
      setSalvando(false)
    }
  }

  const handleExcluir = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este pedido?')) return

    try {
      const { error } = await supabase.from('pedidos').delete().eq('id', id)
      if (!error) {
        setPedidos(pedidos.filter(p => p.id !== id))
      }
    } catch (err) {
      console.error('Erro ao excluir pedido:', err)
    }
  }

  const abrirEdicao = (pedido) => {
    setForm({
      id: pedido.id,
      cliente: pedido.cliente || '',
      descricao: pedido.descricao || '',
      valor_total: pedido.valor_total || '',
      status: pedido.status || 'Pendente',
      forma_pagamento: pedido.forma_pagamento || 'PIX',
      data_entrega: pedido.data_entrega || ''
    })
    setModalEditAberto(true)
  }

  const resetForm = () => {
    setForm({
      id: null,
      cliente: '',
      descricao: '',
      valor_total: '',
      status: 'Pendente',
      forma_pagamento: 'PIX',
      data_entrega: ''
    })
  }

  // Estilização das Badges de Status
  const getBadgeStyle = (status) => {
    switch (status) {
      case 'Concluído':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300'
      case 'Em Produção':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'Instalação':
        return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'Cancelado':
        return 'bg-red-100 text-red-800 border-red-300'
      default: // Pendente
        return 'bg-amber-100 text-amber-800 border-amber-300'
    }
  }

  // Filtragem
  const pedidosFiltrados = pedidos.filter(p => {
    const atendeBusca = p.cliente.toLowerCase().includes(busca.toLowerCase()) || 
                        (p.descricao && p.descricao.toLowerCase().includes(busca.toLowerCase()))
    const atendeStatus = filtroStatus === 'Todos' || p.status === filtroStatus
    return atendeBusca && atendeStatus
  })

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pedidos & Vendas</h1>
          <p className="text-slate-500 text-sm">Gerencie o status de fabricação, prazos e pagamentos.</p>
        </div>

        <button 
          onClick={() => { resetForm(); setModalNovoAberto(true); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <Plus size={18} /> Novo Pedido
        </button>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-4 justify-between">
        <div className="flex items-center gap-3 w-full md:w-1/2">
          <Search size={18} className="text-slate-400" />
          <input 
            type="text"
            placeholder="Buscar por cliente ou produto/projeto..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-transparent text-sm focus:outline-none text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {['Todos', 'Pendente', 'Em Produção', 'Instalação', 'Concluído'].map((st) => (
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

      {/* Tabela de Pedidos */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 flex items-center justify-center gap-2">
            <Loader2 className="animate-spin" size={20} /> Carregando pedidos...
          </div>
        ) : pedidosFiltrados.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            Nenhum pedido encontrado. Clique em <strong>Novo Pedido</strong> para registrar a primeira venda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-4">Cliente</th>
                  <th className="p-4">Descrição do Projeto</th>
                  <th className="p-4">Valor Total</th>
                  <th className="p-4">Status Atual</th>
                  <th className="p-4">Pagamento</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pedidosFiltrados.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-bold text-slate-900">{item.cliente}</td>
                    <td className="p-4 text-slate-600">{item.descricao || 'Nenhuma especificação'}</td>
                    <td className="p-4 font-extrabold text-slate-900">
                      R$ {Number(item.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4">
                      {/* Seletor dinâmico de status */}
                      <select 
                        value={item.status || 'Pendente'}
                        onChange={(e) => handleAtualizarStatus(item.id, e.target.value)}
                        className={`text-xs font-bold px-3 py-1 rounded-full border cursor-pointer focus:outline-none ${getBadgeStyle(item.status)}`}
                      >
                        <option value="Pendente">🟡 Pendente</option>
                        <option value="Em Produção">🔵 Em Produção</option>
                        <option value="Instalação">🟣 Instalação</option>
                        <option value="Concluído">🟢 Concluído</option>
                        <option value="Cancelado">🔴 Cancelado</option>
                      </select>
                    </td>
                    <td className="p-4 text-xs font-medium text-slate-500">{item.forma_pagamento || 'PIX'}</td>
                    <td className="p-4 text-right flex items-center justify-end gap-2">
                      <button 
                        onClick={() => abrirEdicao(item)}
                        className="text-slate-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50 transition"
                        title="Editar pedido"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => handleExcluir(item.id)}
                        className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition"
                        title="Excluir pedido"
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

      {/* MODAL (CRIAR / EDITAR PEDIDO) */}
      {(modalNovoAberto || modalEditAberto) && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">
                {form.id ? 'Editar Pedido' : 'Novo Pedido de Venda'}
              </h2>
              <button onClick={() => { setModalNovoAberto(false); setModalEditAberto(false); }} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            {erro && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg text-xs font-medium border border-red-200">
                {erro}
              </div>
            )}

            <form onSubmit={handleSalvarPedido} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nome do Cliente *</label>
                <input 
                  type="text" required placeholder="Ex: Maria Oliveira"
                  value={form.cliente} onChange={(e) => setForm({...form, cliente: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Descrição do Projeto / Produto</label>
                <textarea 
                  rows="3" placeholder="Ex: Box Blindex Incolor 8mm + Porta Pivotante 10mm"
                  value={form.descricao} onChange={(e) => setForm({...form, descricao: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Valor Total (R$) *</label>
                  <input 
                    type="number" step="0.01" required placeholder="0.00"
                    value={form.valor_total} onChange={(e) => setForm({...form, valor_total: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-600 focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Status do Pedido</label>
                  <select 
                    value={form.status} onChange={(e) => setForm({...form, status: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-600 focus:outline-none bg-white font-medium"
                  >
                    <option value="Pendente">Pendente</option>
                    <option value="Em Produção">Em Produção</option>
                    <option value="Instalação">Instalação</option>
                    <option value="Concluído">Concluído</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Forma de Pagamento</label>
                  <select 
                    value={form.forma_pagamento} onChange={(e) => setForm({...form, forma_pagamento: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-600 focus:outline-none bg-white"
                  >
                    <option value="PIX">PIX</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Boleto">Boleto</option>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Sinal + Restante">Sinal (50%) + Restante</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Previsão de Entrega</label>
                  <input 
                    type="date"
                    value={form.data_entrega} onChange={(e) => setForm({...form, data_entrega: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" onClick={() => { setModalNovoAberto(false); setModalEditAberto(false); }}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" disabled={salvando}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {salvando ? 'Salvando...' : 'Salvar Pedido'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}