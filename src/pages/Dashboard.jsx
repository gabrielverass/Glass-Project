import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { 
  DollarSign, ShoppingBag, Clock, TrendingUp, ArrowUpRight, Loader2, Calendar 
} from 'lucide-react'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [filtroPeriodo, setFiltroPeriodo] = useState('mes') // 'hoje' | 'mes' | 'ano'
  const [metricas, setMetricas] = useState({
    faturamento: 0,
    totalPedidos: 0,
    emProducao: 0,
    ultimosPedidos: []
  })

  // Recarrega os dados do Supabase sempre que o filtro mudar
  useEffect(() => {
    carregarDadosDashboard()
  }, [filtroPeriodo])

  const carregarDadosDashboard = async () => {
    setLoading(true)
    try {
      let query = supabase.from('pedidos').select('*')

      // Cálculo do período de data
      const agora = new Date()
      let dataInicio = new Date()

      if (filtroPeriodo === 'hoje') {
        dataInicio.setHours(0, 0, 0, 0)
      } else if (filtroPeriodo === 'mes') {
        dataInicio = new Date(agora.getFullYear(), agora.getMonth(), 1)
      } else if (filtroPeriodo === 'ano') {
        dataInicio = new Date(agora.getFullYear(), 0, 1)
      }

      // Filtra os pedidos cadastrados a partir da data calculada
      query = query.gte('created_at', dataInicio.toISOString())

      const { data: pedidos, error } = await query.order('created_at', { ascending: false })

      if (!error && pedidos) {
        const total = pedidos.reduce((acc, item) => acc + Number(item.valor_total || 0), 0)
        const emProd = pedidos.filter(p => p.status === 'Em Produção' || p.status === 'Pendente').length

        setMetricas({
          faturamento: total,
          totalPedidos: pedidos.length,
          emProducao: emProd,
          ultimosPedidos: pedidos.slice(0, 5)
        })
      }
    } catch (err) {
      console.error('Erro ao carregar métricas:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      {/* Cabeçalho com Filtro de Período */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Comercial</h1>
          <p className="text-slate-500 text-sm">Acompanhamento de vendas e faturamento em tempo real.</p>
        </div>

        {/* Seletor de Período */}
        <div className="flex items-center bg-slate-200/80 p-1 rounded-xl gap-1 text-xs font-semibold self-start sm:self-auto border border-slate-300/50">
          <button 
            onClick={() => setFiltroPeriodo('hoje')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filtroPeriodo === 'hoje' 
                ? 'bg-white text-blue-600 shadow-sm font-bold' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hoje
          </button>
          <button 
            onClick={() => setFiltroPeriodo('mes')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filtroPeriodo === 'mes' 
                ? 'bg-white text-blue-600 shadow-sm font-bold' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Este Mês
          </button>
          <button 
            onClick={() => setFiltroPeriodo('ano')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filtroPeriodo === 'ano' 
                ? 'bg-white text-blue-600 shadow-sm font-bold' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Este Ano
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center text-slate-500 mb-2">
            <span className="text-sm font-medium">Faturamento</span>
            <DollarSign size={20} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {loading ? <Loader2 className="animate-spin text-slate-400" size={24} /> : `R$ ${metricas.faturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          </div>
          <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-2">
            <ArrowUpRight size={14} /> Período: {filtroPeriodo.toUpperCase()}
          </span>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center text-slate-500 mb-2">
            <span className="text-sm font-medium">Pedidos Cadastrados</span>
            <ShoppingBag size={20} className="text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {loading ? <Loader2 className="animate-spin text-slate-400" size={24} /> : metricas.totalPedidos}
          </div>
          <span className="text-xs text-slate-500 mt-2 block">No período selecionado</span>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center text-slate-500 mb-2">
            <span className="text-sm font-medium">Em Produção / Pendente</span>
            <Clock size={20} className="text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {loading ? <Loader2 className="animate-spin text-slate-400" size={24} /> : metricas.emProducao}
          </div>
          <span className="text-xs text-amber-600 font-medium mt-2 block">Aguardando entrega</span>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center text-slate-500 mb-2">
            <span className="text-sm font-medium">Conexão Banco</span>
            <TrendingUp size={20} className="text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">Ativa</div>
          <span className="text-xs text-slate-500 mt-2 block">Supabase Sincronizado</span>
        </div>
      </div>

      {/* Tabela de ÚLTIMOS PEDIDOS DO PERÍODO */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Últimos Pedidos do Período</h3>
        {loading ? (
          <div className="p-4 text-center text-slate-500"><Loader2 className="animate-spin inline mr-2" /> Atualizando relatório...</div>
        ) : metricas.ultimosPedidos.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhum pedido encontrado no período selecionado (<strong>{filtroPeriodo}</strong>).</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Cliente</th>
                  <th className="p-3">Valor Total</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {metricas.ultimosPedidos.map((ped, index) => (
                  <tr key={ped.id || index}>
                    <td className="p-3 font-medium text-slate-900">{ped.cliente || 'Cliente não identificado'}</td>
                    <td className="p-3 font-semibold text-slate-800">R$ {Number(ped.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="p-3">
                      <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-medium">
                        {ped.status || 'Pendente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
