export interface SalaryInputs {
  salarioBase: string;
  faturamentoMensal: string;
  horas50: string;
  horas100: string;
  chamadaPlantao: string;
  descontosAdicionais: string;
}

export interface Settings {
  taxaComissao: number;
  divisorParticipacao: number;
  numeroDependentes: number;
  valorPlantao: string;
}

export interface CalculationResult {
  comissao: number;
  participacao: number;
  periculosidade: number;
  baseCalculoHora: number;
  valorHoraPadrao: number;
  valorHE50: number;
  valorHE100: number;
  totalHE50: number;
  totalHE100: number;
  chamadaPlantao: number;
  salarioBruto: number;
  inss: number; // Progressive INSS
  irrf: number; // Progressive IRRF
  descontosAdicionais: number;
  totalDescontos: number;
  salarioLiquido: number;
}