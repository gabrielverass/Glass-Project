import React from 'react'
import { 
  Plus, DollarSign, ShoppingBag, Clock, TrendingUp, ArrowUpRight 
} from 'lucide-react'

export default function Dashboard() {
  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Comercial</h1>
          <p className="text-slate-500 text-sm">Acompanhamento geral de métricas e vendas do mês.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2 rounded-lg text-sm font-medium transition">
            <Plus size={16} /> Nova Cotação
          </button>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm">
            <Plus size={16} /> Novo Pedido de Venda
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center text-slate-500 mb-2">
            <span className="text-sm font-medium">Faturamento Total</span>
            <DollarSign size={20} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">R$ 48.250,00</div>
          <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-2">
            <ArrowUpRight size={14} /> +12% em relação ao mês anterior
          </span>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center text-slate-500 mb-2">
            <span className="text-sm font-medium">Pedidos no Mês</span>
            <ShoppingBag size={20} className="text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">34</div>
          <span className="text-xs text-slate-500 mt-2 block">18 finalizados</span>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center text-slate-500 mb-2">
            <span className="text-sm font-medium">Em Produção / Instalação</span>
            <Clock size={20} className="text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">12</div>
          <span className="text-xs text-amber-600 font-medium mt-2 block">4 com prazo próximo</span>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center text-slate-500 mb-2">
            <span className="text-sm font-medium">Taxa de Conversão</span>
            <TrendingUp size={20} className="text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">68%</div>
          <span className="text-xs text-indigo-600 font-medium mt-2 block">Origem principal: WhatsApp</span>
        </div>
      </div>

      {/* Gráfico/Resumo de Mídias de Origem */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Vendas por Mídia de Origem</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm font-medium text-slate-700 mb-1">
              <span>WhatsApp</span>
              <span>45% (15 pedidos)</span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm font-medium text-slate-700 mb-1">
              <span>Instagram</span>
              <span>25% (8 pedidos)</span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <div className="bg-indigo-500 h-full rounded-full" style={{ width: '25%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm font-medium text-slate-700 mb-1">
              <span>Google / Site</span>
              <span>18% (6 pedidos)</span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: '18%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm font-medium text-slate-700 mb-1">
              <span>Indicação</span>
              <span>12% (5 pedidos)</span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: '12%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}