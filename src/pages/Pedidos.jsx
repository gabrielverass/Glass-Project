import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { 
  ShoppingBag, Plus, Search, Trash2, Edit3, 
  Printer, FileText, Loader2, X, Filter, Calendar
} from 'lucide-react'

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtroMes, setFiltroMes] = useState('todos')
  const [filtroAno, setFiltroAno] = useState('2026')
  const [modalAberta, setModalAberta] = useState(false)
  const [pedidoEmEdicao, setPedidoEmEdicao] = useState(null)

  // Formulário
  const [cliente, setCliente] = useState('')
  const [telefone, setTelefone] = useState('')
  const [servico, setServico] = useState('')
  const [valorTotal, setValorTotal] = useState('')
  const [canal, setCanal] = useState('WhatsApp')
  const [statusProducao, setStatusProducao] = useState('Fila de Demanda')
  const [statusPagamento, setStatusPagamento] = useState('Pendente')
  const [observacoes, setObservacoes] = useState('')
  const [salvando, setSalvando] = useState(false)

  const carregarPedidos = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) setPedidos(data)
    } catch (err) {
      console.error('Erro ao buscar pedidos:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarPedidos()
  }, [])

  const abrirModalNovo = () => {
    setPedidoEmEdicao(null)
    setCliente('')
    setTelefone('')
    setServico('')
    setValorTotal('')
    setCanal('WhatsApp')
    setStatusProducao('Fila de Demanda')
    setStatusPagamento('Pendente')
    setObservacoes('')
    setModalAberta(true)
  }

  const abrirModalEdicao = (p) => {
    setPedidoEmEdicao(p)
    setCliente(p.cliente || '')
    setTelefone(p.telefone || '')
    setServico(p.servico || p.descricao || '')
    setValorTotal(p.valor_total || '')
    setCanal(p.canal || 'WhatsApp')
    setStatusProducao(p.status_producao || p.status || 'Fila de Demanda')
    setStatusPagamento(p.status_pagamento || 'Pendente')
    setObservacoes(p.observacoes || '')
    setModalAberta(true)
  }

  const handleSalvar = async (e) => {
    e.preventDefault()
    if (!cliente.trim() || !valorTotal) {
      alert('Preencha o cliente e o valor total!')
      return
    }

    setSalvando(true)
    const payload = {
      cliente: cliente.trim(),
      telefone: telefone.trim(),
      servico: servico.trim(),
      valor_total: parseFloat(valorTotal) || 0,
      canal: canal,
      status_producao: statusProducao,
      status_pagamento: statusPagamento,
      observacoes: observacoes.trim()
    }

    try {
      if (pedidoEmEdicao) {
        await supabase.from('pedidos').update(payload).eq('id', pedidoEmEdicao.id)
      } else {
        await supabase.from('pedidos').insert([payload])
      }
      setModalAberta(false)
      carregarPedidos()
    } catch (err) {
      alert('Erro ao salvar pedido.')
    } finally {
      setSalvando(false)
    }
  }

  const handleExcluir = async (id) => {
    if (window.confirm('Deseja excluir este pedido?')) {
      await supabase.from('pedidos').delete().eq('id', id)
      carregarPedidos()
    }
  }

  // 1. GERAR COMPROVANTE INDIVIDUAL / ORDEM DE SERVIÇO (PDF)
  const imprimirPedidoIndividual = (p) => {
    const printWindow = window.open('', '_blank')
    const formatBRL = (v) => (parseFloat(v) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Ordem de Serviço - #PED-${p.id}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
          body { font-family: 'Inter', sans-serif; color: #1e293b; padding: 40px; margin: 0; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0284c7; padding-bottom: 12px; margin-bottom: 25px; }
          .company { font-size: 18px; font-weight: 800; color: #0f172a; }
          .badge { background: #0284c7; color: white; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; }
          .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 15px; }
          .box-title { font-size: 11px; font-weight: 800; color: #0284c7; text-transform: uppercase; margin-bottom: 8px; }
          .field { font-size: 12px; margin-bottom: 5px; }
          .total-box { margin-top: 25px; padding: 15px; background: #0f172a; color: white; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; }
          .total-val { font-size: 20px; font-weight: 800; color: #38bdf8; }
          .signatures { margin-top: 60px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; text-align: center; font-size: 11px; color: #64748b; }
          .sig-line { border-top: 1px solid #94a3b8; padding-top: 5px; }
          @media print { @page { margin: 1.5cm; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="company">MILLENIUM GLASS ESQUADRIAS</div>
            <div style="font-size: 11px; color: #64748b;">Comprovante de Pedido & Ordem de Execução</div>
          </div>
          <span class="badge">#PED-${p.id}</span>
        </div>

        <div class="box">
          <div class="box-title">Dados do Cliente & Contato</div>
          <div class="field"><strong>Cliente:</strong> ${p.cliente}</div>
          <div class="field"><strong>Telefone / WhatsApp:</strong> ${p.telefone || 'Não informado'}</div>
          <div class="field"><strong>Canal de Atendimento:</strong> ${p.canal || 'WhatsApp'}</div>
          <div class="field"><strong>Data de Entrada:</strong> ${new Date(p.created_at || new Date()).toLocaleDateString('pt-BR')}</div>
        </div>

        <div class="box">
          <div class="box-title">Descrição do Serviço / Medidas</div>
          <div class="field" style="font-size: 13px; font-weight: 600; line-height: 1.5;">${p.servico || p.descricao || 'Conforme projeto e levantamento técnico'}</div>
          ${p.observacoes ? `<div class="field" style="margin-top: 8px; color: #64748b; font-style: italic;">Obs: ${p.observacoes}</div>` : ''}
        </div>

        <div class="box">
          <div class="box-title">Status Operacional</div>
          <div class="field"><strong>Etapa de Produção:</strong> ${p.status_producao || p.status || 'Fila de Demanda'}</div>
          <div class="field"><strong>Situação Financeira:</strong> ${p.status_pagamento || 'Pendente'}</div>
        </div>

        <div class="total-box">
          <span style="font-size: 13px; font-weight: 700; text-transform: uppercase;">Valor Total da Obra</span>
          <span class="total-val">R$ ${formatBRL(p.valor_total)}</span>
        </div>

        <div class="signatures">
          <div><div class="sig-line">Millenium Glass Esquadrias</div></div>
          <div><div class="sig-line">Assinatura do Cliente</div></div>
        </div>

        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `)
    printWindow.document.close()
  }

  // 2. GERAR RELATÓRIO GERAL DE PEDIDOS FILTRADO (PDF)
  const imprimirRelatorioGeral = () => {
    const printWindow = window.open('', '_blank')
    const formatBRL = (v) => (parseFloat(v) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
    const totalSoma = pedidosFiltrados.reduce((acc, p) => acc + (parseFloat(p.valor_total) || 0), 0)

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Relação de Pedidos - Millenium Glass</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
          body { font-family: 'Inter', sans-serif; color: #1e293b; padding: 30px; margin: 0; -webkit-print-color-adjust: exact; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0284c7; padding-bottom: 10px; margin-bottom: 20px; }
          .title { font-size: 16px; font-weight: 800; color: #0f172a; text-transform: uppercase; }
          table { width: 100%; border-collapse: collapse; font-size: 10.5px; margin-top: 10px; }
          th { background: #f1f5f9; color: #334155; font-weight: 700; text-align: left; padding: 6px 8px; border: 1px solid #cbd5e1; }
          td { padding: 6px 8px; border: 1px solid #cbd5e1; color: #1e293b; }
          .text-right { text-align: right; }
          .total-row { background: #f8fafc; font-weight: 800; }
          @media print { @page { margin: 1cm; size: landscape; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">Millenium Glass • Relação e Levantamento de Pedidos</div>
            <div style="font-size: 11px; color: #64748b;">Filtro: ${filtroMes === 'todos' ? 'Ano Inteiro' : 'Mês ' + filtroMes} / ${filtroAno} | Total: ${pedidosFiltrados.length} obras</div>
          </div>
          <div style="font-size: 10px; color: #64748b; text-align: right;">
            Gerado em: ${new Date().toLocaleDateString('pt-BR')}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Cód</th>
              <th>Cliente</th>
              <th>Telefone</th>
              <th>Serviço / Projeto</th>
              <th>Canal</th>
              <th>Produção</th>
              <th>Pagamento</th>
              <th class="text-right">Valor Total</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            ${pedidosFiltrados.map(p => `
              <tr>
                <td>#PED-${p.id}</td>
                <td><strong>${p.cliente}</strong></td>
                <td>${p.telefone || '-'}</td>
                <td>${p.servico || p.descricao || '-'}</td>
                <td>${p.canal || 'WhatsApp'}</td>
                <td>${p.status_producao || p.status || '-'}</td>
                <td>${p.status_pagamento || '-'}</td>
                <td class="text-right"><strong>R$ ${formatBRL(p.valor_total)}</strong></td>
                <td>${new Date(p.created_at || new Date()).toLocaleDateString('pt-BR')}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="7" class="text-right">TOTAL GERAL:</td>
              <td class="text-right" style="color: #0284c7;">R$ ${formatBRL(totalSoma)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `)
    printWindow.document.close()
  }

  // Filtro por Busca, Mês e Ano
  const pedidosFiltrados = pedidos.filter(p => {
    const dataP = new Date(p.created_at || new Date())
    const mesP = String(dataP.getMonth() + 1).padStart(2, '0')
    const anoP = String(dataP.getFullYear())

    if (filtroAno !== 'todos' && anoP !== filtroAno) return false
    if (filtroMes !== 'todos' && mesP !== filtroMes) return false
    if (busca && !p.cliente?.toLowerCase().includes(busca.toLowerCase())) return false

    return true
  })

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Topo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pedidos & Vendas</h1>
          <p className="text-sm text-slate-500">Gestão de obras, geração de Ordens de Serviço e relatórios mensais.</p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={imprimirRelatorioGeral}
            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-3.5 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2 text-xs cursor-pointer"
          >
            <Printer size={15} /> Relatório de Pedidos (PDF)
          </button>
          <button 
            onClick={abrirModalNovo}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl shadow transition flex items-center gap-2 text-xs cursor-pointer"
          >
            <Plus size={16} /> Novo Pedido
          </button>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          <input 
            type="text" placeholder="Buscar por cliente..."
            value={busca} onChange={e => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-semibold flex items-center gap-1"><Filter size={13} /> Filtrar:</span>
          <select 
            value={filtroMes} onChange={e => setFiltroMes(e.target.value)}
            className="p-2 border border-slate-300 rounded-xl bg-white outline-none"
          >
            <option value="todos">Todos os Meses</option>
            <option value="01">Janeiro</option>
            <option value="02">Fevereiro</option>
            <option value="03">Março</option>
            <option value="04">Abril</option>
            <option value="05">Maio</option>
            <option value="06">Junho</option>
            <option value="07">Julho</option>
            <option value="08">Agosto</option>
            <option value="09">Setembro</option>
            <option value="10">Outubro</option>
            <option value="11">Novembro</option>
            <option value="12">Dezembro</option>
          </select>

          <select 
            value={filtroAno} onChange={e => setFiltroAno(e.target.value)}
            className="p-2 border border-slate-300 rounded-xl bg-white outline-none"
          >
            <option value="todos">Todos os Anos</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
          </select>
        </div>
      </div>

      {/* Tabela de Pedidos */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400 text-sm gap-2">
          <Loader2 className="animate-spin" size={20} /> Carregando pedidos...
        </div>
      ) : pedidosFiltrados.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed border-slate-300 rounded-2xl p-8">
          <p className="text-sm text-slate-500">Nenhum pedido encontrado para o período.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Cód</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Serviço</th>
                  <th className="py-3 px-4">Canal</th>
                  <th className="py-3 px-4">Produção</th>
                  <th className="py-3 px-4">Pagamento</th>
                  <th className="py-3 px-4 text-right">Valor Total</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {pedidosFiltrados.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-500">#PED-{p.id}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {p.cliente}
                      {p.telefone && <span className="block text-[10px] text-slate-400">{p.telefone}</span>}
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{p.servico || p.descricao || '-'}</td>
                    <td className="py-3 px-4">{p.canal || 'WhatsApp'}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700">
                        {p.status_producao || p.status || 'Fila de Demanda'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                        {p.status_pagamento || 'Pendente'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      R$ {(parseFloat(p.valor_total) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button 
                          onClick={() => imprimirPedidoIndividual(p)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                          title="Gerar Comprovante / O.S. (PDF)"
                        >
                          <Printer size={15} />
                        </button>
                        <button 
                          onClick={() => abrirModalEdicao(p)}
                          className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                          title="Editar"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button 
                          onClick={() => handleExcluir(p.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Criar/Editar */}
      {modalAberta && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4 animate-in fade-in">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-800">
                {pedidoEmEdicao ? 'Editar Pedido' : 'Novo Pedido de Obra'}
              </h2>
              <button onClick={() => setModalAberta(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>

            <form onSubmit={handleSalvar} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Cliente</label>
                <input type="text" required value={cliente} onChange={e => setCliente(e.target.value)} placeholder="Nome do cliente" className="w-full p-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-500" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Telefone / WhatsApp</label>
                  <input type="text" value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="(85) 99999-9999" className="w-full p-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Valor Total (R$)</label>
                  <input type="number" step="0.01" required value={valorTotal} onChange={e => setValorTotal(e.target.value)} placeholder="0.00" className="w-full p-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Serviço / Projeto</label>
                <input type="text" value={servico} onChange={e => setServico(e.target.value)} placeholder="Ex: Box frontal 8mm incolor" className="w-full p-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-500" />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Canal</label>
                  <select value={canal} onChange={e => setCanal(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white">
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Google">Google</option>
                    <option value="OLX">OLX</option>
                    <option value="Indicação">Indicação</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Produção</label>
                  <select value={statusProducao} onChange={e => setStatusProducao(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white">
                    <option value="Fila de Demanda">Fila</option>
                    <option value="Em Produção">Em Produção</option>
                    <option value="Pronto para Instalação">Pronto</option>
                    <option value="Instalado / Concluído">Instalado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Pagamento</label>
                  <select value={statusPagamento} onChange={e => setStatusPagamento(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white">
                    <option value="Pendente">Pendente</option>
                    <option value="Entrada 50%">Entrada 50%</option>
                    <option value="Pago Integral">Pago Integral</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Observações</label>
                <textarea rows="2" value={observacoes} onChange={e => setObservacoes(e.target.value)} placeholder="Detalhes técnicos ou de entrega..." className="w-full p-2 border border-slate-300 rounded-lg text-xs outline-none resize-none" />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setModalAberta(false)} className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
                <button type="submit" disabled={salvando} className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1">
                  {salvando ? <Loader2 className="animate-spin" size={13} /> : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}