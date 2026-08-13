import React, { useState } from 'react'
import { Package, AlertTriangle, Plus, Search, CheckCircle2 } from 'lucide-react'

export default function Estoque() {
  const [produtos, setProdutos] = useState([
    { id: 1, nome: 'Vidro Temperado Incolor 8mm', categoria: 'Vidros', unidade: 'm²', estoque: 45, min: 10, precoCusto: 120.00, precoVenda: 220.00 },
    { id: 2, nome: 'Perfil Alumínio Branco 3m', categoria: 'Perfis de Alumínio', unidade: 'metro', estoque: 4, min: 15, precoCusto: 35.00, precoVenda: 65.00 },
    { id: 3, nome: 'Kit Box Elegance Cromado', categoria: 'Acessórios', unidade: 'unidade', estoque: 2, min: 5, precoCusto: 180.00, precoVenda: 320.00 },
    { id: 4, nome: 'Silicone Incolor Neutro 280g', categoria: 'Acessórios', unidade: 'unidade', estoque: 28, min: 8, precoCusto: 15.00, precoVenda: 30.00 },
  ])

  const [busca, setBusca] = useState('')

  const itensBaixoEstoque = produtos.filter(p => p.estoque <= p.min)
  const valorTotalEstoque = produtos.reduce((acc, p) => acc + (p.estoque * p.precoCusto), 0)

  const produtosFiltrados = produtos.filter(p => 
    p.nome.toLowerCase().includes(busca.toLowerCase()) || 
    p.categoria.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Controle de Estoque</h1>
          <p className="text-slate-500 text-sm">Gerenciamento de materiais, insumos e alertas de reposição.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm">
          <Plus size={16} /> Cadastrar Produto
        </button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1">Total de Cadastros</span>
          <div className="text-2xl font-bold text-slate-900">{produtos.length} produtos</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1">Alerta de Reposição</span>
          <div className="text-2xl font-bold text-amber-600 flex items-center gap-2">
            <AlertTriangle size={22} /> {itensBaixoEstoque.length} em nível crítico
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1">Valor Total em Estoque</span>
          <div className="text-2xl font-bold text-emerald-600">
            R$ {valorTotalEstoque.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Tabela de Produtos */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="relative w-72">
            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar produto ou categoria..." 
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>

        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-100 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-6 py-3">Produto</th>
              <th className="px-6 py-3">Categoria</th>
              <th className="px-6 py-3">Qtd em Estoque</th>
              <th className="px-6 py-3">Preço Custo</th>
              <th className="px-6 py-3">Preço Venda</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {produtosFiltrados.map((item) => {
              const isCritico = item.estoque <= item.min
              return (
                <tr key={item.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-semibold text-slate-900">{item.nome}</td>
                  <td className="px-6 py-4 text-slate-600">{item.categoria}</td>
                  <td className="px-6 py-4 font-medium">{item.estoque} {item.unidade}</td>
                  <td className="px-6 py-4">R$ {item.precoCusto.toFixed(2)}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">R$ {item.precoVenda.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    {isCritico ? (
                      <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 w-fit">
                        <AlertTriangle size={12} /> Estoque Baixo
                      </span>
                    ) : (
                      <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 w-fit">
                        <CheckCircle2 size={12} /> Normal
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}