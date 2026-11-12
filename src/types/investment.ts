export type InvestmentCategory =
  | 'real_estate'
  | 'startup'
  | 'stocks'
  | 'crypto'
  | 'crowdlending'
  | 'debt'
  | 'business'
  | 'other';

export type TransactionType =
  | 'BUY'         // Inversión inicial o ampliación de capital
  | 'PAYOUT'      // Reparto de dividendos, alquileres, intereses o retornos
  | 'VALUATION'   // Actualización de tasación / valor de mercado del activo
  | 'EXPENSE'     // Comisión periódica, mantenimiento, custodia, administración
  | 'SELL';       // Venta parcial o liquidación total

export interface Transaction {
  id: string;
  type: TransactionType;
  date: string; // YYYY-MM-DD
  amount: number; // Para BUY: capital; para PAYOUT: bruto; para VALUATION: nuevo valor; para EXPENSE: gasto; para SELL: precio venta
  fee?: number; // Comisiones asociadas (corretaje, plataforma, notaría, retención)
  netAmount?: number; // Opcional para payout (amount - fee)
  notes?: string;
}

export interface InvestmentProject {
  id: string;
  title: string;
  category: InvestmentCategory;
  startDate: string; // YYYY-MM-DD
  currency: string; // '€', '$', etc.
  targetReturnRate?: number; // e.g. 12% anual esperado
  status: 'active' | 'exited';
  transactions: Transaction[];
  notes?: string;
}

export interface ProjectMetrics {
  investedCapital: number;    // Capital aportado neto
  entryFees: number;          // Comisiones de entrada / compra
  ongoingFees: number;        // Gastos de gestión / custodia / recurrentes
  exitFees: number;           // Comisiones de venta / liquidación
  payoutFees: number;         // Retenciones y comisiones sobre repartos
  totalFees: number;          // Total de comisiones pagadas
  totalCostBasis: number;     // Capital Invertido + Comisiones
  grossPayouts: number;       // Repartos brutos cobrados
  netPayouts: number;         // Repartos netos en bolsillo
  currentValuation: number;   // Valoración actual del activo (o precio de venta si salió)
  unrealizedCapitalGain: number; // Revalorización del activo (valoración - invertido)
  totalNetProfit: number;     // (Valoración actual + Repartos netos) - (Invertido + Comisiones)
  roiPercentage: number;      // (P&L Neto / Coste Base Total) * 100
  cashOnCashYield: number;    // (Repartos netos / Capital invertido) * 100
  isProfitable: boolean;
}

export interface PortfolioMetrics {
  totalCurrentValue: number;
  totalInvestedCapital: number;
  totalFeesPaid: number;
  totalCostBasis: number;
  totalNetPayouts: number;
  totalNetProfit: number;
  portfolioRoi: number;
  activeProjectsCount: number;
  exitedProjectsCount: number;
}

