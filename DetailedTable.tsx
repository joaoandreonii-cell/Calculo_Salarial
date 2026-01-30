import React from 'react';
import { CalculationResult } from '../types';
import { formatBRL } from '../utils/currency';

interface DetailedTableProps {
  data: CalculationResult;
}

export const DetailedTable: React.FC<DetailedTableProps> = ({ data }) => {
  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg mt-6">
      <table className="min-w-full divide-y divide-slate-300">
        <thead className="bg-slate-50">
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6">
              Componente
            </th>
            <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-slate-900">
              Valor / Detalhe
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {/* Earnings */}
          <tr>
            <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm text-slate-700 sm:pl-6 font-medium">Base de Cálculo da Hora</td>
            <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-900 text-right">{formatBRL(data.baseCalculoHora)}</td>
          </tr>
          <tr>
            <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm text-slate-500 sm:pl-6 pl-8 italic">↳ Valor Hora Padrão (÷220)</td>
            <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-900 text-right">{formatBRL(data.valorHoraPadrao)}</td>
          </tr>
          <tr>
            <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm text-slate-700 sm:pl-6">Comissão</td>
            <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-900 font-medium text-right">+ {formatBRL(data.comissao)}</td>
          </tr>
          <tr>
            <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm text-slate-700 sm:pl-6">Participação</td>
            <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-900 font-medium text-right">+ {formatBRL(data.participacao)}</td>
          </tr>
          <tr>
            <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm text-slate-700 sm:pl-6">Periculosidade (30%)</td>
            <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-900 font-medium text-right">+ {formatBRL(data.periculosidade)}</td>
          </tr>
          <tr>
            <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm text-slate-700 sm:pl-6">Horas Extras 50%</td>
            <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-900 font-medium text-right">+ {formatBRL(data.totalHE50)}</td>
          </tr>
          <tr>
            <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm text-slate-700 sm:pl-6">Horas Extras 100%</td>
            <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-900 font-medium text-right">+ {formatBRL(data.totalHE100)}</td>
          </tr>
          <tr>
            <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm text-slate-700 sm:pl-6">Chamada Plantão</td>
            <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-900 font-medium text-right">+ {formatBRL(data.chamadaPlantao || 0)}</td>
          </tr>
          
          <tr className="bg-slate-50">
            <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm font-bold text-slate-900 sm:pl-6">Salário Bruto</td>
            <td className="whitespace-nowrap px-3 py-3 text-sm font-bold text-slate-900 text-right">{formatBRL(data.salarioBruto)}</td>
          </tr>

          {/* Deductions */}
          <tr>
            <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm text-rose-700 sm:pl-6">INSS (Progressivo)</td>
            <td className="whitespace-nowrap px-3 py-3 text-sm text-rose-700 font-medium text-right">- {formatBRL(data.inss)}</td>
          </tr>
          <tr>
            <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm text-rose-700 sm:pl-6">IRRF (Retido na Fonte)</td>
            <td className="whitespace-nowrap px-3 py-3 text-sm text-rose-700 font-medium text-right">- {formatBRL(data.irrf)}</td>
          </tr>
          <tr>
            <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm text-slate-700 sm:pl-6">Descontos Adicionais</td>
            <td className="whitespace-nowrap px-3 py-3 text-sm text-slate-900 font-medium text-right">- {formatBRL(data.descontosAdicionais)}</td>
          </tr>

          <tr className="bg-indigo-50 border-t-2 border-indigo-200">
            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-base font-bold text-indigo-900 sm:pl-6">Salário Líquido</td>
            <td className="whitespace-nowrap px-3 py-4 text-base font-bold text-slate-900 text-right">{formatBRL(data.salarioLiquido)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};