import React, { useState } from 'react'
import { Calculator, CheckCircle2, MessageSquare, Plus, Trash2, DollarSign } from 'lucide-react'

export default function Cotador() {
  const [clienteObra, setClienteObra] = useState('')
  const [vidroDescricao, setVidroDescricao] = useState('')
  
  // Lista de fornecedores de vidro
  const [fornecedoresVidro, setFornecedoresVidro] = useState([
    { distribuidora: 'Distribuidora Vidros Sul', valor: 450.00 },
    { distribuidora: 'Central dos Vidros', valor: 410.00 },
  ])

  // Lista de fornecedores de acessórios
  const [fornecedoresAcessorios, setFornecedoresAcessorios] = useState([
    { distribuidora: 'Alumínio & Cia', valor: 180.00 },
    { distribuidora: 'Acessórios Express', valor: 165.00 },
  ])

  // Identificar fornecedor mais barato de cada categoria
  const menorVidro = fornecedoresVidro.reduce((min, item) => item.valor < min.valor ? item : min, fornecedoresVidro[0] || { valor: 0 })
  const menorAcessorio = fornecedoresAcessorios.reduce((min, item) => item.valor < min.valor ? item : min, fornecedoresAcessorios[0] || { valor: 0 })
  const custoTotalMinimo = (menorVidro?.valor || 0) + (menorAcessorio?.valor || 0)

  // Gerar mensagem para o WhatsApp
  const gerarMensagemWhatsApp = () => {
    const texto = `*Cotação de Insumos - ${clienteObra || 'Cliente/Obra'}*\n` +
      `Item: ${vidroDescricao || 'Vidros e Ferragens'}\n\n` +
      `*Melhor Combinação Encontrada:*\n` +
      `• Vidros: ${menorVidro?.distribuidora} (R$ ${menorVidro?.valor?.toFixed(2)})\n` +
      `• Acessórios: ${menorAcessorio?.distribuidora} (R$ ${menorAcessorio?.valor?.toFixed(2)})\n` +
      `*Custo Total Insumos:* R$ ${custoTotalMinimo.toFixed(2)}`
    
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`, '_blank')
  }

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Cotador de Insumos</h1>
        <p className="text-slate-500 text-sm">Compare preços de distribuidoras e encontre o menor custo para sua obra.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulário Principal */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">1. Dados da Obra / Serviço</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Cliente ou Obra</label>
                <input 
                  type="text" 
                  placeholder="Ex: Residencia Silva - Ap 402"
                  value={clienteObra} 
                  onChange={(e) => setClienteObra(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Descrição dos Itens</label>
                <input 
                  type="text" 
                  placeholder="Ex: Box Elegance Incolor 8mm"
                  value={vidroDescricao} 
                  onChange={(e) => setVidroDescricao(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Cotação de Vidros */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900">2. Preços de Vidro por Distribuidora</h2>
              <button 
                onClick={() => setFornecedoresVidro([...fornecedoresVidro, { distribuidora: '', valor: 0 }])}
                className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                <Plus size={14} /> Adicionar Fornecedor
              </button>
            </div>

            {fornecedoresVidro.map((item, index) => (
              <div key={index} className="flex gap-3 items-center">
                <input 
                  type="text" 
                  placeholder="Nome da Distribuidora"
                  value={item.distribuidora} 
                  onChange={(e) => {
                    const newArr = [...fornecedoresVidro]
                    newArr[index].distribuidora = e.target.value
                    setFornecedoresVidro(newArr)
                  }}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
                <div className="relative w-36">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400">R$</span>
                  <input 
                    type="number" 
                    value={item.valor} 
                    onChange={(e) => {
                      const newArr = [...fornecedoresVidro]
                      newArr[index].valor = parseFloat(e.target.value) || 0
                      setFornecedoresVidro(newArr)
                    }}
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                {item.distribuidora === menorVidro?.distribuidora && item.valor > 0 && (
                  <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                    <CheckCircle2 size={12} /> Mais barato
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Resumo e Ações */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-xl shadow-md space-y-6">
            <h3 className="text-lg font-bold border-b border-slate-800 pb-3 text-blue-400">Combinação Mais Econômica</h3>
            
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-xs text-slate-400 block">Distribuidora de Vidros:</span>
                <span className="font-semibold text-slate-200">{menorVidro?.distribuidora || 'Nenhuma'}</span>
                <span className="block text-emerald-400 font-bold">R$ {menorVidro?.valor?.toFixed(2)}</span>
              </div>

              <div>
                <span className="text-xs text-slate-400 block">Distribuidora de Acessórios:</span>
                <span className="font-semibold text-slate-200">{menorAcessorio?.distribuidora || 'Nenhuma'}</span>
                <span className="block text-emerald-400 font-bold">R$ {menorAcessorio?.valor?.toFixed(2)}</span>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <span className="text-xs text-slate-400 block">Custo Total dos Insumos:</span>
                <span className="text-2xl font-bold text-white">R$ {custoTotalMinimo.toFixed(2)}</span>
              </div>
            </div>

            <button 
              onClick={gerarMensagemWhatsApp}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold text-sm transition shadow"
            >
              <MessageSquare size={18} /> Enviar Resumo via WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}