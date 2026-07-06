'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Upload, FileText, AlertTriangle, CheckCircle, Loader,
  Shield, Brain, Target, ChevronDown,
  Download, BarChart3, X, Mail, Zap,
  TrendingUp, TrendingDown, Clock, Scale, Activity, PieChart as PieChartIcon, Check, Info,
  Crosshair, Flame, HeartPulse, Lightbulb, Award
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const FIRM_DEFAULTS: Record<string, { dailyLoss: number; drawdown: number; profitTarget: number }> = {
  'FTMO': { dailyLoss: 5, drawdown: 10, profitTarget: 10 },
  'The5%ers': { dailyLoss: 4, drawdown: 6, profitTarget: 6 },
  'Funded Trader': { dailyLoss: 5, drawdown: 10, profitTarget: 10 },
  'MyForexFunds': { dailyLoss: 5, drawdown: 12, profitTarget: 8 },
  'True Forex Funds': { dailyLoss: 5, drawdown: 10, profitTarget: 8 },
  'Surge Trader': { dailyLoss: 4, drawdown: 8, profitTarget: 10 },
  'Other': { dailyLoss: 5, drawdown: 10, profitTarget: 10 },
};

const FIRMS = Object.keys(FIRM_DEFAULTS);
const PHASES = ['Challenge', 'Verification', 'Funded', 'Personal Account'];

interface AnalysisSection {
  id: string;
  title: string;
  severity: 'good' | 'warning' | 'danger' | 'info';
  score: number | null;
  summary: string;
  detail: string;
}

interface StructuredAnalysis {
  overallScore: number | null;
  overallVerdict: string;
  sections: AnalysisSection[];
}

interface AnalysisResult {
  analysis: StructuredAnalysis;
  stats: Record<string, any>;
}

type PageState = 'form' | 'loading' | 'results' | 'error';

const QUESTIONNAIRE_ITEMS = [
  {
    key: 'moveStopLoss',
    label: 'Do you move your stop loss after entering a trade?',
    options: ['Never', 'Sometimes', 'Often'],
  },
  {
    key: 'increaseSizeAfterWin',
    label: 'Do you increase position size after a win?',
    options: ['Yes', 'No'],
  },
  {
    key: 'reenterAfterLoss',
    label: 'Do you re-enter quickly after a loss?',
    options: ['Yes', 'No', 'Sometimes'],
  },
  {
    key: 'maxTradesPerDay',
    label: "What's the most trades you've taken in a single day?",
    type: 'number' as const,
  },
  {
    key: 'setupConsistency',
    label: 'Do you trade the same setup every time, or improvise?',
    options: ['Consistent', 'Improvise'],
  },
  {
    key: 'useJournal',
    label: 'Do you maintain a trade journal?',
    options: ['Yes, detailed', 'Basic notes', 'No'],
  },
  {
    key: 'tradeDuringNews',
    label: 'Do you trade during high-impact news events?',
    options: ['Always', 'Sometimes', 'Never'],
  },
  {
    key: 'holdOvernight',
    label: 'Do you hold trades overnight or over the weekend?',
    options: ['Frequently', 'Occasionally', 'Never'],
  },
];

export default function TradeCheckPage() {
  const [firmName, setFirmName] = useState('');
  const [customFirm, setCustomFirm] = useState('');
  const [phase, setPhase] = useState('');
  const [accountSize, setAccountSize] = useState('');
  const [maxDailyLoss, setMaxDailyLoss] = useState('');
  const [maxDrawdown, setMaxDrawdown] = useState('');
  const [profitTarget, setProfitTarget] = useState('');
  const [email, setEmail] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [questionnaire, setQuestionnaire] = useState<Record<string, string>>({});

  const [pageState, setPageState] = useState<PageState>('form');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const screenshotInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleFirmChange = useCallback((firm: string) => {
    setFirmName(firm);
    const defaults = FIRM_DEFAULTS[firm];
    if (defaults) {
      setMaxDailyLoss(defaults.dailyLoss.toString());
      setMaxDrawdown(defaults.drawdown.toString());
      setProfitTarget(defaults.profitTarget.toString());
    }
  }, []);

  const handleCSVUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['text/csv', 'application/vnd.ms-excel', 'text/plain'];
    const isCSV = validTypes.includes(file.type) || file.name.endsWith('.csv') || file.name.endsWith('.txt');

    if (!isCSV) {
      setErrorMessage('Please upload a CSV file (.csv) exported from MT4, MT5, or cTrader.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content || content.trim().split('\n').length < 2) {
        setErrorMessage('The file appears to be empty or has no data rows.');
        return;
      }
      const firstLine = content.trim().split('\n')[0];
      if (!firstLine.includes(',') && !firstLine.includes('\t') && !firstLine.includes(';')) {
        setErrorMessage('The file does not appear to be a valid CSV. Please check the format.');
        return;
      }
      setErrorMessage('');
      setCsvFile(file);
    };
    reader.readAsText(file.slice(0, 5000));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const resolvedFirm = firmName === 'Other' ? (customFirm || 'Other') : firmName;
    if (!resolvedFirm || !phase || !accountSize || !maxDailyLoss || !maxDrawdown) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }
    if (!csvFile) {
      setErrorMessage('Please upload your trade history CSV file.');
      return;
    }
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setErrorMessage('Please enter a valid email address.');
        return;
      }
    }

    setPageState('loading');

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('firmName', resolvedFirm);
      formData.append('phase', phase);
      formData.append('accountSize', accountSize);
      formData.append('maxDailyLoss', maxDailyLoss);
      formData.append('maxDrawdown', maxDrawdown);
      formData.append('profitTarget', profitTarget || '0');
      formData.append('csvFile', csvFile);
      formData.append('questionnaire', JSON.stringify(questionnaire));

      const response = await fetch('/api/trade-check/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || data.error || 'Analysis failed. Please try again.');
        setPageState('form');
        return;
      }

      setResult({ analysis: data.analysis, stats: data.stats });
      setPageState('results');

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);

    } catch (err: any) {
      console.error('Submit error:', err);
      setErrorMessage('Network error. Please check your connection and try again.');
      setPageState('form');
    }
  }, [firmName, customFirm, phase, accountSize, maxDailyLoss, maxDrawdown, profitTarget, email, csvFile, questionnaire]);

  const handleDownloadPDF = useCallback(() => {
    if (!result) return;

    const severityColors: Record<string, { bg: string; border: string; label: string; labelBg: string }> = {
      good: { bg: '#ecfdf5', border: '#10b981', label: '#065f46', labelBg: '#d1fae5' },
      warning: { bg: '#fffbeb', border: '#f59e0b', label: '#92400e', labelBg: '#fef3c7' },
      danger: { bg: '#fef2f2', border: '#ef4444', label: '#991b1b', labelBg: '#fee2e2' },
      info: { bg: '#eff6ff', border: '#3b82f6', label: '#1e40af', labelBg: '#dbeafe' },
    };

    const sections = result.analysis.sections || [];
    const overallScore = result.analysis.overallScore;
    const overallVerdict = result.analysis.overallVerdict;

    const scoreColor = overallScore !== null 
      ? (overallScore >= 70 ? '#10b981' : overallScore >= 40 ? '#f59e0b' : '#ef4444')
      : '#6B7280';

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Trade Health Check Report — Prop Trading Cockpit</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #111827; padding: 40px; line-height: 1.6; background: #fff; }
          .header { text-align: center; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 2px solid #030213; }
          .header h1 { font-size: 26px; margin-bottom: 4px; letter-spacing: -0.5px; }
          .header p { font-size: 12px; color: #6B7280; }
          h2 { font-size: 18px; margin: 28px 0 14px; color: #030213; }
          p { margin-bottom: 8px; font-size: 13px; }
          .stats-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px; margin: 16px 0; }
          .stat-item { padding: 12px 14px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; }
          .stat-label { font-size: 10px; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
          .stat-value { font-size: 16px; font-weight: 700; }
          .stat-value.positive { color: #059669; }
          .stat-value.negative { color: #dc2626; }
          .score-hero { display: flex; align-items: center; gap: 24px; padding: 28px; background: #f9fafb; border-radius: 16px; border: 1px solid #e5e7eb; margin: 20px 0 28px; }
          .score-circle { width: 90px; height: 90px; border-radius: 50%; border: 6px solid #e5e7eb; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
          .score-number { font-size: 32px; font-weight: 800; }
          .score-text h3 { font-size: 18px; margin-bottom: 4px; }
          .score-text p { font-size: 13px; color: #4b5563; margin: 0; }
          .section-card { padding: 18px 20px; border-radius: 12px; border-left: 4px solid; margin-bottom: 14px; page-break-inside: avoid; }
          .section-title { font-size: 14px; font-weight: 700; margin-bottom: 6px; display: flex; align-items: center; gap: 8px; }
          .severity-badge { font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px; }
          .section-summary { font-size: 13px; font-weight: 600; color: #1f2937; margin-bottom: 6px; }
          .section-detail { font-size: 12px; color: #4b5563; line-height: 1.7; margin: 0; }
          .section-score { font-size: 12px; font-weight: 700; float: right; }
          .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #6B7280; border-top: 1px solid #E5E7EB; padding-top: 16px; }
          @media print { body { padding: 20px; } .section-card { break-inside: avoid; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Trade Health Check Report</h1>
          <p>Generated by Prop Trading Cockpit — ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        ${overallScore !== null ? `
        <div class="score-hero">
          <div class="score-circle" style="border-color: ${scoreColor};">
            <span class="score-number" style="color: ${scoreColor};">${overallScore}</span>
          </div>
          <div class="score-text">
            <h3>Overall Assessment</h3>
            <p>${overallVerdict || ''}</p>
          </div>
        </div>
        ` : ''}

        <h2>Performance Statistics</h2>
        <div class="stats-grid">
          <div class="stat-item"><div class="stat-label">Total P&L</div><div class="stat-value ${result.stats.totalPnl >= 0 ? 'positive' : 'negative'}">\$${result.stats.totalPnl?.toFixed(2)}</div></div>
          <div class="stat-item"><div class="stat-label">Win Rate</div><div class="stat-value ${result.stats.winRate >= 50 ? 'positive' : 'negative'}">${result.stats.winRate?.toFixed(1)}%</div></div>
          <div class="stat-item"><div class="stat-label">Profit Factor</div><div class="stat-value">${result.stats.profitFactor === Infinity ? '∞' : result.stats.profitFactor?.toFixed(2)}</div></div>
          <div class="stat-item"><div class="stat-label">Trading Days</div><div class="stat-value">${result.stats.tradingDays}</div></div>
          <div class="stat-item"><div class="stat-label">Total Trades</div><div class="stat-value">${result.stats.totalTrades}</div></div>
          <div class="stat-item"><div class="stat-label">Avg Win</div><div class="stat-value positive">\$${result.stats.averageWin?.toFixed(2)}</div></div>
          <div class="stat-item"><div class="stat-label">Avg Loss</div><div class="stat-value negative">\$${result.stats.averageLoss?.toFixed(2)}</div></div>
          <div class="stat-item"><div class="stat-label">Avg R:R</div><div class="stat-value">${result.stats.averageRR?.toFixed(2)}</div></div>
          <div class="stat-item"><div class="stat-label">Max Day Loss</div><div class="stat-value negative">\$${result.stats.maxSingleDayLoss?.toFixed(2)}</div></div>
          <div class="stat-item"><div class="stat-label">Largest Win</div><div class="stat-value positive">\$${result.stats.largestWin?.toFixed(2)}</div></div>
          <div class="stat-item"><div class="stat-label">Largest Loss</div><div class="stat-value negative">\$${result.stats.largestLoss?.toFixed(2)}</div></div>
          <div class="stat-item"><div class="stat-label">Days Near Limit</div><div class="stat-value ${result.stats.daysWithin10PercentOfDailyLimit > 0 ? 'negative' : ''}">${result.stats.daysWithin10PercentOfDailyLimit}</div></div>
        </div>

        <h2>AI Risk Analysis</h2>
        ${sections.map(s => {
          const c = severityColors[s.severity] || severityColors.info;
          return `
            <div class="section-card" style="background: ${c.bg}; border-left-color: ${c.border};">
              <div class="section-title">
                ${s.title}
                ${s.score !== null ? `<span class="section-score" style="color: ${c.border};">${s.score}/100</span>` : ''}
              </div>
              <div class="severity-badge" style="background: ${c.labelBg}; color: ${c.label}; display: inline-block; margin-bottom: 8px;">${s.severity.toUpperCase()}</div>
              <p class="section-summary">${s.summary}</p>
              <p class="section-detail">${s.detail}</p>
            </div>
          `;
        }).join('')}

        <div class="footer">
          <p>This report is generated automatically by Prop Trading Cockpit Trade Health Check.</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 500);
    }
  }, [result]);

  return (
    <main className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-card/70 text-sm mb-6">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Free Trade Analysis Tool</span>
          </div>
          <h1 className="text-4xl md:text-5xl tracking-tight mb-4">
            Trade Health Check
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload your trade history and get an AI-powered risk analysis with actionable insights — tailored to your prop firm rules.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {pageState === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-24"
            >
              <div className="rounded-2xl border bg-card/70 p-12 text-center max-w-md mx-auto">
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mx-auto">
                    <BarChart3 className="w-10 h-10 text-primary-foreground animate-pulse" />
                  </div>
                </div>
                <h2 className="text-xl font-semibold mb-2">Crunching your trade history...</h2>
                <p className="text-muted-foreground mb-4">Our AI is analyzing your performance data, cross-referencing your behavior patterns, and checking your risk limits.</p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader className="w-4 h-4 animate-spin" />
                  This may take 15–30 seconds
                </div>
              </div>
            </motion.div>
          )}

          {pageState === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <form onSubmit={handleSubmit} className="space-y-8">
                <AnimatePresence>
                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive"
                    >
                      <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Error</p>
                        <p className="text-sm">{errorMessage}</p>
                      </div>
                      <button type="button" onClick={() => setErrorMessage('')} className="ml-auto">
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Section 1: Account Context */}
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <div className="rounded-2xl border bg-card/50 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                        <Target className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold">Account Context</h2>
                        <p className="text-sm text-muted-foreground">Tell us about your trading account</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="firmName" className="block text-sm font-medium mb-2">Prop Firm *</label>
                        <div className="relative">
                          <select
                            id="firmName"
                            value={firmName}
                            onChange={(e) => handleFirmChange(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-background border text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none cursor-pointer"
                            required
                          >
                            <option value="">Select firm...</option>
                            {FIRMS.map(f => <option key={f} value={f}>{f}</option>)}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        </div>
                        {firmName === 'Other' && (
                          <input
                            type="text"
                            value={customFirm}
                            onChange={(e) => setCustomFirm(e.target.value)}
                            placeholder="Enter firm name..."
                            className="mt-2 w-full px-4 py-3 rounded-xl bg-background border text-foreground focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                          />
                        )}
                      </div>

                      <div>
                        <label htmlFor="phase" className="block text-sm font-medium mb-2">Account Phase *</label>
                        <div className="relative">
                          <select
                            id="phase"
                            value={phase}
                            onChange={(e) => setPhase(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-background border text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none cursor-pointer"
                            required
                          >
                            <option value="">Select phase...</option>
                            {PHASES.map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="accountSize" className="block text-sm font-medium mb-2">Account Size ($) *</label>
                        <input
                          id="accountSize"
                          type="number"
                          value={accountSize}
                          onChange={(e) => setAccountSize(e.target.value)}
                          placeholder="e.g. 100000"
                          className="w-full px-4 py-3 rounded-xl bg-background border text-foreground focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                          required
                          min="1"
                        />
                      </div>

                      <div>
                        <label htmlFor="maxDailyLoss" className="block text-sm font-medium mb-2">Max Daily Loss (%) *</label>
                        <input
                          id="maxDailyLoss"
                          type="number"
                          step="0.1"
                          value={maxDailyLoss}
                          onChange={(e) => setMaxDailyLoss(e.target.value)}
                          placeholder="e.g. 5"
                          className="w-full px-4 py-3 rounded-xl bg-background border text-foreground focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                          required
                          min="0.1"
                        />
                      </div>

                      <div>
                        <label htmlFor="maxDrawdown" className="block text-sm font-medium mb-2">Max Total Drawdown (%) *</label>
                        <input
                          id="maxDrawdown"
                          type="number"
                          step="0.1"
                          value={maxDrawdown}
                          onChange={(e) => setMaxDrawdown(e.target.value)}
                          placeholder="e.g. 10"
                          className="w-full px-4 py-3 rounded-xl bg-background border text-foreground focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                          required
                          min="0.1"
                        />
                      </div>

                      <div>
                        <label htmlFor="profitTarget" className="block text-sm font-medium mb-2">Profit Target (%)</label>
                        <input
                          id="profitTarget"
                          type="number"
                          step="0.1"
                          value={profitTarget}
                          onChange={(e) => setProfitTarget(e.target.value)}
                          placeholder="e.g. 10"
                          className="w-full px-4 py-3 rounded-xl bg-background border text-foreground focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Section 2: Trade History Upload */}
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <div className="rounded-2xl border bg-card/50 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                        <Upload className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold">Trade History</h2>
                        <p className="text-sm text-muted-foreground">Upload your CSV export from MT4, MT5, or cTrader</p>
                      </div>
                    </div>

                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all hover:border-primary ${
                        csvFile ? 'border-primary bg-accent/50' : 'border-border'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.txt"
                        onChange={handleCSVUpload}
                        className="hidden"
                      />
                      {csvFile ? (
                        <div className="flex items-center justify-center gap-3">
                          <CheckCircle className="w-8 h-8 text-primary" />
                          <div className="text-left">
                            <p className="font-medium">{csvFile.name}</p>
                            <p className="text-sm text-muted-foreground">{(csvFile.size / 1024).toFixed(1)} KB — Click to replace</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <FileText className="w-12 h-12 text-primary mx-auto mb-3 opacity-60" />
                          <p className="font-medium mb-1">Drop your trade CSV here or click to browse</p>
                          <p className="text-sm text-muted-foreground">Supports MT4, MT5, and cTrader exports (.csv)</p>
                        </>
                      )}
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm text-muted-foreground mb-2">Optional: Upload a dashboard screenshot (for future review)</label>
                      <div
                        onClick={() => screenshotInputRef.current?.click()}
                        className={`border border-dashed rounded-xl p-4 text-center cursor-pointer transition-all hover:border-primary text-sm ${
                          screenshotFile ? 'border-primary' : 'border-border'
                        }`}
                      >
                        <input
                          ref={screenshotInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => setScreenshotFile(e.target.files?.[0] || null)}
                          className="hidden"
                        />
                        {screenshotFile ? (
                          <span className="text-primary">✓ {screenshotFile.name}</span>
                        ) : (
                          <span className="text-muted-foreground">Click to upload screenshot (optional)</span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Section 3: Behavioral Questionnaire */}
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  <div className="rounded-2xl border bg-card/50 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                        <Brain className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold">Behavioral Assessment</h2>
                        <p className="text-sm text-muted-foreground">Help us cross-reference your habits against your data</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {QUESTIONNAIRE_ITEMS.map((item) => (
                        <div key={item.key}>
                          <label className="block text-sm font-medium mb-3">{item.label}</label>
                          {item.type === 'number' ? (
                            <input
                              type="number"
                              value={questionnaire[item.key] || ''}
                              onChange={(e) => setQuestionnaire(prev => ({ ...prev, [item.key]: e.target.value }))}
                              placeholder="e.g. 8"
                              className="w-full max-w-[200px] px-4 py-3 rounded-xl bg-background border text-foreground focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                              min="1"
                            />
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {item.options?.map((opt) => (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => setQuestionnaire(prev => ({ ...prev, [item.key]: opt }))}
                                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                    questionnaire[item.key] === opt
                                      ? 'bg-primary text-primary-foreground'
                                      : 'bg-background border text-muted-foreground hover:border-primary hover:text-foreground'
                                  }`}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Section 4: Submit */}
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                >
                  <div className="flex justify-center mt-12 mb-8">
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full bg-primary text-primary-foreground font-bold hover:bg-primary/90 hover:scale-105 transition-all shadow-lg text-lg min-w-[280px]"
                    >
                      <Zap className="w-6 h-6" />
                      Analyze My Trades
                    </button>
                  </div>
                </motion.div>
              </form>
            </motion.div>
          )}

          {/* Results */}
          {pageState === 'results' && result && (
            <motion.div
              key="results"
              ref={resultsRef}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="rounded-2xl border bg-card/50 p-6 flex items-center gap-4 border-l-4 border-primary">
                <CheckCircle className="w-8 h-8 text-primary flex-shrink-0" />
                <div className="flex-1">
                  <h2 className="text-lg font-semibold">Analysis Complete</h2>
                  <p className="text-sm text-muted-foreground">Your Trade Health Check report is ready. Review the insights below.</p>
                </div>
                <button
                  onClick={handleDownloadPDF}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all text-sm"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <div className="rounded-2xl border bg-card/50 p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">Performance Statistics</h2>
                      <p className="text-sm text-muted-foreground">Data-driven insights from your trading history</p>
                    </div>
                  </div>

                  {/* Bento Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    <StatCard className="col-span-2 md:col-span-1" label="Total P&L" value={`$${result.stats.totalPnl?.toFixed(2)}`} highlight={result.stats.totalPnl > 0} danger={result.stats.totalPnl < 0} />
                    <StatCard className="col-span-2 md:col-span-1" label="Win Rate" value={`${result.stats.winRate?.toFixed(1)}%`} highlight={result.stats.winRate >= 50} />
                    <StatCard className="col-span-2 md:col-span-1" label="Profit Factor" value={result.stats.profitFactor === Infinity ? '∞' : result.stats.profitFactor?.toFixed(2)} highlight={result.stats.profitFactor >= 1} />
                    <StatCard className="col-span-2 md:col-span-1" label="Trading Days" value={result.stats.tradingDays} />

                    {/* Area Chart: Cumulative PnL */}
                    <div className="col-span-2 md:col-span-3 row-span-2 rounded-3xl border bg-card p-6 flex flex-col hover:border-primary/30 transition-all">
                      <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-primary" /> Cumulative P&L Over Time
                      </h3>
                        <div className="flex-1 min-h-[250px] w-full flex items-center justify-center">
                        {result.stats.pnlSeries && result.stats.pnlSeries.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={result.stats.pnlSeries} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                              <defs>
                                <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor={result.stats.totalPnl >= 0 ? '#10b981' : '#ef4444'} stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor={result.stats.totalPnl >= 0 ? '#10b981' : '#ef4444'} stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                              <XAxis 
                                dataKey="date" 
                                tickLine={false} 
                                axisLine={false} 
                                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                                tickFormatter={(val) => {
                                  const date = new Date(val);
                                  return `${date.getMonth()+1}/${date.getDate()}`;
                                }}
                              />
                              <YAxis 
                                tickLine={false} 
                                axisLine={false} 
                                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                                tickFormatter={(val) => `$${val}`}
                              />
                              <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))' }}
                                itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                                labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}
                                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Cumulative P&L']}
                              />
                              <Area 
                                type="monotone" 
                                dataKey="cumulativePnl" 
                                stroke={result.stats.totalPnl >= 0 ? '#10b981' : '#ef4444'} 
                                strokeWidth={2}
                                fillOpacity={1} 
                                fill="url(#colorPnl)" 
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="text-muted-foreground text-sm">Not enough data to display chart. Please re-analyze to generate P&L series.</div>
                        )}
                      </div>
                    </div>

                    {/* Donut Chart: Win/Loss Ratio */}
                    <div className="col-span-2 md:col-span-1 row-span-2 rounded-3xl border bg-card p-6 flex flex-col hover:border-primary/30 transition-all justify-between">
                       <h3 className="text-sm font-semibold mb-4 w-full text-left flex items-center gap-2">
                          <PieChartIcon className="w-4 h-4 text-primary" /> Win/Loss Ratio
                        </h3>
                        <div className="flex-1 min-h-[200px] w-full flex items-center justify-center">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={[
                                  { name: 'Wins', value: result.stats.winningTrades, fill: '#10b981' },
                                  { name: 'Losses', value: result.stats.losingTrades, fill: '#ef4444' }
                                ]}
                                cx="50%"
                                cy="50%"
                                innerRadius="60%"
                                outerRadius="80%"
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                              />
                              <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))' }}
                                itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="flex items-center justify-between w-full mt-6 px-4">
                          <div className="flex flex-col items-start gap-1">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-[#10b981]" />
                              <span className="text-xl font-bold">{result.stats.winningTrades}</span>
                            </div>
                            <span className="text-sm text-muted-foreground ml-5">Wins</span>
                          </div>
                          <div className="flex flex-col items-start gap-1">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
                              <span className="text-xl font-bold">{result.stats.losingTrades}</span>
                            </div>
                            <span className="text-sm text-muted-foreground ml-5">Losses</span>
                          </div>
                        </div>
                    </div>

                    {/* Secondary Metrics Grid */}
                    <StatCard className="col-span-2 md:col-span-1" label="Total Trades" value={result.stats.totalTrades} />
                    <StatCard className="col-span-2 md:col-span-1" label="Avg Win" value={`$${result.stats.averageWin?.toFixed(2)}`} highlight />
                    <StatCard className="col-span-2 md:col-span-1" label="Avg Loss" value={`$${result.stats.averageLoss?.toFixed(2)}`} danger />
                    <StatCard className="col-span-2 md:col-span-1" label="Avg R:R" value={result.stats.averageRR?.toFixed(2)} highlight={result.stats.averageRR >= 1} />
                    <StatCard className="col-span-2 md:col-span-1" label="Max Day Loss" value={`$${result.stats.maxSingleDayLoss?.toFixed(2)}`} danger />
                    <StatCard className="col-span-2 md:col-span-1" label="Largest Win" value={`$${result.stats.largestWin?.toFixed(2)}`} highlight />
                    <StatCard className="col-span-2 md:col-span-1" label="Largest Loss" value={`$${result.stats.largestLoss?.toFixed(2)}`} danger />
                    <StatCard className="col-span-2 md:col-span-1" label="Avg Lot (Wins)" value={result.stats.avgLotSizeWins?.toFixed(2)} />
                    <StatCard className="col-span-2 md:col-span-1" label="Avg Lot (Losses)" value={result.stats.avgLotSizeLosses?.toFixed(2)} />
                    <StatCard className="col-span-2 md:col-span-1" label="Win Streak" value={result.stats.longestWinStreak} highlight />
                    <StatCard className="col-span-2 md:col-span-1" label="Lose Streak" value={result.stats.longestLoseStreak} danger={result.stats.longestLoseStreak >= 5} />
                    <StatCard className="col-span-2 md:col-span-1" label="Days Near Limit" value={result.stats.daysWithin10PercentOfDailyLimit} danger={result.stats.daysWithin10PercentOfDailyLimit > 0} />
                  </div>

                  {result.stats.instrumentsTraded?.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-border/50">
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Scale className="w-4 h-4" />
                        <span className="font-medium text-foreground">Instruments traded:</span>{' '}
                        {result.stats.instrumentsTraded.join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                {/* Overall Score Hero */}
                {result.analysis.overallScore !== null && (
                  <div className="rounded-3xl border bg-card p-10 mb-8 flex flex-col md:flex-row items-center gap-8">
                    <div className="relative w-40 h-40 flex-shrink-0">
                      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                        <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
                        <circle 
                          cx="60" cy="60" r="52" fill="none" 
                          stroke={result.analysis.overallScore >= 70 ? '#10b981' : result.analysis.overallScore >= 40 ? '#f59e0b' : '#ef4444'}
                          strokeWidth="8" 
                          strokeLinecap="round"
                          strokeDasharray={`${(result.analysis.overallScore / 100) * 327} 327`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-4xl font-black ${
                          result.analysis.overallScore >= 70 ? 'text-emerald-500' : 
                          result.analysis.overallScore >= 40 ? 'text-amber-500' : 'text-destructive'
                        }`}>{result.analysis.overallScore}</span>
                        <span className="text-xs text-muted-foreground font-medium">/ 100</span>
                      </div>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h2 className="text-2xl font-bold mb-2">Overall Assessment</h2>
                      <p className="text-lg text-muted-foreground leading-relaxed">{result.analysis.overallVerdict}</p>
                    </div>
                  </div>
                )}

                {/* Section Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {result.analysis.sections.map((section, i) => {
                    const severityConfig = {
                      good: { bg: 'bg-emerald-500/5', border: 'border-emerald-500/30', accent: 'bg-emerald-500', text: 'text-emerald-500', bar: 'bg-emerald-500' },
                      warning: { bg: 'bg-amber-500/5', border: 'border-amber-500/30', accent: 'bg-amber-500', text: 'text-amber-500', bar: 'bg-amber-500' },
                      danger: { bg: 'bg-red-500/5', border: 'border-red-500/30', accent: 'bg-red-500', text: 'text-red-500', bar: 'bg-red-500' },
                      info: { bg: 'bg-blue-500/5', border: 'border-blue-500/30', accent: 'bg-blue-500', text: 'text-blue-500', bar: 'bg-blue-500' },
                    };
                    const config = severityConfig[section.severity] || severityConfig.info;

                    const iconMap: Record<string, React.ReactNode> = {
                      risk_management: <Shield className="w-5 h-5" />,
                      prop_firm_compliance: <Target className="w-5 h-5" />,
                      win_rate_expectancy: <TrendingUp className="w-5 h-5" />,
                      lot_size_consistency: <Scale className="w-5 h-5" />,
                      trade_timing: <Clock className="w-5 h-5" />,
                      behavioral_flags: <Flame className="w-5 h-5" />,
                      drawdown_recovery: <HeartPulse className="w-5 h-5" />,
                      discipline: <Crosshair className="w-5 h-5" />,
                      recommendations: <Lightbulb className="w-5 h-5" />,
                      readiness_score: <Award className="w-5 h-5" />,
                      raw_analysis: <Brain className="w-5 h-5" />,
                    };

                    // Make recommendations and readiness_score span full width
                    const isFullWidth = section.id === 'recommendations' || section.id === 'readiness_score';

                    return (
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 + (i * 0.08) }}
                        key={section.id}
                        className={`rounded-3xl border overflow-hidden ${config.bg} ${config.border} ${isFullWidth ? 'md:col-span-2' : ''}`}
                      >
                        <div className="p-6">
                          {/* Header row: icon + title + score */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl ${config.accent} bg-opacity-20 flex items-center justify-center ${config.text}`}>
                                {iconMap[section.id] || <Info className="w-5 h-5" />}
                              </div>
                              <h3 className="text-base font-bold">{section.title}</h3>
                            </div>
                            {section.score !== null && (
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-2 rounded-full bg-border/30 overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full ${config.bar} transition-all duration-700`}
                                    style={{ width: `${section.score}%` }}
                                  />
                                </div>
                                <span className={`text-sm font-bold ${config.text}`}>{section.score}</span>
                              </div>
                            )}
                          </div>

                          {/* Summary */}
                          <p className="font-semibold text-foreground mb-2 text-[15px]">{section.summary}</p>

                          {/* Detail */}
                          <p className="text-sm text-muted-foreground leading-relaxed">{section.detail}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          )}

          {pageState === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-16"
            >
              <div className="rounded-2xl border bg-card/70 p-12 text-center max-w-md mx-auto">
                <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
                <p className="text-muted-foreground mb-6">{errorMessage || 'An unexpected error occurred.'}</p>
                <button
                  onClick={() => { setPageState('form'); setErrorMessage(''); }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Try Again
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

function StatCard({ label, value, highlight, danger, className, valueClassName }: {
  label: string;
  value: string | number;
  highlight?: boolean;
  danger?: boolean;
  className?: string;
  valueClassName?: string;
}) {
  return (
    <div className={`p-6 rounded-3xl bg-card border hover:border-primary/30 transition-all flex flex-col justify-center ${className || ''}`}>
      <p className="text-sm text-muted-foreground mb-2">{label}</p>
      <p className={`text-2xl md:text-3xl font-bold tracking-tight ${
        danger ? 'text-destructive' : highlight ? 'text-primary' : 'text-foreground'
      } ${valueClassName || ''}`}>
        {value}
      </p>
    </div>
  );
}
