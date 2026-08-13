import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { 
  Plus, Package, AlertTriangle, Search, Trash2, X, Loader2, DollarSign 
} from 'lucide-react'

export default function Estoque() {
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  // Form State
  const [form, setForm] = useState({
    nome: '',
    categoria: 'Vidros',
    quantidade: '',
    unidade: 'm²',
    preco_custo: '',
    preco_venda: '',
    estoque_minimo: '5'
  })

  useEffect(() => {
    carregarEstoque()
  }, [])

  const carregarEstoque = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('estoque')
        .select('*')
        .order('nome', { ascending: true })

      if (!error && data) {
        setProdutos(data)
      }
    } catch (err) {
      console.error('Erro ao carregar estoque:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCadastrar = async (e) => {
    e.preventDefault()
    setSalvando(true)
    setErro('')

    try {
      const novoProduto = {
        nome: form.nome.trim(),
        categoria: form.categoria,
        quantidade: Number(form.quantidade || 0),
        unidade: form.unidade,
        preco_custo: Number(form.preco_custo || 0),
        preco_venda: Number(form.preco_venda || 0),
        estoque_minimo: Number(form.estoque_minimo || 5)
      }

      const { data, error } = await supabase
        .from('estoque')
        .insert([novoProduto])
        .select()

      if (error) {
        setErro(`Erro ao salvar: ${error.message}`)
      } else {
        setModalAberto(false)
        setForm({
          nome: '',
          categoria: 'Vidros',
          quantidade: '',
          unidade: 'm²',
          preco_custo: '',
          preco_venda: '',
          estoque_minimo: '5'
        })
        carregarEstoque()
      }
    } catch (err) {
      setErro('Falha de conexão ao cadastrar produto.')
    } finally {
      setSalvando(false)
    }
  }

  const handleExcluir = async (id) => {
    if (!window.confirm('Tem certeza que deseja remover este item do estoque?')) return

    try {
      const { error } = await supabase.from('estoque').delete().eq('id', id)
      if (!error) {
        setProdutos(produtos.filter(p => p.id !== id))
      }
    } catch (err) {
      console.error('Erro ao excluir:', err)
    }
  }

  // Filtros e Cálculos
  const produtosFiltrados = produtos.filter(p => 
    p.nome.toLowerCase().includes(busca.toLowerCase()) ||
    p.categoria.toLowerCase().includes(busca.toLowerCase())
  )

  const valorTotalEstoque = produtos.reduce((acc, p) => acc + (Number(p.quantidade) * Number(p.preco_custo)), 0)
  const itensCriticos = produtos.filter(p => Number(p.quantidade) <= Number(p.estoque_minimo))

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Controle de Estoque</h1>
          <p className="text-slate-500 text-sm">Gerencie o saldo de vidros, perfis de alumínio e insumos.</p>
        </div>

        <button 
          onClick={() => setModalAberto(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <Plus size={18} /> Cadastrar Produto
        </button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-slate-500">Total de Itens</span>
            <div className="text-2xl font-bold text-slate-900">{produtos.length}</div>
          </div>
          <Package size={28} className="text-blue-600" />
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-slate-500">Valor em Custo</span>
            <div className="text-2xl font-bold text-emerald-600">
              R$ {valorTotalEstoque.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <DollarSign size={28} className="text-emerald-600" />
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-slate-500">Estoque Baixo / Crítico</span>
            <div className="text-2xl font-bold text-amber-600">{itensCriticos.length}</div>
          </div>
          <AlertTriangle size={28} className="text-amber-500" />
        </div>
      </div>

      {/* Barra de Busca */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
        <Search size={18} className="text-slate-400" />
        <input 
          type="text"
          placeholder="Buscar produto por nome ou categoria..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full bg-transparent text-sm focus:outline-none text-slate-800"
        />
      </div>

      {/* Tabela de Produtos */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 flex items-center justify-center gap-2">
            <Loader2 className="animate-spin" size={20} /> Carregando estoque...
          </div>
        ) : produtosFiltrados.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            Nenhum produto encontrado. Clique em <strong>Cadastrar Produto</strong> para adicionar o primeiro item.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-4">Produto</th>
                  <th className="p-4">Categoria</th>
                  <th className="p-4">Quantidade</th>
                  <th className="p-4">Preço Custo</th>
                  <th className="p-4">Preço Venda</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {produtosFiltrados.map((item) => {
                  const estBaixo = Number(item.quantidade) <= Number(item.estoque_minimo)
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-4 font-medium text-slate-900">
                        {item.nome}
                        {estBaixo && (
                          <span className="ml-2 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <AlertTriangle size={10} /> Baixo
                          </span>
                        )}
                      </td>
                      <td className="p-4">{item.categoria}</td>
                      <td className="p-4 font-semibold">
                        {item.quantidade} <span className="text-xs text-slate-400 font-normal">{item.unidade}</span>
                      </td>
                      <td className="p-4">R$ {Number(item.preco_custo).toFixed(2)}</td>
                      <td className="p-4 font-medium text-emerald-700">R$ {Number(item.preco_venda).toFixed(2)}</td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => handleExcluir(item.id)}
                          className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition"
                          title="Excluir item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL CADASTRAR PRODUTO */}
      {modalAberto && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">Novo Produto de Estoque</h2>
              <button onClick={() => setModalAberto(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            {erro && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg text-xs font-medium border border-red-200">
                {erro}
              </div>
            )}

            <form onSubmit={handleCadastrar} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nome do Item *</label>
                <input 
                  type="text" required placeholder="Ex: Vidro Temperado 8mm Incolor"
                  value={form.nome} onChange={(e) => setForm({...form, nome: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Categoria</label>
                  <select 
                    value={form.categoria} onChange={(e) => setForm({...form, categoria: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-600 focus:outline-none bg-white"
                  >
                    <option value="Vidros">Vidros</option>
                    <option value="Perfis de Alumínio">Perfis de Alumínio</option>
                    <option value="Ferragens">Ferragens</option>
                    <option value="Acessórios e Insumos">Acessórios e Insumos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Unidade de Medida</label>
                  <select 
                    value={form.unidade} onChange={(e) => setForm({...form, unidade: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-600 focus:outline-none bg-white"
                  >
                    <option value="m²">m² (Metro Quadrado)</option>
                    <option value="Barra">Barra (6m)</option>
                    <option value="Unidade">Unidade</option>
                    <option value="Caixa">Caixa</option>
                    <option value="Kg">Kg</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Qtd Inicial</label>
                  <input 
                    type="number" step="0.01" required placeholder="0"
                    value={form.quantidade} onChange={(e) => setForm({...form, quantidade: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Preço Custo (R$)</label>
                  <input 
                    type="number" step="0.01" placeholder="0.00"
                    value={form.preco_custo} onChange={(e) => setForm({...form, preco_custo: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Preço Venda (R$)</label>
                  <input 
                    type="number" step="0.01" placeholder="0.00"
                    value={form.preco_venda} onChange={(e) => setForm({...form, preco_venda: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Alerta de Estoque Mínimo</label>
                <input 
                  type="number" placeholder="5"
                  value={form.estoque_minimo} onChange={(e) => setForm({...form, estoque_minimo: e.target.value})}
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
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition shadow-md disabled:opacity-50"
                >
                  {salvando ? 'Salvando...' : 'Salvar Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}