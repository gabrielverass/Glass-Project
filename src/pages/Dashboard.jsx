import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { 
  DollarSign, ShoppingBag, TrendingUp, Clock, 
  Calendar, FileText, Download, Printer, Filter, 
  CheckCircle, Loader2, ArrowUpRight, BarChart3, PieChart
} from 'lucide-react'

export default function Dashboard() {
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroPeriodo, setFiltroPeriodo] = useState('este_mes')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [modalExportar, setModalExportar] = useState(false)

  // 1. Carregar Pedidos do Banco
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
      console.error('Erro ao buscar pedidos:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarPedidos()
    configurarDatasFiltro('este_mes')
  }, [])

  // 2. Configurar Intervalos de Data Rápidos
  const configurarDatasFiltro = (tipo) => {
    setFiltroPeriodo(tipo)
    const hoje = new Date()
    let inicio = new Date()
    let fim = new Date()

    if (tipo === 'este_mes') {
      inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
      fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)
    } else if (tipo === 'mes_anterior') {
      inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1)
      fim = new Date(hoje.getFullYear(), hoje.getMonth(), 0)
    } else if (tipo === 'ultimos_30') {
      inicio = new Date()
      inicio.setDate(hoje.getDate() - 30)
      fim = hoje
    } else if (tipo === 'ano_atual') {
      inicio = new Date(hoje.getFullYear(), 0, 1)
      fim = new Date(hoje.getFullYear(), 11, 31)
    }

    if (tipo !== 'personalizado') {
      setDataInicio(inicio.toISOString().split('T')[0])
      setDataFim(fim.toISOString().split('T')[0])
    }
  }

  // 3. Filtrar Pedidos por Data
  const pedidosFiltrados = pedidos.filter(p => {
    if (!dataInicio && !dataFim) return true
    const dataCriacao = new Date(p.created_at || p.data || new Date()).toISOString().split('T')[0]
    if (dataInicio && dataCriacao < dataInicio) return false
    if (dataFim && dataCriacao > dataFim) return false
    return true
  })

  // 4. Cálculos dos Indicadores Financeiros e Operacionais
  const totalFaturamento = pedidosFiltrados.reduce((acc, p) => acc + (parseFloat(p.valor_total) || 0), 0)
  const totalPedidos = pedidosFiltrados.length
  const ticketMedio = totalPedidos > 0 ? totalFaturamento / totalPedidos : 0

  const pedidosConcluidos = pedidosFiltrados.filter(p => 
    p.status_producao === 'Instalado / Concluído' || p.status === 'Concluído'
  ).length

  const taxaConclusao = totalPedidos > 0 ? ((pedidosConcluidos / totalPedidos) * 100).toFixed(0) : 0

  // Distribuição por Canal de Venda
  const canais = pedidosFiltrados.reduce((acc, p) => {
    const canal = p.canal || 'WhatsApp'
    const val = parseFloat(p.valor_total) || 0
    if (!acc[canal]) acc[canal] = { count: 0, total: 0 }
    acc[canal].count += 1
    acc[canal].total += val
    return acc
  }, {})

  // Distribuição por Status de Produção
  const statusProducao = {
    'Fila de Demanda': pedidosFiltrados.filter(p => p.status_producao === 'Fila de Demanda' || p.status === 'Pendente').length,
    'Em Produção': pedidosFiltrados.filter(p => p.status_producao === 'Em Produção' || p.status === 'Em Produção').length,
    'Pronto para Instalação': pedidosFiltrados.filter(p => p.status_producao === 'Pronto para Instalação').length,
    'Instalado / Concluído': pedidosConcluidos
  }

  // 5. Exportar Relatório em Excel (CSV)
  const exportarCSV = () => {
    if (pedidosFiltrados.length === 0) {
      alert('Não há pedidos no período selecionado.')
      return
    }

    const colunas = ['ID', 'Cliente', 'Telefone', 'Servico', 'Valor Total (R$)', 'Status Pagamento', 'Status Producao', 'Canal', 'Data']
    const linhas = pedidosFiltrados.map(p => [
      p.id,
      `"${(p.cliente || '').replace(/"/g, '""')}"`,
      `"${p.telefone || '-'}"`,
      `"${(p.servico || p.descricao || '').replace(/"/g, '""')}"`,
      (parseFloat(p.valor_total) || 0).toFixed(2),
      `"${p.status_pagamento || '-'}"`,
      `"${p.status_producao || p.status || '-'}"`,
      `"${p.canal || 'WhatsApp'}"`,
      new Date(p.created_at || new Date()).toLocaleDateString('pt-BR')
    ])

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [colunas.join(';'), ...linhas.map(e => e.join(';'))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Relatorio_Pedidos_${dataInicio}_a_${dataFim}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setModalExportar(false)
  }

  // 6. Gerar Relatório Executivo em PDF
  const imprimirRelatorioPDF = () => {
    const printWindow = window.open('', '_blank')
    const formatBRL = (v) => (parseFloat(v) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Relatório Gerencial de Pedidos - Millenium Glass</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
          * { box-sizing: border-box; }
          body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
            color: #1e293b; 
            padding: 30px; 
            margin: 0;
            -webkit-print-color-adjust: exact;
          }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0284c7; padding-bottom: 12px; margin-bottom: 20px; }
          .title { font-size: 16px; font-weight: 800; color: #0f172a; text-transform: uppercase; }
          .subtitle { font-size: 11px; color: #64748b; margin-top: 2px; }
          .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 25px; }
          .kpi-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; }
          .kpi-label { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700; }
          .kpi-value { font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 4px; }
          .section-title { font-size: 12px; font-weight: 800; color: #0284c7; text-transform: uppercase; margin: 20px 0 10px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
          table { width: 100%; border-collapse: collapse; font-size: 10.5px; margin-top: 8px; }
          th { background: #f1f5f9; color: #334155; font-weight: 700; text-align: left; padding: 6px 8px; border: 1px solid #cbd5e1; }
          td { padding: 6px 8px; border: 1px solid #cbd5e1; color: #1e293b; }
          .text-right { text-align: right; }
          .footer { margin-top: 30px; text-align: center; font-size: 9px; color: #94a3b8; font-family: monospace; }
          @media print { @page { margin: 1cm; size: landscape; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">Millenium Glass Esquadrias • Relatório Gerencial de Vendas</div>
            <div class="subtitle">Período: ${new Date(dataInicio).toLocaleDateString('pt-BR')} a ${new Date(dataFim).toLocaleDateString('pt-BR')}</div>
          </div>
          <div style="text-align: right; font-size: 10px; color: #64748b;">
            Gerado em: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-label">Faturamento Total</div>
            <div class="kpi-value">R$ ${formatBRL(totalFaturamento)}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Pedidos Fechados</div>
            <div class="kpi-value">${totalPedidos} obras</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Ticket Médio</div>
            <div class="kpi-value">R$ ${formatBRL(ticketMedio)}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Taxa de Conclusão</div>
            <div class="kpi-value">${taxaConclusao}%</div>
          </div>
        </div>

        <div class="section-title">Levantamento de Obras & Pedidos do Período</div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Cliente</th>
              <th>Contato</th>
              <th>Serviço / Projeto</th>
              <th>Canal</th>
              <th>Status Produção</th>
              <th>Pagamento</th>
              <th class="text-right">Valor Total</th>
            </tr>
          </thead>
          <tbody>
            ${pedidosFiltrados.map(p => `
              <tr>
                <td>#PED-${p.id}</td>
                <td><strong>${p.cliente || '-'}</strong></td>
                <td>${p.telefone || '-'}</td>
                <td>${p.servico || p.descricao || '-'}</td>
                <td>${p.canal || 'WhatsApp'}</td>
                <td>${p.status_producao || p.status || '-'}</td>
                <td>${p.status_pagamento || '-'}</td>
                <td class="text-right"><strong>R$ ${formatBRL(p.valor_total)}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          Millenium Glass Esquadrias • Sistema de Gestão Empresarial • Powered by Gv Dev Systems
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `)
    printWindow.document.close()
    setModalExportar(false)
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Topo do Dashboard */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard & Relatórios</h1>
          <p className="text-sm text-slate-500">Indicadores de vendas, faturamento por canal e levantamento de produção.</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => setModalExportar(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2 text-xs cursor-pointer"
          >
            <Download size={15} /> Exportar Relatório (PDF / Excel)
          </button>
        </div>
      </div>

      {/* Barra de Filtro de Período */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mr-2">
            <Filter size={14} /> Filtrar por:
          </span>
          {[
            { id: 'este_mes', label: 'Este mês' },
            { id: 'mes_anterior', label: 'Mês anterior' },
            { id: 'ultimos_30', label: 'Últimos 30 dias' },
            { id: 'ano_atual', label: 'Ano atual' },
            { id: 'personalizado', label: 'Personalizado' },
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => configurarDatasFiltro(btn.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                filtroPeriodo === btn.id 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Seleção de Datas Manuais */}
        <div className="flex items-center gap-2 text-xs">
          <input 
            type="date" value={dataInicio} onChange={e => { setDataInicio(e.target.value); setFiltroPeriodo('personalizado') }}
            className="border border-slate-300 rounded-lg p-1.5 text-slate-700 outline-none focus:border-blue-500"
          />
          <span className="text-slate-400">até</span>
          <input 
            type="date" value={dataFim} onChange={e => { setDataFim(e.target.value); setFiltroPeriodo('personalizado') }}
            className="border border-slate-300 rounded-lg p-1.5 text-slate-700 outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Cards de Métricas Principais */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400 text-sm gap-2">
          <Loader2 className="animate-spin" size={20} /> Carregando métricas do dashboard...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card Faturamento */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex justify-between items-center text-slate-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Faturamento Total</span>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><DollarSign size={18} /></div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-slate-900">
                  R$ {totalFaturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold block mt-1">
                  • {totalPedidos} pedidos fechados
                </span>
              </div>
            </div>

            {/* Card Pedidos */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex justify-between items-center text-slate-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Obras / Pedidos</span>
                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl"><ShoppingBag size={18} /></div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-slate-900">{totalPedidos}</span>
                <span className="text-[11px] text-slate-500 font-medium block mt-1">
                  Volume total no período
                </span>
              </div>
            </div>

            {/* Card Ticket Médio */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex justify-between items-center text-slate-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Ticket Médio</span>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><TrendingUp size={18} /></div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-slate-900">
                  R$ {ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[11px] text-slate-500 font-medium block mt-1">
                  Média de valor por obra
                </span>
              </div>
            </div>

            {/* Card Taxa de Conclusão */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex justify-between items-center text-slate-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Taxa de Conclusão</span>
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><CheckCircle size={18} /></div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-slate-900">{taxaConclusao}%</span>
                <span className="text-[11px] text-slate-500 font-medium block mt-1">
                  {pedidosConcluidos} de {totalPedidos} instalados
                </span>
              </div>
            </div>

          </div>

          {/* Gráficos / Distribuições */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Tabela de Vendas por Canal de Mídia */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <BarChart3 size={18} className="text-blue-600" /> Vendas por Canal de Mídia
                </h3>
                <span className="text-xs text-slate-400">Origem dos clientes</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px]">
                      <th className="py-2">Canal</th>
                      <th className="py-2 text-center">Pedidos</th>
                      <th className="py-2 text-right">Faturamento</th>
                      <th className="py-2 text-right">Ticket Médio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {['WhatsApp', 'OLX', 'Instagram', 'Google', 'Indicação'].map((canalNome) => {
                      const dados = canais[canalNome] || { count: 0, total: 0 }
                      const tMedioCanal = dados.count > 0 ? dados.total / dados.count : 0
                      return (
                        <tr key={canalNome} className="hover:bg-slate-50">
                          <td className="py-2.5 font-semibold text-slate-800">{canalNome}</td>
                          <td className="py-2.5 text-center font-bold">{dados.count}</td>
                          <td className="py-2.5 text-right font-semibold">R$ {dados.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                          <td className="py-2.5 text-right text-slate-500">R$ {tMedioCanal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pipeline de Produção & Status de Demanda */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <PieChart size={18} className="text-purple-600" /> Pipeline de Produção
                </h3>
                <span className="text-xs text-slate-400">Fluxo das obras</span>
              </div>

              <div className="space-y-3.5 pt-1">
                {Object.entries(statusProducao).map(([statusNome, qtd]) => {
                  const porcentagem = totalPedidos > 0 ? (qtd / totalPedidos) * 100 : 0
                  let corBarra = 'bg-blue-600'
                  if (statusNome === 'Fila de Demanda') corBarra = 'bg-slate-500'
                  if (statusNome === 'Em Produção') corBarra = 'bg-blue-600'
                  if (statusNome === 'Pronto para Instalação') corBarra = 'bg-amber-500'
                  if (statusNome === 'Instalado / Concluído') corBarra = 'bg-emerald-500'

                  return (
                    <div key={statusNome} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>{statusNome}</span>
                        <span>{qtd} ({porcentagem.toFixed(0)}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div className={`${corBarra} h-2 rounded-full transition-all duration-500`} style={{ width: `${porcentagem}%` }}></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

          </div>

          {/* Tabela Resumida dos Últimos Pedidos */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Levantamento Recente de Pedidos</h3>
              <span className="text-xs text-slate-400">{pedidosFiltrados.length} obras registradas</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px]">
                    <th className="py-2.5">Cliente</th>
                    <th className="py-2.5">Serviço</th>
                    <th className="py-2.5">Canal</th>
                    <th className="py-2.5">Produção</th>
                    <th className="py-2.5">Pagamento</th>
                    <th className="py-2.5 text-right">Valor Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {pedidosFiltrados.slice(0, 5).map(p => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-3 font-semibold text-slate-800">{p.cliente}</td>
                      <td className="py-3 text-slate-500 max-w-xs truncate">{p.servico || p.descricao || '-'}</td>
                      <td className="py-3">{p.canal || 'WhatsApp'}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700">
                          {p.status_producao || p.status || 'Fila'}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                          {p.status_pagamento || 'Pendente'}
                        </span>
                      </td>
                      <td className="py-3 text-right font-bold text-slate-900">
                        R$ {(parseFloat(p.valor_total) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modal de Opções de Exportação */}
      {modalExportar && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 animate-in fade-in">
            <div>
              <h2 className="text-base font-bold text-slate-900">Exportar Relatório de Pedidos</h2>
              <p className="text-xs text-slate-500">Escolha o formato desejado para o período selecionado.</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 space-y-1">
              <div><strong>Período:</strong> {new Date(dataInicio).toLocaleDateString('pt-BR')} a {new Date(dataFim).toLocaleDateString('pt-BR')}</div>
              <div><strong>Total de Obras:</strong> {pedidosFiltrados.length} pedidos</div>
              <div><strong>Faturamento:</strong> R$ {totalFaturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={exportarCSV}
                className="flex flex-col items-center justify-center gap-2 p-4 border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 rounded-xl transition cursor-pointer text-slate-700 font-semibold text-xs"
              >
                <Download size={24} className="text-emerald-600" />
                <span>Gerar Excel (CSV)</span>
              </button>

              <button 
                onClick={imprimirRelatorioPDF}
                className="flex flex-col items-center justify-center gap-2 p-4 border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 rounded-xl transition cursor-pointer text-slate-700 font-semibold text-xs"
              >
                <Printer size={24} className="text-blue-600" />
                <span>Gerar PDF / Imprimir</span>
              </button>
            </div>

            <div className="pt-2 flex justify-end">
              <button 
                onClick={() => setModalExportar(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}