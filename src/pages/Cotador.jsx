import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Calculator, DollarSign, Save, RefreshCw, CheckCircle, Loader2 } from 'lucide-react'

export default function Cotador() {
  const [vidrosEstoque, setVidrosEstoque] = useState([])
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso] = useState('')

  // Dados do formulário
  const [cliente, setCliente] = useState('')
  const [vidroSelecionado, setVidroSelecionado] = useState('')
  const [largura, setLargura] = useState('')
  const [altura, setAltura] = useState('')
  const [quantidade, setQuantidade] = useState('1')
  const [maoDeObra, setMaoDeObra] = useState('0')
  const [margemLucro, setMargemLucro] = useState('30') // 30% padrão

  useEffect(() => {
    carregarVidros()
  }, [])

  const carregarVidros = async () => {
    setLoading(true)
    try {
      // Puxa itens da categoria 'Vidros' do estoque
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

  const areaM2Unitario = (largNum * altNum)
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
    e.preventDefault()
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
        setSucesso('Cotação salva com sucesso!')
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

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Cotador de Insumos e Esquadrias</h1>
        <p className="text-slate-500 text-sm">Calcule o preço exato de projetos com base nos materiais em estoque.</p>
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
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Nome do Cliente / Projeto *</label>
              <input 
                type="text" 
                placeholder="Ex: João da Silva - Janela Quarto"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-600 focus:outline-none"
              />
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

        {/* Resumo do Orçamento */}
        <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-lg font-bold border-b border-slate-800 pb-3 flex items-center gap-2">
              <DollarSign size={20} className="text-emerald-400" /> Resumo do Cálculo
            </h3>

            <div className="space-y-2 text-sm text-slate-300">
              <div className="flex justify-between">
                <span>Área Total (m²):</span>
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

          <button 
            onClick={handleSalvarCotacao}
            disabled={salvando}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {salvando ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {salvando ? 'Salvando...' : 'Salvar Orçamento'}
          </button>
        </div>
      </div>
    </div>
  )
}