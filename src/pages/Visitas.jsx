import React, { useState } from 'react'
import { Calendar, Plus, MapPin, Clock, CheckCircle2, AlertCircle, Phone } from 'lucide-react'

export default function Visitas() {
  const [visitas, setVisitas] = useState([
    {
      id: 1,
      cliente: 'Residência Silva',
      contato: '(85) 99123-4567',
      endereco: 'Rua das Flores, 123 - Aldeota',
      dataHora: '2026-08-14 09:30',
      objetivo: 'Medição presencial para Box e Espelho',
      status: 'Agendada'
    },
    {
      id: 2,
      cliente: 'Condomínio Solar',
      contato: '(85) 98888-7777',
      endereco: 'Av. Beira Mar, 4500 - Meireles',
      dataHora: '2026-08-14 14:00',
      objetivo: 'Conferência de vãos para esquadrias de alumínio',
      status: 'Pendente'
    },
    {
      id: 3,
      cliente: 'Empresa Tech - Recepção',
      contato: '(85) 97777-6666',
      endereco: 'Av. Santos Dumont, 1200 - Centro',
      dataHora: '2026-08-11 11:00',
      objetivo: 'Medição de divisória de vidro temperado',
      status: 'Concluída'
    }
  ])

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Agendada':
        return <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 w-fit"><Clock size={12}/> Agendada</span>
      case 'Pendente':
        return <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 w-fit"><AlertCircle size={12}/> Pendente</span>
      case 'Concluída':
        return <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 w-fit"><CheckCircle2 size={12}/> Concluída</span>
      default:
        return <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-full font-semibold w-fit">{status}</span>
    }
  }

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Visitas Técnicas</h1>
          <p className="text-slate-500 text-sm">Agendamento e controle de medições presenciais para orçamento.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm">
          <Plus size={16} /> Agendar Visita
        </button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1">Visitas Agendadas</span>
          <div className="text-2xl font-bold text-slate-900">2 confirmações</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1">Aguardando Confirmação</span>
          <div className="text-2xl font-bold text-amber-600">1 pendente</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1">Concluídas no Mês</span>
          <div className="text-2xl font-bold text-emerald-600">14 medições</div>
        </div>
      </div>

      {/* Tabela de Visitas */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-100 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-6 py-3">Cliente / Contato</th>
              <th className="px-6 py-3">Endereço da Obra</th>
              <th className="px-6 py-3">Data e Horário</th>
              <th className="px-6 py-3">Objetivo da Medição</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visitas.map((v) => (
              <tr key={v.id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4">
                  <span className="font-semibold text-slate-900 block">{v.cliente}</span>
                  <span className="text-xs text-slate-400 flex items-center gap-1"><Phone size={12}/> {v.contato}</span>
                </td>
                <td className="px-6 py-4 text-xs text-slate-600">
                  <span className="flex items-center gap-1 font-medium text-slate-700">
                    <MapPin size={12} className="text-blue-600"/> {v.endereco}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs font-semibold text-slate-800">
                  {v.dataHora}
                </td>
                <td className="px-6 py-4 text-xs text-slate-600">
                  {v.objetivo}
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(v.status)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}