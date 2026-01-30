import React, { useState, useRef } from 'react';
import { 
  Calculator, 
  Settings as SettingsIcon, 
  DollarSign, 
  Briefcase, 
  Clock, 
  AlertTriangle, 
  CreditCard,
  Percent,
  Divide,
  ChevronRight,
  RotateCcw,
  Save,
  Check,
  Users
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

import { SalaryInputs, Settings, CalculationResult } from './types';
import { InputField } from './components/InputField';
import { SummaryCard } from './components/SummaryCard';
import { DetailedTable } from './components/DetailedTable';
import { formatBRL, formatCurrencyInput, parseCurrencyInput } from './utils/currency';
import { formatTimeInput, timeToDecimal } from './utils/time';

// Tax Logic Helper Functions (2026 Rules)

const calculateINSS = (grossSalary: number): number => {
  // Teto 2026
  if (grossSalary > 8475.55) {
    return 988.09;
  }

  // Tabela Progressiva 2026
  if (grossSalary <= 1621.00) {
    return grossSalary * 0.075;
  } 
  
  if (grossSalary <= 2902.84) {
    return (grossSalary * 0.09) - 24.32;
  } 
  
  if (grossSalary <= 4354.27) {
    return (grossSalary * 0.12) - 111.40;
  } 
  
  // Até o teto 8475.55
  return (grossSalary * 0.14) - 198.49;
};

const calculateTableIRRF = (baseIRRF: number): number => {
  // Tabela Progressiva IRRF 2026
  if (baseIRRF <= 2428.80) return 0;

  if (baseIRRF <= 2826.65) {
    return (baseIRRF * 0.075) - 182.16;
  }
  
  if (baseIRRF <= 3751.05) {
    return (baseIRRF * 0.15) - 394.16;
  }
  
  if (baseIRRF <= 4664.68) {
    return (baseIRRF * 0.225) - 675.49;
  }
  
  // Acima de 4664.68
  return (baseIRRF * 0.275) - 908.73;
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'calculator' | 'settings'>('calculator');
  
  const [inputs, setInputs] = useState<SalaryInputs>({
    salarioBase: '',
    faturamentoMensal: '',
    horas50: '',
    horas100: '',
    chamadaPlantao: '',
    descontosAdicionais: '',
  });

  const [defaultBaseSalary, setDefaultBaseSalary] = useState<string>('');
  const [isDefaultSaved, setIsDefaultSaved] = useState(false);

  const [settings, setSettings] = useState<Settings>({
    taxaComissao: 0.0005,
    divisorParticipacao: 36,
    numeroDependentes: 0,
    valorPlantao: '',
  });

  const [result, setResult] = useState<CalculationResult | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (field: keyof SalaryInputs) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    
    if (field === 'horas50' || field === 'horas100') {
        const formattedTime = formatTimeInput(rawValue);
        setInputs(prev => ({ ...prev, [field]: formattedTime }));
        return;
    }

    const formattedValue = formatCurrencyInput(rawValue);
    setInputs(prev => ({ ...prev, [field]: formattedValue }));
  };

  const handleSettingChange = (field: keyof Settings) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({ ...prev, [field]: parseFloat(e.target.value) || 0 }));
  };

  const handleSettingsCurrencyChange = (field: keyof Settings) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCurrencyInput(e.target.value);
    setSettings(prev => ({ ...prev, [field]: formattedValue }));
  };

  const handleSetDefault = () => {
    setDefaultBaseSalary(inputs.salarioBase);
    setIsDefaultSaved(true);
    setTimeout(() => setIsDefaultSaved(false), 2000);
  };

  const handleReset = () => {
    setInputs({
      salarioBase: defaultBaseSalary,
      faturamentoMensal: '',
      horas50: '',
      horas100: '',
      chamadaPlantao: '',
      descontosAdicionais: '',
    });
    setResult(null);
  };

  const calculateSalary = () => {
    const salarioBase = parseCurrencyInput(inputs.salarioBase);
    const faturamentoMensal = parseCurrencyInput(inputs.faturamentoMensal);
    const chamadaPlantao = parseCurrencyInput(inputs.chamadaPlantao);
    const descontosAdicionais = parseCurrencyInput(inputs.descontosAdicionais);
    
    // Parse settings currency
    const valorPlantaoConfig = parseCurrencyInput(settings.valorPlantao);
    
    // Convert HH:MM to decimal hours
    const horas50 = timeToDecimal(inputs.horas50);
    const horas100 = timeToDecimal(inputs.horas100);

    // 1. Comissão
    const comissao = faturamentoMensal * settings.taxaComissao;

    // 2. Participação
    const participacao = (faturamentoMensal * 0.01) / settings.divisorParticipacao;

    // 3. Adicional Periculosidade (30% do base)
    const periculosidade = salarioBase * 0.30;

    // 4. Base de Cálculo da Hora (Sem Participação)
    const baseCalculoHora = salarioBase + comissao + periculosidade;

    // 5. Valor Hora Padrão
    const valorHoraPadrao = baseCalculoHora / 220;

    // 6. Horas Extras
    const valorHE50 = valorHoraPadrao * 1.5;
    const totalHE50 = valorHE50 * horas50;

    const valorHE100 = valorHoraPadrao * 2.0;
    const totalHE100 = valorHE100 * horas100;

    // 7. Salário Bruto
    const salarioBruto = salarioBase + 
                         comissao + 
                         participacao + 
                         periculosidade + 
                         totalHE50 + 
                         totalHE100 + 
                         chamadaPlantao + 
                         valorPlantaoConfig;

    // 8. Cálculo de Impostos (Real - Regras 2026)
    
    // 8.1 INSS
    const inss = calculateINSS(salarioBruto);

    // 8.2 IRRF
    let irrf = 0;

    // REGRA ESPECIAL 2026: Isenção Total se Bruto <= 5000
    if (salarioBruto <= 5000) {
      irrf = 0;
    } else {
      // Cálculo da Base de Cálculo
      // Opção Legal: INSS + Dependentes
      const deductionLegal = inss + (settings.numeroDependentes * 189.59);
      // Opção Simplificada: R$ 607,20
      const deductionSimplified = 607.20;

      // Usa a dedução mais vantajosa (maior desconto na base)
      const effectiveDeduction = Math.max(deductionLegal, deductionSimplified);
      const baseIRRF = Math.max(0, salarioBruto - effectiveDeduction);

      // Aplica Tabela Progressiva
      irrf = calculateTableIRRF(baseIRRF);

      // REGRA ESPECIAL 2026: Redução Adicional para faixa 5.000,01 a 7.350,00
      if (salarioBruto > 5000 && salarioBruto <= 7350) {
         // Redução = 978,62 - (0,133145 * Salário Bruto)
         const reduction = 978.62 - (0.133145 * salarioBruto);
         irrf = irrf - reduction;
      }

      // Garante que o imposto não seja negativo
      irrf = Math.max(0, irrf);
    }

    // 9. Salário Líquido
    const totalDescontos = inss + irrf + descontosAdicionais;
    const salarioLiquido = salarioBruto - totalDescontos;

    setResult({
      comissao,
      participacao,
      periculosidade,
      baseCalculoHora,
      valorHoraPadrao,
      valorHE50,
      valorHE100,
      totalHE50,
      totalHE100,
      chamadaPlantao: chamadaPlantao + valorPlantaoConfig,
      salarioBruto,
      inss,
      irrf,
      descontosAdicionais,
      totalDescontos,
      salarioLiquido
    });

    setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const renderCharts = (data: CalculationResult) => {
    // Breakdown of Gross Salary
    const fixedPart = (parseCurrencyInput(inputs.salarioBase) || 0) + data.periculosidade;
    const variablePart = data.comissao + data.participacao;
    const overtimePart = data.totalHE50 + data.totalHE100;
    const onCallPart = data.chamadaPlantao; // This now includes both input and settings plantão

    const chartData = [
      { name: 'Fixo', value: fixedPart, color: '#3B82F6' },
      { name: 'Variável', value: variablePart, color: '#10B981' },
      { name: 'Horas Extras', value: overtimePart, color: '#F59E0B' },
      { name: 'Chamada Plantão', value: onCallPart, color: '#8B5CF6' },
    ].filter(item => item.value > 0);

    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatBRL(value)} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <header className="bg-indigo-700 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-600 rounded-lg">
                    <DollarSign className="h-6 w-6 text-indigo-100" />
                </div>
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Calculadora Salarial</h1>
                    <p className="text-xs text-indigo-200">Remuneração Variável & Impostos</p>
                </div>
            </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        
        {/* Navigation Tabs */}
        <div className="flex space-x-1 rounded-xl bg-slate-200 p-1 mb-8 max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`w-full flex items-center justify-center space-x-2 rounded-lg py-2.5 text-sm font-medium leading-5 ring-white ring-opacity-60 ring-offset-2 ring-offset-indigo-400 focus:outline-none focus:ring-2 ${
              activeTab === 'calculator'
                ? 'bg-white text-indigo-700 shadow'
                : 'text-slate-600 hover:bg-white/[0.12] hover:text-indigo-600'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Cálculo</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center justify-center space-x-2 rounded-lg py-2.5 text-sm font-medium leading-5 ring-white ring-opacity-60 ring-offset-2 ring-offset-indigo-400 focus:outline-none focus:ring-2 ${
              activeTab === 'settings'
                ? 'bg-white text-indigo-700 shadow'
                : 'text-slate-600 hover:bg-white/[0.12] hover:text-indigo-600'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            <span>Configurações</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center justify-between">
                <span className="flex items-center">
                  {activeTab === 'calculator' ? (
                    <>
                      <Briefcase className="w-5 h-5 mr-2 text-indigo-600" />
                      Dados Financeiros
                    </>
                  ) : (
                    <>
                      <SettingsIcon className="w-5 h-5 mr-2 text-indigo-600" />
                      Parâmetros Globais
                    </>
                  )}
                </span>
              </h2>

              {activeTab === 'calculator' ? (
                <div className="space-y-1">
                  <div className="relative">
                    <InputField
                      id="salarioBase"
                      label="Salário Base"
                      icon={DollarSign}
                      value={inputs.salarioBase}
                      onChange={handleInputChange('salarioBase')}
                      suffix="BRL"
                      placeholder="0,00"
                    />
                    <button
                      onClick={handleSetDefault}
                      className={`absolute top-0 right-0 text-xs font-medium px-2 py-1 rounded transition-all flex items-center ${
                        isDefaultSaved 
                          ? 'text-emerald-600 bg-emerald-50' 
                          : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'
                      }`}
                      title="Define este valor como padrão ao limpar os campos"
                    >
                      {isDefaultSaved ? <Check className="w-3 h-3 mr-1" /> : <Save className="w-3 h-3 mr-1" />}
                      {isDefaultSaved ? 'Salvo' : 'Definir Padrão'}
                    </button>
                  </div>

                  <InputField
                    id="faturamentoMensal"
                    label="Faturamento Mensal"
                    icon={CreditCard}
                    value={inputs.faturamentoMensal}
                    onChange={handleInputChange('faturamentoMensal')}
                    suffix="BRL"
                    placeholder="0,00"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      id="horas50"
                      label="Horas Extras 50%"
                      icon={Clock}
                      value={inputs.horas50}
                      onChange={handleInputChange('horas50')}
                      type="text"
                      suffix="Hrs"
                      placeholder="00:00"
                    />
                    <InputField
                      id="horas100"
                      label="Horas Extras 100%"
                      icon={Clock}
                      value={inputs.horas100}
                      onChange={handleInputChange('horas100')}
                      type="text"
                      suffix="Hrs"
                      placeholder="00:00"
                    />
                  </div>
                  <InputField
                    id="chamadaPlantao"
                    label="Chamada Plantão"
                    icon={AlertTriangle}
                    value={inputs.chamadaPlantao}
                    onChange={handleInputChange('chamadaPlantao')}
                    suffix="BRL"
                    placeholder="0,00"
                  />
                  <InputField
                    id="descontosAdicionais"
                    label="Descontos (Unimed/Multas)"
                    icon={Percent}
                    value={inputs.descontosAdicionais}
                    onChange={handleInputChange('descontosAdicionais')}
                    suffix="BRL"
                    placeholder="0,00"
                  />

                  <div className="flex gap-3 mt-8">
                    <button
                      onClick={handleReset}
                      className="flex-none px-4 py-3.5 border border-slate-300 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 hover:text-slate-800 transition-colors flex items-center justify-center active:scale-95"
                      title="Limpar todos os campos (mantém Salário Base se definido como padrão)"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={calculateSalary}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center group"
                    >
                      <span>Calcular Salário</span>
                      <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100 text-indigo-800 text-sm mb-4">
                    Configure os parâmetros para o cálculo de impostos e comissões.
                  </div>
                  
                  <InputField
                    id="taxaComissao"
                    label="Taxa de Comissão (Decimal)"
                    icon={Percent}
                    value={settings.taxaComissao}
                    onChange={handleSettingChange('taxaComissao')}
                    type="number"
                    step="0.0001"
                    placeholder="0.0005"
                  />
                  
                  <InputField
                    id="divisorParticipacao"
                    label="Divisor de Participação"
                    icon={Divide}
                    value={settings.divisorParticipacao}
                    onChange={handleSettingChange('divisorParticipacao')}
                    type="number"
                    step="1"
                    placeholder="36"
                  />

                  <InputField
                    id="valorPlantao"
                    label="Plantão"
                    icon={DollarSign}
                    value={settings.valorPlantao}
                    onChange={handleSettingsCurrencyChange('valorPlantao')}
                    suffix="BRL"
                    placeholder="0,00"
                  />
                  
                  <div className="pt-2 border-t border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">Imposto de Renda</h3>
                    <InputField
                        id="numeroDependentes"
                        label="Número de Dependentes"
                        icon={Users}
                        value={settings.numeroDependentes}
                        onChange={handleSettingChange('numeroDependentes')}
                        type="number"
                        step="1"
                        placeholder="0"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                        Utilizado para dedução da base de cálculo do IRRF (R$ 189,59 por dependente).
                    </p>
                  </div>

                  <button
                     onClick={() => setActiveTab('calculator')}
                     className="w-full mt-4 text-indigo-600 font-medium py-2 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    Voltar para Calculadora
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-7" ref={resultRef}>
            {!result ? (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-slate-200 text-slate-400 p-8 text-center border-dashed">
                <div className="bg-slate-50 p-4 rounded-full mb-4">
                    <Calculator className="w-12 h-12 text-slate-300" />
                </div>
                <h3 className="text-lg font-medium text-slate-600">Aguardando Cálculo</h3>
                <p className="max-w-xs mt-2 text-sm">Preencha os dados à esquerda e clique em "Calcular Salário" para ver o detalhamento.</p>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <SummaryCard title="Salário Bruto" amount={result.salarioBruto} type="info" />
                   <SummaryCard title="Total Descontos" amount={result.totalDescontos} type="danger" />
                   <SummaryCard title="Salário Líquido" amount={result.salarioLiquido} type="success" />
                </div>

                {/* Detailed Analysis */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                        <h3 className="text-lg font-bold text-slate-800">Composição Salário Bruto</h3>
                    </div>
                    
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Chart */}
                        <div className="flex flex-col items-center justify-center">
                            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-4">Distribuição de Ganhos</h4>
                            {renderCharts(result)}
                        </div>
                        {/* Highlights */}
                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                <span className="text-slate-600">Valor Hora Padrão</span>
                                <span className="font-semibold text-slate-900">{formatBRL(result.valorHoraPadrao)}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                <span className="text-slate-600">Valor Hora 50%</span>
                                <span className="font-semibold text-slate-900">{formatBRL(result.valorHE50)}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                <span className="text-slate-600">Valor Hora 100%</span>
                                <span className="font-semibold text-slate-900">{formatBRL(result.valorHE100)}</span>
                            </div>
                        </div>
                    </div>

                    <DetailedTable data={result} />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;