import React from 'react';
import { formatBRL } from '../utils/currency';

interface SummaryCardProps {
  title: string;
  amount: number;
  type: 'success' | 'danger' | 'neutral' | 'info';
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ title, amount, type }) => {
  const colorClasses = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    neutral: 'bg-slate-50 text-slate-700 border-slate-200',
    info: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  };

  return (
    <div className={`p-4 rounded-xl border ${colorClasses[type]} shadow-sm flex flex-col items-center justify-center text-center transition-transform hover:scale-105 duration-200`}>
      <span className="text-sm font-medium opacity-80 uppercase tracking-wider mb-1">{title}</span>
      <span className="text-2xl font-bold text-slate-900">{formatBRL(amount)}</span>
    </div>
  );
};