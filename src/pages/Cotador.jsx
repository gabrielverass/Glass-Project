import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Calculator, DollarSign, Save, CheckCircle, Loader2, FileText, Send } from 'lucide-react'

export default function Cotador() {
  const [vidrosEstoque, setVidrosEstoque] = useState([])
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso] = useState('')

  // Dados do formulário
  const [cliente, setCliente] = useState('')
  const [telefone, setTelefone] = useState('')
  const [vidroSelecionado, setVidroSelecionado] = useState('')
  const [largura, setLargura] = useState('')
  const [altura, setAltura] = useState('')
  const [quantidade, setQuantidade] = useState('1')
  const [maoDeObra, setMaoDeObra] = useState('0')
  const [margemLucro, setMargemLucro] = useState('30')

  useEffect(() => {
    carregarVidros()
  }, [])

  const carregarVidros = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('estoque')
        .select('*')
        .eq('categoria', 'Vidros')

      if (!error && data) {
        setVidrosEstoque(data)
        if (data.length > 0) setVidroSelecionado(data[0].id)
      }
    } catch (err) {
      console.error('Erro ao carregar vidros:', err)
    } finally {
      setLoading(false)
    }
  }

  // Cálculos Automáticos
  const itemVidro = vidrosEstoque.find(v => String(v.id) === String(vidroSelecionado))
  const largNum = Number(largura || 0)
  const altNum = Number(altura || 0)
  const qtdNum = Number(quantidade || 1)

  const areaM2Unitario = largNum * altNum
  const areaM2Total = areaM2Unitario * qtdNum

  const precoCustoM2 = itemVidro ? Number(itemVidro.preco_custo || 0) : 0
  const precoVendaM2 = itemVidro ? Number(itemVidro.preco_venda || 0) : 0

  const custoVidroTotal = areaM2Total * precoCustoM2
  const valorBaseVenda = areaM2Total * precoVendaM2
  const valorMaoObra = Number(maoDeObra || 0)
  const porcentagemExtra = Number(margemLucro || 0) / 100

  const subtotal = valorBaseVenda + valorMaoObra
  const valorTotalOrcamento = subtotal + (subtotal * porcentagemExtra)

  // Salvar Orçamento
  const handleSalvarCotacao = async (e) => {
    if (e) e.preventDefault()
    if (!cliente.trim()) {
      alert('Informe o nome do cliente para salvar o orçamento.')
      return
    }

    setSalvando(true)
    setSucesso('')

    try {
      const novaCotacao = {
        cliente: cliente.trim(),
        descricao: `${qtdNum}x ${itemVidro?.nome || 'Vidro'} (${largNum}m x ${altNum}m)`,
        largura: largNum,
        altura: altNum,
        area_m2: areaM2Total,
        valor_total: valorTotalOrcamento,
        status: 'Orçamento'
      }

      const { error } = await supabase.from('cotacoes').insert([novaCotacao])

      if (!error) {
        setSucesso('Orçamento salvo com sucesso!')
        setTimeout(() => setSucesso(''), 4000)
      } else {
        alert(`Erro ao salvar: ${error.message}`)
      }
    } catch (err) {
      alert('Erro de conexão ao salvar cotação.')
    } finally {
      setSalvando(false)
    }
  }

  // GERAR PDF COM LAYOUT PROFISSIONAL
  const handleGerarPDF = () => {
    if (!cliente.trim()) {
      alert('Preencha pelo menos o nome do cliente para gerar o PDF.')
      return
    }

    const dataAtual = new Date().toLocaleDateString('pt-BR')
    const janelaImpressao = window.open('', '_blank', 'width=800,height=900')

    const conteudoHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Orçamento - Millenium Glass Esquadrias</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; padding: 40px; margin: 0; }
            .header { border-b: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .logo { font-size: 24px; font-weight: bold; color: #1e3a8a; }
            .sub { font-size: 13px; color: #64748b; margin-top: 4px; }
            .doc-title { text-align: right; font-size: 20px; font-weight: bold; color: #2563eb; }
            .info-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; rounded-radius: 8px; margin-bottom: 30px; display: flex; justify-content: space-between; }
            table { w-full; width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background: #f1f5f9; text-align: left; padding: 12px; font-size: 13px; color: #475569; border-bottom: 2px solid #cbd5e1; }
            td { padding: 12px; font-size: 14px; border-bottom: 1px solid #e2e8f0; }
            .total-card { background: #0f172a; color: white; padding: 20px; border-radius: 8px; text-align: right; }
            .total-title { font-size: 12px; color: #94a3b8; text-transform: uppercase; }
            .total-value { font-size: 28px; font-weight: bold; color: #34d399; margin-top: 5px; }
            .footer { margin-top: 50px; font-size: 12px; color: #94a3b8; text-align: center; border-t: 1px solid #e2e8f0; padding-top: 20px; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">Millenium Glass Esquadrias</div>
              <div class="sub">Gestão & Soluções em Vidros e Esquadrias</div>
            </div>
            <div>
              <div class="doc-title">ORÇAMENTO</div>
              <div class="sub">Data: ${dataAtual}</div>
            </div>
          </div>

          <div class="info-box">
            <div>
              <strong>CLIENTE:</strong> ${cliente}<br>
              ${telefone ? `<strong>CONTATO:</strong> ${telefone}` : ''}
            </div>
            <div>
              <strong>VALIDADE:</strong> 10 dias
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Especificação do Material</th>
                <th>Dimensões</th>
                <th>Qtd</th>
                <th>Área Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${itemVidro?.nome || 'Vidro Personalizado'}</strong></td>
                <td>${largNum}m (L) x ${altNum}m (A)</td>
                <td>${qtdNum}</td>
                <td>${areaM2Total.toFixed(2)} m²</td>
              </tr>
            </tbody>
          </table>

          <div class="total-card">
            <div class="total-title">Valor Total da Proposta</div>
            <div class="total-value">R$ ${valorTotalOrcamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </div>

          <div class="footer">
            <p>Agradecemos a preferência! Dúvidas ou confirmações, entre em contato conosco.</p>
            <p>Millenium Glass Esquadrias • Qualidade e Segurança</p>
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `

    janelaImpressao.document.write(conteudoHTML)
    janelaImpressao.document.close()
  }

  // ENVIAR VIA WHATSAPP
  const handleEnviarWhatsApp = () => {
    if (!cliente.trim()) {
      alert('Informe o nome do cliente para enviar pelo WhatsApp.')
      return
    }

    const mensagem = `Olá *${cliente}*! Tudo bem?%0A%0A` +
      `Segue a cotação da *Millenium Glass Esquadrias*:%0A%0A` +
      `📌 *Item:* ${qtdNum}x ${itemVidro?.nome || 'Vidro'} (${largNum}m x ${altNum}m)%0A` +
      `📐 *Área Total:* ${areaM2Total.toFixed(2)} m²%0A` +
      `💰 *Valor Total:* R$ ${valorTotalOrcamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}%0A%0A` +
      `Ficamos à disposição para agendar a medição e instalação!`

    const numLimpo = telefone.replace(/\D/g, '')
    const url = numLimpo ? `https://wa.me/55${numLimpo}?text=${mensagem}` : `https://wa.me/?text=${mensagem}`
    window.open(url, '_blank')
  }

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Cotador de Insumos e Esquadrias</h1>
        <p className="text-slate-500 text-sm">Calcule o preço exato de projetos e gere propostas em PDF.</p>
      </div>

      {sucesso && (
        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-200 flex items-center gap-2 font-medium text-sm">
          <CheckCircle size={18} /> {sucesso}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulário de Cálculo */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calculator size={20} className="text-blue-600" /> Parâmetros da Medida
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nome do Cliente / Projeto *</label>
                <input 
                  type="text" 
                  placeholder="Ex: Gabriel Veras"
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Telefone / WhatsApp (Opcional)</label>
                <input 
                  type="text" 
                  placeholder="(85) 98888-7777"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Selecione o Vidro do Estoque</label>
              {loading ? (
                <div className="text-sm text-slate-400 flex items-center gap-2"><Loader2 className="animate-spin" size={16}/> Carregando estoque...</div>
              ) : vidrosEstoque.length === 0 ? (
                <p className="text-xs text-amber-600">Nenhum vidro cadastrado no Estoque na categoria 'Vidros'.</p>
              ) : (
                <select 
                  value={vidroSelecionado}
                  onChange={(e) => setVidroSelecionado(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-600 focus:outline-none bg-white"
                >
                  {vidrosEstoque.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.nome} - (R$ {Number(v.preco_venda).toFixed(2)}/m²)
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Largura (Metros)</label>
                <input 
                  type="number" step="0.01" placeholder="Ex: 1.20"
                  value={largura} onChange={(e) => setLargura(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Altura (Metros)</label>
                <input 
                  type="number" step="0.01" placeholder="Ex: 1.50"
                  value={altura} onChange={(e) => setAltura(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Quantidade</label>
                <input 
                  type="number" placeholder="1"
                  value={quantidade} onChange={(e) => setQuantidade(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Mão de Obra / Instalação (R$)</label>
                <input 
                  type="number" placeholder="0.00"
                  value={maoDeObra} onChange={(e) => setMaoDeObra(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Margem / Adicional (%)</label>
                <input 
                  type="number" placeholder="30"
                  value={margemLucro} onChange={(e) => setMargemLucro(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Resumo e Ações de Exportação */}
        <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-lg font-bold border-b border-slate-800 pb-3 flex items-center gap-2">
              <DollarSign size={20} className="text-emerald-400" /> Resumo do Cálculo
            </h3>

            <div className="space-y-2 text-sm text-slate-300">
              <div className="flex justify-between">
                <span>Área Total:</span>
                <span className="font-semibold text-white">{areaM2Total.toFixed(2)} m²</span>
              </div>

              <div className="flex justify-between">
                <span>Custo do Vidro:</span>
                <span className="font-semibold text-white">R$ {custoVidroTotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Mão de Obra:</span>
                <span className="font-semibold text-white">R$ {valorMaoObra.toFixed(2)}</span>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4">
              <span className="text-xs text-slate-400 block mb-1">Valor Sugerido para o Cliente</span>
              <div className="text-3xl font-extrabold text-emerald-400">
                R$ {valorTotalOrcamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="space-y-3">
            <button 
              onClick={handleGerarPDF}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
            >
              <FileText size={18} className="text-blue-400" /> Gerar PDF / Imprimir
            </button>

            <button 
              onClick={handleEnviarWhatsApp}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send size={18} /> Enviar no WhatsApp
            </button>

            <button 
              onClick={handleSalvarCotacao}
              disabled={salvando}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {salvando ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {salvando ? 'Salvando...' : 'Salvar no Banco'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}