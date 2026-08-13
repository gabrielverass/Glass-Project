import React, { useState } from 'react'
import { ShoppingBag, Plus, Search, Calendar, FileText, CheckCircle, Clock, Wrench } from 'lucide-react'

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([
    {
      id: 'PED-101',
      cliente: 'Carlos Eduardo',
      whatsapp: '(85) 99876-5432',
      midia: 'WhatsApp',
      statusServico: 'Em Produção',
      statusPagamento: 'Sinal Pago (50%)',
      prazo: '2026-08-20',
      total: 1850.00,
      itens: [
        { descricao: 'Box Elegance Incolor 8mm', largura: 1200, altura: 1900, qtd: 1, valorUnit: 1200.00 },
        { descricao: 'Espelho Bisote 4mm', largura: 800, altura: 1000, qtd: 1, valorUnit: 650.00 }
      ]
    },
    {
      id: 'PED-102',
      cliente: 'Mariana Souza - Ap 302',
      whatsapp: '(85) 98765-4321',
      midia: 'Instagram',
      statusServico: 'Visita Técnica',
      statusPagamento: 'Pendente',
      prazo: '2026-08-25',
      total: 3200.00,
      itens: [
        { descricao: 'Janela de Correr 4 Folhas', largura: 2000, altura: 1200, qtd: 2, valorUnit: 1600.00 }
      ]
    }
  ])

  // Estados do Formulário de Novo Pedido
  const [modalAberto, setModalAberto] = useState(false)
  const [cliente, setCliente] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [midia, setMidia] = useState('WhatsApp')
  const [largura, setLargura] = useState(1000)
  const [altura, setAltura] = useState(1000)
  const [descricaoItem, setDescricaoItem] = useState('')
  const [valorUnitario, setValorUnitario] = useState(0)

  // Cálculo da área em m²
  const areaM2 = (largura * altura) / 1000000

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Em Produção':
        return <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 w-fit"><Clock size={12}/> Em Produção</span>
      case 'Visita Técnica':
        return <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 w-fit"><Wrench size={12}/> Visita Técnica</span>
      case 'Finalizado':
        return <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 w-fit"><CheckCircle size={12}/> Finalizado</span>
      default:
        return <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-full font-semibold w-fit">{status}</span>
    }
  }

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pedidos & Vendas</h1>
          <p className="text-slate-500 text-sm">Gerenciamento do funil de vendas, ordens de serviço e medidas em mm.</p>
        </div>
        <button 
          onClick={() => setModalAberto(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm"
        >
          <Plus size={16} /> Novo Pedido
        </button>
      </div>

      {/* Tabela de Pedidos */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-100 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-6 py-3">Cód. / Cliente</th>
              <th className="px-6 py-3">Origem (Mídia)</th>
              <th className="px-6 py-3">Itens / Medidas (mm)</th>
              <th className="px-6 py-3">Prazo</th>
              <th className="px-6 py-3">Valor Total</th>
              <th className="px-6 py-3">Status Serviço</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pedidos.map((pedido) => (
              <tr key={pedido.id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4">
                  <span className="text-xs font-bold text-blue-600 block">{pedido.id}</span>
                  <span className="font-semibold text-slate-900 block">{pedido.cliente}</span>
                  <span className="text-xs text-slate-400">{pedido.whatsapp}</span>
                </td>
                <td className="px-6 py-4 text-slate-600">
                  <span className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded font-medium">
                    {pedido.midia}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {pedido.itens.map((item, idx) => {
                    const m2 = ((item.largura * item.altura) / 1000000).toFixed(2)
                    return (
                      <div key={idx} className="text-xs text-slate-600 mb-1">
                        • <strong className="text-slate-800">{item.descricao}</strong> ({item.largura}x{item.altura} mm — {m2} m²)
                      </div>
                    )
                  })}
                </td>
                <td className="px-6 py-4 text-xs font-medium text-slate-600">
                  {pedido.prazo}
                </td>
                <td className="px-6 py-4 font-bold text-slate-900">
                  R$ {pedido.total.toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(pedido.statusServico)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Simples de Novo Pedido */}
      {modalAberto && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-lg space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b pb-2">Cadastrar Novo Pedido</h2>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nome do Cliente</label>
                <input 
                  type="text" 
                  value={cliente} 
                  onChange={(e) => setCliente(e.target.value)}
                  placeholder="Ex: João Pedro" 
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">WhatsApp</label>
                  <input 
                    type="text" 
                    value={whatsapp} 
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="(85) 99999-0000" 
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Mídia de Origem</label>
                  <select 
                    value={midia} 
                    onChange={(e) => setMidia(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                  >
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Google">Google</option>
                    <option value="OLX">OLX</option>
                    <option value="Indicação">Indicação</option>
                  </select>
                </div>
              </div>

              <div className="border-t pt-3 mt-3">
                <span className="text-xs font-bold text-slate-700 block mb-2">Item do Pedido & Medidas em mm</span>
                
                <input 
                  type="text" 
                  value={descricaoItem} 
                  onChange={(e) => setDescricaoItem(e.target.value)}
                  placeholder="Descrição da peça (Ex: Vidro Incolor 8mm)" 
                  className="w-full px-3 py-2 border rounded-lg text-sm mb-3"
                />

                <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div>
                    <label className="block text-xs text-slate-500 font-medium">Largura (mm)</label>
                    <input 
                      type="number" 
                      value={largura} 
                      onChange={(e) => setLargura(Number(e.target.value))}
                      className="w-full px-2 py-1 border rounded text-sm mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 font-medium">Altura (mm)</label>
                    <input 
                      type="number" 
                      value={altura} 
                      onChange={(e) => setAltura(Number(e.target.value))}
                      className="w-full px-2 py-1 border rounded text-sm mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 font-medium">Área Calculada</label>
                    <div className="text-sm font-bold text-blue-600 mt-2">
                      {areaM2.toFixed(3)} m²
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button 
                onClick={() => setModalAberto(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancelar
              </button>
              <button 
                onClick={() => setModalAberto(false)}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Salvar Pedido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}