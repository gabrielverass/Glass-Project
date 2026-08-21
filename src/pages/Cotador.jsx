import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { 
  Plus, Search, Trash2, Edit3, MessageCircle, 
  CheckCircle2, Loader2, X, Calendar, FileText
} from 'lucide-react'

export default function Cotador() {
  const [cotacoes, setCotacoes] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [modalAberta, setModalAberta] = useState(false)
  const [cotacaoEmEdicao, setCotacaoEmEdicao] = useState(null)

  // Formulário Modal
  const [clienteObra, setClienteObra] = useState('')
  const [dataCotacao, setDataCotacao] = useState(new Date().toISOString().split('T')[0])
  const [status, setStatus] = useState('Aberta')
  const [observacoes, setObservacoes] = useState('')
  const [vidros, setVidros] = useState([{ id: 1, distribuidora: '', descricao: '', valor: '' }])
  const [aluminios, setAluminios] = useState([{ id: 1, distribuidora: '', descricao: '', valor: '' }])
  const [salvando, setSalvando] = useState(false)

  const carregarCotacoes = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('cotacoes')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) setCotacoes(data)
    } catch (err) {
      console.error('Erro ao buscar cotações:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarCotacoes()
  }, [])

  const addVidro = () => setVidros([...vidros, { id: Date.now(), distribuidora: '', descricao: '', valor: '' }])
  const removeVidro = (id) => setVidros(vidros.filter(v => v.id !== id))
  const updateVidro = (id, campo, val) => setVidros(vidros.map(v => v.id === id ? { ...v, [campo]: val } : v))

  const addAluminio = () => setAluminios([...aluminios, { id: Date.now(), distribuidora: '', descricao: '', valor: '' }])
  const removeAluminio = (id) => setAluminios(aluminios.filter(a => a.id !== id))
  const updateAluminio = (id, campo, val) => setAluminios(aluminios.map(a => a.id === id ? { ...a, [campo]: val } : a))

  // Agrupamentos e Menor Custo
  const calcularMelhorCombinacao = () => {
    const totaisVidros = vidros.reduce((acc, item) => {
      const dist = item.distribuidora.trim()
      const val = parseFloat(item.valor) || 0
      if (dist && val > 0) acc[dist] = (acc[dist] || 0) + val
      return acc
    }, {})

    const totaisAluminios = aluminios.reduce((acc, item) => {
      const dist = item.distribuidora.trim()
      const val = parseFloat(item.valor) || 0
      if (dist && val > 0) acc[dist] = (acc[dist] || 0) + val
      return acc
    }, {})

    let melhorVidro = { distribuidora: '-', valor: 0 }
    Object.entries(totaisVidros).forEach(([dist, val]) => {
      if (melhorVidro.valor === 0 || val < melhorVidro.valor) {
        melhorVidro = { distribuidora: dist, valor: val }
      }
    })

    let melhorAluminio = { distribuidora: '-', valor: 0 }
    Object.entries(totaisAluminios).forEach(([dist, val]) => {
      if (melhorAluminio.valor === 0 || val < melhorAluminio.valor) {
        melhorAluminio = { distribuidora: dist, valor: val }
      }
    })

    const totalGeral = (melhorVidro.valor || 0) + (melhorAluminio.valor || 0)
    return { melhorVidro, melhorAluminio, totalGeral, totaisVidros, totaisAluminios }
  }

  const melhores = calcularMelhorCombinacao()

  const abrirModalNovo = () => {
    setCotacaoEmEdicao(null)
    setClienteObra('')
    setDataCotacao(new Date().toISOString().split('T')[0])
    setStatus('Aberta')
    setObservacoes('')
    setVidros([{ id: 1, distribuidora: '', descricao: '', valor: '' }])
    setAluminios([{ id: 1, distribuidora: '', descricao: '', valor: '' }])
    setModalAberta(true)
  }

  const abrirModalEdicao = (cot) => {
    setCotacaoEmEdicao(cot)
    setClienteObra(cot.cliente_obra || '')
    setDataCotacao(cot.data_cotacao || '')
    setStatus(cot.status || 'Aberta')
    setObservacoes(cot.observacoes || '')
    setVidros(cot.vidros || [{ id: 1, distribuidora: '', descricao: '', valor: '' }])
    setAluminios(cot.aluminios || [{ id: 1, distribuidora: '', descricao: '', valor: '' }])
    setModalAberta(true)
  }

  const handleSalvar = async (e) => {
    e.preventDefault()
    if (!clienteObra.trim()) {
      alert('Informe o nome do Cliente / Obra!')
      return
    }

    setSalvando(true)
    const payload = {
      cliente_obra: clienteObra,
      data_cotacao: dataCotacao,
      status: status,
      vidros: vidros,
      aluminios: aluminios,
      melhor_combinacao: melhores,
      observacoes: observacoes,
      valor_total: melhores.totalGeral
    }

    try {
      if (cotacaoEmEdicao) {
        await supabase.from('cotacoes').update(payload).eq('id', cotacaoEmEdicao.id)
      } else {
        await supabase.from('cotacoes').insert([payload])
      }
      setModalAberta(false)
      carregarCotacoes()
    } catch (err) {
      alert('Erro ao salvar no banco de dados.')
    } finally {
      setSalvando(false)
    }
  }

  const handleExcluir = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta cotação?')) {
      await supabase.from('cotacoes').delete().eq('id', id)
      carregarCotacoes()
    }
  }

  // GERADOR DE PDF COMPARATIVO
  const gerarPdfComparativo = (c) => {
    // 1. Agrupar Vidros por Distribuidora
    const vidrosAgrupados = (c.vidros || []).reduce((acc, item) => {
      const dist = item.distribuidora?.trim() || 'Outros'
      const val = parseFloat(item.valor) || 0
      if (!acc[dist]) acc[dist] = { itens: [], subtotal: 0 }
      acc[dist].itens.push(item)
      acc[dist].subtotal += val
      return acc
    }, {})

    // 2. Agrupar Alumínios/Acessórios por Distribuidora
    const aluminiosAgrupados = (c.aluminios || []).reduce((acc, item) => {
      const dist = item.distribuidora?.trim() || 'Outros'
      const val = parseFloat(item.valor) || 0
      if (!acc[dist]) acc[dist] = { itens: [], subtotal: 0 }
      acc[dist].itens.push(item)
      acc[dist].subtotal += val
      return acc
    }, {})

    // 3. Gerar Matriz de Todas as Combinações
    const combinacoes = []
    const distVidros = Object.keys(vidrosAgrupados)
    const distAluminios = Object.keys(aluminiosAgrupados)

    if (distVidros.length > 0 && distAluminios.length > 0) {
      distVidros.forEach(vDist => {
        distAluminios.forEach(aDist => {
          const vSub = vidrosAgrupados[vDist].subtotal
          const aSub = aluminiosAgrupados[aDist].subtotal
          combinacoes.push({
            nome: `${vDist} + ${aDist}`,
            vidro: vSub,
            aluminio: aSub,
            total: vSub + aSub
          })
        })
      })
    }

    // Identificar Menor Custo
    let melhorOpcao = null
    if (combinacoes.length > 0) {
      melhorOpcao = combinacoes.reduce((min, atual) => atual.total < min.total ? atual : min, combinacoes[0])
    }

    const dataFormatada = c.data_cotacao ? new Date(c.data_cotacao).toLocaleDateString('pt-BR') : '-'

    // Janela de Impressão Formatada
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Orçamento Comparativo - ${c.cliente_obra}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #1e293b; padding: 40px; margin: 0; }
          .header { border-bottom: 2px solid #0284c7; padding-bottom: 15px; margin-bottom: 25px; }
          .title { font-size: 18px; font-weight: 800; color: #0f172a; text-transform: uppercase; margin: 0 0 8px 0; letter-spacing: 0.5px; }
          .meta { font-size: 13px; color: #475569; margin: 2px 0; }
          .section-title { font-size: 13px; font-weight: 800; color: #0369a1; text-transform: uppercase; margin: 20px 0 10px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
          .dist-block { margin-bottom: 12px; }
          .dist-name { font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
          .item-row { display: flex; justify-content: space-between; font-size: 12px; color: #334155; padding: 2px 0; }
          .subtotal-row { display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; color: #0f172a; border-top: 1px dashed #cbd5e1; margin-top: 4px; padding-top: 3px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
          th { background: #f1f5f9; color: #334155; font-weight: 700; text-align: left; padding: 8px 10px; border: 1px solid #cbd5e1; }
          td { padding: 7px 10px; border: 1px solid #cbd5e1; color: #1e293b; }
          .text-right { text-align: right; }
          .highlight { background: #f0fdf4; font-weight: 700; }
          .footer-box { margin-top: 25px; padding: 14px; background: #f8fafc; border: 1px solid #94a3b8; border-radius: 6px; font-size: 13px; }
          .best-choice { font-weight: 800; color: #15803d; }
          .watermark { margin-top: 40px; text-align: center; font-size: 10px; color: #94a3b8; font-family: monospace; }
          @media print {
            body { padding: 20px; }
            @page { margin: 1.5cm; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">ORÇAMENTO COMPARATIVO - VIDRAÇARIA E ESQUADRIAS</div>
          <div class="meta"><strong>Cliente:</strong> ${c.cliente_obra}</div>
          <div class="meta"><strong>Data:</strong> ${dataFormatada}</div>
        </div>

        <div class="section-title">COTAÇÃO DE VIDROS</div>
        ${Object.entries(vidrosAgrupados).map(([dist, dados]) => `
          <div class="dist-block">
            <div class="dist-name">${dist}</div>
            ${dados.itens.map(it => `
              <div class="item-row">
                <span>${it.descricao || 'Item de vidro'}</span>
                <span>R$ ${parseFloat(it.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            `).join('')}
            <div class="subtotal-row">
              <span>Subtotal</span>
              <span>R$ ${dados.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        `).join('')}

        <div class="section-title">COTAÇÃO DE BARRAS E ACESSÓRIOS</div>
        ${Object.entries(aluminiosAgrupados).map(([dist, dados]) => `
          <div class="dist-block">
            <div class="dist-name">${dist}</div>
            ${dados.itens.map(it => `
              <div class="item-row">
                <span>${it.descricao || 'Item de perfil/acessório'}</span>
                <span>R$ ${parseFloat(it.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            `).join('')}
            <div class="subtotal-row">
              <span>Subtotal</span>
              <span>R$ ${dados.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        `).join('')}

        <div class="section-title">OPÇÕES COMBINADAS</div>
        <table>
          <thead>
            <tr>
              <th>Combinação</th>
              <th class="text-right">Vidros</th>
              <th class="text-right">Acessórios</th>
              <th class="text-right">Total final</th>
            </tr>
          </thead>
          <tbody>
            ${combinacoes.map(comb => {
              const isBest = melhorOpcao && comb.nome === melhorOpcao.nome
              return `
                <tr class="${isBest ? 'highlight' : ''}">
                  <td>${comb.nome} ${isBest ? '★' : ''}</td>
                  <td class="text-right">R$ ${comb.vidro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td class="text-right">R$ ${comb.aluminio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td class="text-right"><strong>R$ ${comb.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></td>
                </tr>
              `
            }).join('')}
          </tbody>
        </table>

        ${melhorOpcao ? `
          <div class="footer-box">
            <span class="best-choice">Melhor custo-benefício:</span> ${melhorOpcao.nome} — <strong>R$ ${melhorOpcao.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
          </div>
        ` : ''}

        ${c.observacoes ? `
          <div style="margin-top: 15px; font-size: 11px; color: #64748b;">
            <strong>Observações:</strong> ${c.observacoes}
          </div>
        ` : ''}

        <div class="watermark">
          Gerado por Millenium Glass Esquadrias • Powered by Gv Dev Systems
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `)
    printWindow.document.close()
  }

  const compartilharWhatsApp = (c) => {
    const vDist = c.melhor_combinacao?.melhorVidro?.distribuidora || '-'
    const vVal = c.melhor_combinacao?.melhorVidro?.valor?.toFixed(2) || '0.00'
    const aDist = c.melhor_combinacao?.melhorAluminio?.distribuidora || '-'
    const aVal = c.melhor_combinacao?.melhorAluminio?.valor?.toFixed(2) || '0.00'
    const total = c.valor_total?.toFixed(2) || '0.00'

    const texto = `*MILLENIUM GLASS - LEVANTAMENTO DE INSUMOS*\n` +
      `📌 *Obra:* ${c.cliente_obra}\n` +
      `📅 *Data:* ${new Date(c.data_cotacao).toLocaleDateString('pt-BR')}\n` +
      `--------------------------------\n` +
      `💎 *Vidros:* ${vDist} (R$ ${vVal})\n` +
      `🛠 *Alumínios/Acessórios:* ${aDist} (R$ ${aVal})\n` +
      `--------------------------------\n` +
      `💰 *MENOR CUSTO COMBINADO:* R$ ${total}\n` +
      (c.observacoes ? `📝 *Obs:* ${c.observacoes}\n` : '')

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`, '_blank')
  }

  const cotacoesFiltradas = cotacoes.filter(c => 
    c.cliente_obra?.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Topo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Cotador de Insumos</h1>
          <p className="text-sm text-slate-500">Lance os orçamentos de distribuidores para fechar pelo menor custo combinado.</p>
        </div>
        <button 
          onClick={abrirModalNovo}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl shadow transition flex items-center gap-2 text-sm cursor-pointer"
        >
          <Plus size={18} /> Nova Cotação
        </button>
      </div>

      {/* Barra de Pesquisa */}
      <div className="relative">
        <Search size={18} className="absolute left-3.5 top-3 text-slate-400" />
        <input 
          type="text" placeholder="Buscar por cliente / obra..."
          value={busca} onChange={e => setBusca(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      {/* Cards de Cotações */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400 text-sm gap-2">
          <Loader2 className="animate-spin" size={20} /> Carregando cotações...
        </div>
      ) : cotacoesFiltradas.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed border-slate-300 rounded-2xl p-8">
          <p className="text-sm text-slate-500">Nenhuma cotação encontrada.</p>
          <button onClick={abrirModalNovo} className="mt-3 text-sm font-semibold text-blue-600 hover:underline">
            + Criar a primeira cotação de insumos
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cotacoesFiltradas.map((c) => {
            const vComb = c.melhor_combinacao?.melhorVidro
            const aComb = c.melhor_combinacao?.melhorAluminio

            return (
              <div key={c.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition">
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">{c.cliente_obra}</h3>
                    <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Calendar size={12} /> Cotada em {new Date(c.data_cotacao).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                    c.status === 'Fechada' ? 'bg-emerald-100 text-emerald-700' :
                    c.status === 'Cancelada' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    • {c.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium block mb-1">VIDROS</span>
                    {c.vidros && c.vidros.length > 0 ? (
                      c.vidros.map((v, idx) => (
                        <div key={idx} className="flex justify-between py-0.5 text-slate-700 font-medium">
                          <span className="truncate pr-1">{v.distribuidora || '-'}</span>
                          <span className="font-bold">R$ {parseFloat(v.valor || 0).toFixed(2)}</span>
                        </div>
                      ))
                    ) : <span className="text-slate-400 italic">Sem itens</span>}
                  </div>

                  <div>
                    <span className="text-slate-400 font-medium block mb-1">ACESSÓRIOS / ALUMÍNIO</span>
                    {c.aluminios && c.aluminios.length > 0 ? (
                      c.aluminios.map((a, idx) => (
                        <div key={idx} className="flex justify-between py-0.5 text-slate-700 font-medium">
                          <span className="truncate pr-1">{a.distribuidora || '-'}</span>
                          <span className="font-bold">R$ {parseFloat(a.valor || 0).toFixed(2)}</span>
                        </div>
                      ))
                    ) : <span className="text-slate-400 italic">Sem itens</span>}
                  </div>
                </div>

                <div className="bg-slate-900 text-white rounded-xl p-3.5 my-3">
                  <span className="text-[10px] uppercase tracking-wider text-blue-400 font-bold block">
                    Menor Custo Combinado
                  </span>
                  <div className="text-lg font-extrabold text-white mt-0.5">
                    R$ {parseFloat(c.valor_total || 0).toFixed(2)}
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1">
                    {vComb?.distribuidora !== '-' ? vComb?.distribuidora : 'Vidro'} + {aComb?.distribuidora !== '-' ? aComb?.distribuidora : 'Acessórios'}
                  </p>
                </div>

                {c.observacoes && (
                  <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded-lg mb-3">
                    "{c.observacoes}"
                  </p>
                )}

                {/* Botões de Ação */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => gerarPdfComparativo(c)}
                      className="flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                    >
                      <FileText size={15} /> Gerar PDF
                    </button>
                    <button 
                      onClick={() => compartilharWhatsApp(c)}
                      className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                    >
                      <MessageCircle size={15} /> WhatsApp
                    </button>
                  </div>

                  <div className="flex gap-1">
                    <button 
                      onClick={() => abrirModalEdicao(c)}
                      className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                      title="Editar"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button 
                      onClick={() => handleExcluir(c.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {modalAberta && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in">
            
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-base font-bold text-slate-800">
                  {cotacaoEmEdicao ? 'Editar Cotação de Insumos' : 'Nova Cotação de Insumos'}
                </h2>
                <p className="text-xs text-slate-500">Lance os preços de cada distribuidora — o menor custo é calculado automaticamente.</p>
              </div>
              <button onClick={() => setModalAberta(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSalvar} className="flex-1 flex flex-col overflow-hidden">
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Cliente / Obra</label>
                    <input 
                      type="text" required placeholder="Ex.: Residencial Vila Nova - Box e Janelas"
                      value={clienteObra} onChange={e => setClienteObra(e.target.value)}
                      className="w-full p-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Data da cotação</label>
                      <input 
                        type="date" required value={dataCotacao} onChange={e => setDataCotacao(e.target.value)}
                        className="w-full p-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                      <select 
                        value={status} onChange={e => setStatus(e.target.value)}
                        className="w-full p-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      >
                        <option value="Aberta">Aberta</option>
                        <option value="Fechada">Fechada</option>
                        <option value="Cancelada">Cancelada</option>
                      </select>
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Vidros */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Vidros — Distribuidoras</h3>
                    <button type="button" onClick={addVidro} className="text-xs flex items-center gap-1 text-blue-600 font-semibold hover:bg-blue-50 px-2 py-1 rounded-lg">
                      <Plus size={14} /> Item
                    </button>
                  </div>
                  <div className="space-y-2">
                    {vidros.map((item) => (
                      <div key={item.id} className="flex gap-2 items-center">
                        <input type="text" placeholder="Distribuidora (ex: ExtraGlass)" value={item.distribuidora} onChange={e => updateVidro(item.id, 'distribuidora', e.target.value)} className="flex-1 p-2 border border-slate-300 rounded-lg text-sm" />
                        <input type="text" placeholder="Descrição do item" value={item.descricao} onChange={e => updateVidro(item.id, 'descricao', e.target.value)} className="flex-[1.5] p-2 border border-slate-300 rounded-lg text-sm" />
                        <div className="relative w-32">
                          <span className="absolute left-3 top-2 text-slate-400 text-xs font-bold">R$</span>
                          <input type="number" step="0.01" placeholder="0,00" value={item.valor} onChange={e => updateVidro(item.id, 'valor', e.target.value)} className="w-full pl-8 p-2 border border-slate-300 rounded-lg text-sm" />
                        </div>
                        <button type="button" onClick={() => removeVidro(item.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Alumínio / Acessórios */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Acessórios / Alumínio — Distribuidoras</h3>
                    <button type="button" onClick={addAluminio} className="text-xs flex items-center gap-1 text-blue-600 font-semibold hover:bg-blue-50 px-2 py-1 rounded-lg">
                      <Plus size={14} /> Item
                    </button>
                  </div>
                  <div className="space-y-2">
                    {aluminios.map((item) => (
                      <div key={item.id} className="flex gap-2 items-center">
                        <input type="text" placeholder="Distribuidora (ex: Aço Alumínio)" value={item.distribuidora} onChange={e => updateAluminio(item.id, 'distribuidora', e.target.value)} className="flex-1 p-2 border border-slate-300 rounded-lg text-sm" />
                        <input type="text" placeholder="Descrição do item" value={item.descricao} onChange={e => updateAluminio(item.id, 'descricao', e.target.value)} className="flex-[1.5] p-2 border border-slate-300 rounded-lg text-sm" />
                        <div className="relative w-32">
                          <span className="absolute left-3 top-2 text-slate-400 text-xs font-bold">R$</span>
                          <input type="number" step="0.01" placeholder="0,00" value={item.valor} onChange={e => updateAluminio(item.id, 'valor', e.target.value)} className="w-full pl-8 p-2 border border-slate-300 rounded-lg text-sm" />
                        </div>
                        <button type="button" onClick={() => removeAluminio(item.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resultado */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
                  <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-blue-600" /> Melhor combinação calculada
                  </h3>
                  {melhores.totalGeral > 0 ? (
                    <div className="text-xs text-blue-800 space-y-1 ml-6 font-medium">
                      {melhores.melhorVidro.valor > 0 && (
                        <p>Vidros: <strong>{melhores.melhorVidro.distribuidora}</strong> — R$ {melhores.melhorVidro.valor.toFixed(2)}</p>
                      )}
                      {melhores.melhorAluminio.valor > 0 && (
                        <p>Acessórios: <strong>{melhores.melhorAluminio.distribuidora}</strong> — R$ {melhores.melhorAluminio.valor.toFixed(2)}</p>
                      )}
                      <div className="pt-2 mt-2 border-t border-blue-200/60">
                        <p className="font-bold text-sm text-blue-950">Total Combinado: R$ {melhores.totalGeral.toFixed(2)}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-blue-600 ml-6">Preencha os valores para calcular a melhor combinação.</p>
                  )}
                </div>

                {/* Observações */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Observações</label>
                  <textarea 
                    rows="3" placeholder="Prazos, condições de pagamento, pendências..."
                    value={observacoes} onChange={e => setObservacoes(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  ></textarea>
                </div>

              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                <button 
                  type="button" onClick={() => setModalAberta(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" disabled={salvando}
                  className="px-6 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {salvando ? <Loader2 className="animate-spin" size={14} /> : 'Salvar Cotação'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  )
}