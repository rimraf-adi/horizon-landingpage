/**
 * Trade Analyzer — CSV parsing + statistical computation engine.
 * Parses MT4/MT5/cTrader CSV exports and computes hard stats in code
 * so the LLM receives pre-computed structured data, NOT raw CSV.
 */

export interface ParsedTrade {
  instrument: string;
  direction: 'BUY' | 'SELL';
  entryPrice: number;
  exitPrice: number;
  lotSize: number;
  openTime: Date;
  closeTime: Date;
  pnl: number;
  commission?: number;
  swap?: number;
}

export interface ComputedStats {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  averageWin: number;
  averageLoss: number;
  averageRR: number;
  maxSingleDayLoss: number;
  maxSingleDayLossDate: string;
  daysWithin10PercentOfDailyLimit: number;
  lotSizeVarianceWins: number;
  lotSizeVarianceLosses: number;
  avgLotSizeWins: number;
  avgLotSizeLosses: number;
  avgTimeGapAfterLoss: number; // minutes
  tradesPerDayAvg: number;
  tradesPerDayMax: number;
  tradesPerDayMaxDate: string;
  totalPnl: number;
  largestWin: number;
  largestLoss: number;
  profitFactor: number;
  tradingDays: number;
  instrumentsTraded: string[];
  longestWinStreak: number;
  longestLoseStreak: number;
}

// Auto-detect CSV format and parse
export function parseTradeCSV(csvContent: string): ParsedTrade[] {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV file must contain at least a header row and one data row.');
  }

  const headerLine = lines[0].trim();
  const headers = parseCSVLine(headerLine).map(h => h.toLowerCase().trim());

  // Detect format
  const format = detectFormat(headers);
  const trades: ParsedTrade[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    try {
      const values = parseCSVLine(line);
      const trade = parseTradeLine(headers, values, format);
      if (trade) trades.push(trade);
    } catch {
      // Skip malformed rows silently
      continue;
    }
  }

  if (trades.length === 0) {
    throw new Error('No valid trades found in the CSV. Please check the file format and ensure it contains trade data.');
  }

  return trades;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if ((char === ',' || char === '\t' || char === ';') && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

type CSVFormat = 'mt4' | 'mt5' | 'ctrader' | 'generic';

function detectFormat(headers: string[]): CSVFormat {
  const headerStr = headers.join(' ');

  // MT4: "ticket", "open time", "type", "size", "item", "price", "s / l", "t / p", "close time", "price", "commission", "taxes", "swap", "profit"
  if (headerStr.includes('ticket') && headerStr.includes('item') && headerStr.includes('swap')) {
    return 'mt4';
  }

  // MT5: "position", "symbol", "type", "volume", "price", "s/l", "t/p", "time", "commission", "fee", "swap", "profit"
  if (headerStr.includes('position') && headerStr.includes('symbol') && headerStr.includes('volume')) {
    return 'mt5';
  }

  // cTrader: "position id", "symbol", "direction", "volume", "entry price", "close price", "profit"
  if (headerStr.includes('direction') && headerStr.includes('entry') && headerStr.includes('close')) {
    return 'ctrader';
  }

  return 'generic';
}

function parseTradeLine(headers: string[], values: string[], format: CSVFormat): ParsedTrade | null {
  if (values.length < 4) return null;

  const getVal = (possibleNames: string[]): string => {
    for (const name of possibleNames) {
      const idx = headers.findIndex(h => h.includes(name));
      if (idx !== -1 && idx < values.length) return values[idx];
    }
    return '';
  };

  const parseNum = (val: string): number => {
    const cleaned = val.replace(/[^0-9.\-]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  const parseDate = (val: string): Date => {
    if (!val) return new Date();
    // Try multiple date formats
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d;
    // MT4/MT5 format: "2024.01.15 10:30:00"
    const dotFormat = val.replace(/\./g, '-');
    const d2 = new Date(dotFormat);
    if (!isNaN(d2.getTime())) return d2;
    return new Date();
  };

  let trade: ParsedTrade | null = null;

  if (format === 'mt4') {
    const type = getVal(['type']).toLowerCase();
    // Skip non-trade rows (balance, credit, etc.)
    if (!type.includes('buy') && !type.includes('sell')) return null;

    trade = {
      instrument: getVal(['item', 'symbol']),
      direction: type.includes('buy') ? 'BUY' : 'SELL',
      entryPrice: parseNum(getVal(['price'])),
      exitPrice: parseNum(values[headers.lastIndexOf(headers.find(h => h.includes('price')) || '')] || '0'),
      lotSize: parseNum(getVal(['size', 'volume', 'lots'])),
      openTime: parseDate(getVal(['open time', 'open date'])),
      closeTime: parseDate(getVal(['close time', 'close date'])),
      pnl: parseNum(getVal(['profit'])),
      commission: parseNum(getVal(['commission'])),
      swap: parseNum(getVal(['swap'])),
    };
  } else if (format === 'mt5') {
    const type = getVal(['type']).toLowerCase();
    if (!type.includes('buy') && !type.includes('sell')) return null;

    trade = {
      instrument: getVal(['symbol']),
      direction: type.includes('buy') ? 'BUY' : 'SELL',
      entryPrice: parseNum(getVal(['price'])),
      exitPrice: parseNum(getVal(['close price', 'exit price'])) || parseNum(getVal(['price'])),
      lotSize: parseNum(getVal(['volume', 'lots', 'size'])),
      openTime: parseDate(getVal(['time', 'open time'])),
      closeTime: parseDate(getVal(['close time', 'closing time'])),
      pnl: parseNum(getVal(['profit'])),
      commission: parseNum(getVal(['commission'])),
      swap: parseNum(getVal(['swap'])),
    };
  } else if (format === 'ctrader') {
    const dir = getVal(['direction', 'side', 'type']).toLowerCase();
    if (!dir.includes('buy') && !dir.includes('sell') && !dir.includes('long') && !dir.includes('short')) return null;

    trade = {
      instrument: getVal(['symbol', 'instrument']),
      direction: (dir.includes('buy') || dir.includes('long')) ? 'BUY' : 'SELL',
      entryPrice: parseNum(getVal(['entry price', 'open price', 'entry'])),
      exitPrice: parseNum(getVal(['close price', 'exit price', 'close'])),
      lotSize: parseNum(getVal(['volume', 'quantity', 'lots', 'size'])),
      openTime: parseDate(getVal(['open time', 'entry time', 'opening'])),
      closeTime: parseDate(getVal(['close time', 'exit time', 'closing'])),
      pnl: parseNum(getVal(['profit', 'p/l', 'pnl', 'net profit'])),
    };
  } else {
    // Generic: try to find common columns
    const dir = getVal(['direction', 'side', 'type', 'action']).toLowerCase();
    const isBuy = dir.includes('buy') || dir.includes('long');
    const isSell = dir.includes('sell') || dir.includes('short');
    if (!isBuy && !isSell) {
      // Try to infer from P&L + prices
      const pnl = parseNum(getVal(['profit', 'p/l', 'pnl', 'net profit', 'result']));
      trade = {
        instrument: getVal(['symbol', 'instrument', 'pair', 'item', 'asset']),
        direction: pnl >= 0 ? 'BUY' : 'BUY', // default, doesn't affect stats
        entryPrice: parseNum(getVal(['entry', 'open price', 'entry price', 'price'])),
        exitPrice: parseNum(getVal(['exit', 'close price', 'exit price'])),
        lotSize: parseNum(getVal(['volume', 'lots', 'size', 'quantity', 'lot'])),
        openTime: parseDate(getVal(['open time', 'entry time', 'open date', 'date', 'time'])),
        closeTime: parseDate(getVal(['close time', 'exit time', 'close date'])),
        pnl: pnl,
      };
    } else {
      trade = {
        instrument: getVal(['symbol', 'instrument', 'pair', 'item', 'asset']),
        direction: isBuy ? 'BUY' : 'SELL',
        entryPrice: parseNum(getVal(['entry', 'open price', 'entry price', 'price'])),
        exitPrice: parseNum(getVal(['exit', 'close price', 'exit price'])),
        lotSize: parseNum(getVal(['volume', 'lots', 'size', 'quantity', 'lot'])),
        openTime: parseDate(getVal(['open time', 'entry time', 'open date', 'date', 'time'])),
        closeTime: parseDate(getVal(['close time', 'exit time', 'close date'])),
        pnl: parseNum(getVal(['profit', 'p/l', 'pnl', 'net profit', 'result'])),
      };
    }
  }

  // Validate: must have at least a P&L
  if (trade && trade.pnl === 0 && trade.entryPrice === 0 && trade.exitPrice === 0) {
    return null;
  }

  return trade;
}

// Compute all hard stats from parsed trades
export function computeStats(
  trades: ParsedTrade[],
  accountRules: {
    maxDailyLossPercent: number;
    maxDrawdownPercent: number;
    accountSize: number;
  }
): ComputedStats {
  const wins = trades.filter(t => t.pnl > 0);
  const losses = trades.filter(t => t.pnl <= 0);

  // Group trades by date
  const tradesByDay = new Map<string, ParsedTrade[]>();
  for (const trade of trades) {
    const dateKey = trade.closeTime.toISOString().split('T')[0];
    if (!tradesByDay.has(dateKey)) tradesByDay.set(dateKey, []);
    tradesByDay.get(dateKey)!.push(trade);
  }

  // Max single-day loss
  let maxSingleDayLoss = 0;
  let maxSingleDayLossDate = '';
  const dailyLossLimit = (accountRules.maxDailyLossPercent / 100) * accountRules.accountSize;
  let daysWithin10Percent = 0;

  for (const [date, dayTrades] of tradesByDay) {
    const dayPnl = dayTrades.reduce((sum, t) => sum + t.pnl, 0);
    if (dayPnl < maxSingleDayLoss) {
      maxSingleDayLoss = dayPnl;
      maxSingleDayLossDate = date;
    }
    // Check if within 10% of daily loss limit
    if (dailyLossLimit > 0 && Math.abs(dayPnl) >= dailyLossLimit * 0.9 && dayPnl < 0) {
      daysWithin10Percent++;
    }
  }

  // Lot size variance for wins vs losses
  const winLots = wins.map(t => t.lotSize).filter(l => l > 0);
  const lossLots = losses.map(t => t.lotSize).filter(l => l > 0);
  const avgLotWins = winLots.length > 0 ? winLots.reduce((a, b) => a + b, 0) / winLots.length : 0;
  const avgLotLosses = lossLots.length > 0 ? lossLots.reduce((a, b) => a + b, 0) / lossLots.length : 0;
  const varianceWins = winLots.length > 1
    ? winLots.reduce((sum, l) => sum + Math.pow(l - avgLotWins, 2), 0) / (winLots.length - 1)
    : 0;
  const varianceLosses = lossLots.length > 1
    ? lossLots.reduce((sum, l) => sum + Math.pow(l - avgLotLosses, 2), 0) / (lossLots.length - 1)
    : 0;

  // Average time gap after a loss (in minutes)
  const sortedTrades = [...trades].sort((a, b) => a.closeTime.getTime() - b.closeTime.getTime());
  let totalGapAfterLoss = 0;
  let gapCount = 0;
  for (let i = 0; i < sortedTrades.length - 1; i++) {
    if (sortedTrades[i].pnl <= 0) {
      const gap = (sortedTrades[i + 1].openTime.getTime() - sortedTrades[i].closeTime.getTime()) / (1000 * 60);
      if (gap >= 0 && gap < 60 * 24 * 7) { // Ignore gaps > 7 days
        totalGapAfterLoss += gap;
        gapCount++;
      }
    }
  }

  // Trades per day stats
  const tradeCountsByDay = Array.from(tradesByDay.values()).map(t => t.length);
  const maxTradesPerDay = Math.max(...tradeCountsByDay, 0);
  let maxTradesPerDayDate = '';
  for (const [date, dayTrades] of tradesByDay) {
    if (dayTrades.length === maxTradesPerDay) {
      maxTradesPerDayDate = date;
      break;
    }
  }

  // Win/loss streaks
  let currentStreak = 0;
  let longestWinStreak = 0;
  let longestLoseStreak = 0;
  let lastResult: 'win' | 'loss' | null = null;

  for (const trade of sortedTrades) {
    const result = trade.pnl > 0 ? 'win' : 'loss';
    if (result === lastResult) {
      currentStreak++;
    } else {
      currentStreak = 1;
      lastResult = result;
    }
    if (result === 'win' && currentStreak > longestWinStreak) longestWinStreak = currentStreak;
    if (result === 'loss' && currentStreak > longestLoseStreak) longestLoseStreak = currentStreak;
  }

  // Average R:R
  const avgWin = wins.length > 0 ? wins.reduce((s, t) => s + t.pnl, 0) / wins.length : 0;
  const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((s, t) => s + t.pnl, 0) / losses.length) : 0;
  const avgRR = avgLoss > 0 ? avgWin / avgLoss : 0;

  // Profit factor
  const grossProfit = wins.reduce((s, t) => s + t.pnl, 0);
  const grossLoss = Math.abs(losses.reduce((s, t) => s + t.pnl, 0));
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;

  // Instruments traded
  const instruments = [...new Set(trades.map(t => t.instrument).filter(Boolean))];

  return {
    totalTrades: trades.length,
    winningTrades: wins.length,
    losingTrades: losses.length,
    winRate: trades.length > 0 ? (wins.length / trades.length) * 100 : 0,
    averageWin: avgWin,
    averageLoss: avgLoss > 0 ? -avgLoss : 0,
    averageRR: avgRR,
    maxSingleDayLoss,
    maxSingleDayLossDate,
    daysWithin10PercentOfDailyLimit: daysWithin10Percent,
    lotSizeVarianceWins: varianceWins,
    lotSizeVarianceLosses: varianceLosses,
    avgLotSizeWins: avgLotWins,
    avgLotSizeLosses: avgLotLosses,
    avgTimeGapAfterLoss: gapCount > 0 ? totalGapAfterLoss / gapCount : 0,
    tradesPerDayAvg: tradesByDay.size > 0 ? trades.length / tradesByDay.size : 0,
    tradesPerDayMax: maxTradesPerDay,
    tradesPerDayMaxDate: maxTradesPerDayDate,
    totalPnl: trades.reduce((s, t) => s + t.pnl, 0),
    largestWin: wins.length > 0 ? Math.max(...wins.map(t => t.pnl)) : 0,
    largestLoss: losses.length > 0 ? Math.min(...losses.map(t => t.pnl)) : 0,
    profitFactor,
    tradingDays: tradesByDay.size,
    instrumentsTraded: instruments,
    longestWinStreak,
    longestLoseStreak,
  };
}

// Build the structured JSON to send to the LLM
export function buildLLMPayload(
  stats: ComputedStats,
  accountContext: {
    firmName: string;
    phase: string;
    accountSize: number;
    maxDailyLossPercent: number;
    maxDrawdownPercent: number;
    profitTargetPercent: number;
  },
  questionnaire: Record<string, string>
): object {
  return {
    account: accountContext,
    computedStatistics: {
      totalTrades: stats.totalTrades,
      winRate: `${stats.winRate.toFixed(1)}%`,
      averageWin: `$${stats.averageWin.toFixed(2)}`,
      averageLoss: `$${stats.averageLoss.toFixed(2)}`,
      averageRiskReward: stats.averageRR.toFixed(2),
      profitFactor: stats.profitFactor === Infinity ? 'Infinite (no losses)' : stats.profitFactor.toFixed(2),
      totalPnL: `$${stats.totalPnl.toFixed(2)}`,
      largestWin: `$${stats.largestWin.toFixed(2)}`,
      largestLoss: `$${stats.largestLoss.toFixed(2)}`,
      maxSingleDayLoss: `$${stats.maxSingleDayLoss.toFixed(2)} (on ${stats.maxSingleDayLossDate})`,
      daysWithin10PercentOfDailyLossLimit: stats.daysWithin10PercentOfDailyLimit,
      maxDailyLossLimitDollar: `$${((accountContext.maxDailyLossPercent / 100) * accountContext.accountSize).toFixed(2)}`,
      maxDrawdownLimitDollar: `$${((accountContext.maxDrawdownPercent / 100) * accountContext.accountSize).toFixed(2)}`,
      avgLotSizeOnWins: stats.avgLotSizeWins.toFixed(2),
      avgLotSizeOnLosses: stats.avgLotSizeLosses.toFixed(2),
      lotSizeVarianceOnWins: stats.lotSizeVarianceWins.toFixed(4),
      lotSizeVarianceOnLosses: stats.lotSizeVarianceLosses.toFixed(4),
      avgMinutesBeforeNextTradeAfterLoss: stats.avgTimeGapAfterLoss.toFixed(1),
      averageTradesPerDay: stats.tradesPerDayAvg.toFixed(1),
      maxTradesInSingleDay: `${stats.tradesPerDayMax} (on ${stats.tradesPerDayMaxDate})`,
      tradingDays: stats.tradingDays,
      instrumentsTraded: stats.instrumentsTraded.join(', '),
      longestWinStreak: stats.longestWinStreak,
      longestLosingStreak: stats.longestLoseStreak,
    },
    selfReportedBehavior: questionnaire,
  };
}
