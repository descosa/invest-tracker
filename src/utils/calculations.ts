import { InvestmentProject, ProjectMetrics, PortfolioMetrics, InvestmentCategory } from '../types/investment';

export function calculateProjectMetrics(project: InvestmentProject): ProjectMetrics {
  let investedCapital = 0;
  let entryFees = 0;
  let ongoingFees = 0;
  let exitFees = 0;
  let payoutFees = 0;
  let grossPayouts = 0;
  let netPayouts = 0;
  let latestValuation: number | null = null;
  let totalExitedValue = 0;

  // Ordenar transacciones por fecha cronológica
  const sortedTransactions = [...project.transactions].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  for (const tx of sortedTransactions) {
    switch (tx.type) {
      case 'BUY':
        investedCapital += Number(tx.amount) || 0;
        entryFees += Number(tx.fee) || 0;
        break;

      case 'PAYOUT':
        const gross = Number(tx.amount) || 0;
        const fee = Number(tx.fee) || 0;
        const net = tx.netAmount !== undefined ? Number(tx.netAmount) : Math.max(0, gross - fee);
        grossPayouts += gross;
        payoutFees += fee;
        netPayouts += net;
        break;

      case 'EXPENSE':
        ongoingFees += Number(tx.amount) || 0;
        break;

      case 'VALUATION':
        latestValuation = Number(tx.amount) || 0;
        break;

      case 'SELL':
        totalExitedValue += Number(tx.amount) || 0;
        exitFees += Number(tx.fee) || 0;
        break;
    }
  }

  const totalFees = entryFees + ongoingFees + exitFees + payoutFees;
  const totalCostBasis = investedCapital + totalFees;

  // Si no hay tasación explícita posterior, la valoración actual es el capital aportado (o lo recuperado si se vendió)
  let currentValuation = 0;
  if (project.status === 'exited') {
    currentValuation = totalExitedValue;
  } else {
    currentValuation = latestValuation !== null ? latestValuation : investedCapital;
  }

  const unrealizedCapitalGain = currentValuation - investedCapital;
  // P&L Neto: (Valor actual + Dinero cobrado en repartos) - (Capital invertido + Comisiones y costes totales)
  const totalNetProfit = (currentValuation + netPayouts) - (investedCapital + totalFees);

  const roiPercentage = totalCostBasis > 0 ? (totalNetProfit / totalCostBasis) * 100 : 0;
  const cashOnCashYield = investedCapital > 0 ? (netPayouts / investedCapital) * 100 : 0;

  return {
    investedCapital,
    entryFees,
    ongoingFees,
    exitFees,
    payoutFees,
    totalFees,
    totalCostBasis,
    grossPayouts,
    netPayouts,
    currentValuation,
    unrealizedCapitalGain,
    totalNetProfit,
    roiPercentage,
    cashOnCashYield,
    isProfitable: totalNetProfit >= 0,
  };
}

export function calculatePortfolioMetrics(projects: InvestmentProject[]): PortfolioMetrics {
  let totalCurrentValue = 0;
  let totalInvestedCapital = 0;
  let totalFeesPaid = 0;
  let totalCostBasis = 0;
  let totalNetPayouts = 0;
  let totalNetProfit = 0;
  let activeProjectsCount = 0;
  let exitedProjectsCount = 0;

  for (const project of projects) {
    if (project.status === 'active') {
      activeProjectsCount++;
    } else {
      exitedProjectsCount++;
    }

    const metrics = calculateProjectMetrics(project);
    totalCurrentValue += metrics.currentValuation;
    totalInvestedCapital += metrics.investedCapital;
    totalFeesPaid += metrics.totalFees;
    totalCostBasis += metrics.totalCostBasis;
    totalNetPayouts += metrics.netPayouts;
    totalNetProfit += metrics.totalNetProfit;
  }

  const portfolioRoi = totalCostBasis > 0 ? (totalNetProfit / totalCostBasis) * 100 : 0;

  return {
    totalCurrentValue,
    totalInvestedCapital,
    totalFeesPaid,
    totalCostBasis,
    totalNetPayouts,
    totalNetProfit,
    portfolioRoi,
    activeProjectsCount,
    exitedProjectsCount,
  };
}

export function getCategoryLabel(category: InvestmentCategory): string {
  switch (category) {
    case 'real_estate':
      return 'Inmobiliario';
    case 'startup':
      return 'Startup / Venture';
    case 'stocks':
      return 'Bolsa / Fondos';
    case 'crypto':
      return 'Criptoactivos';
    case 'crowdlending':
      return 'Crowdlending';
    case 'debt':
      return 'Deuda Privada';
    case 'business':
      return 'Negocio Directo';
    default:
      return 'Otro';
  }
}

export function getCategoryColor(category: InvestmentCategory): string {
  switch (category) {
    case 'real_estate':
      return '#3b82f6'; // Azul
    case 'startup':
      return '#8b5cf6'; // Morado
    case 'stocks':
      return '#06b6d4'; // Cian
    case 'crypto':
      return '#f59e0b'; // Ámbar
    case 'crowdlending':
      return '#10b981'; // Esmeralda
    case 'debt':
      return '#ec4899'; // Rosa
    case 'business':
      return '#f97316'; // Naranja
    default:
      return '#64748b'; // Pizarra
  }
}

export function formatCurrency(amount: number, symbol: string = '€'): string {
  const formatted = Math.abs(amount).toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const prefix = amount < 0 ? '-' : '';
  return `${prefix}${formatted} ${symbol}`;
}

export function formatPercentage(rate: number): string {
  const sign = rate > 0 ? '+' : '';
  return `${sign}${rate.toFixed(2)}%`;
}

