'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Upload, FileText, AlertTriangle, CheckCircle, Loader,
  TrendingUp, Shield, Brain, Target, ChevronDown, Send, MessageCircle,
  Download, BarChart3, X, Mail, Clock, Zap, ArrowRight, Lock
} from 'lucide-react';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations';

// ─── Prop firm defaults ──────────────────────────────────────────────
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

// ─── Types ───────────────────────────────────────────────────────────
interface AnalysisResult {
  analysis: string;
  stats: Record<string, any>;
}

type PageState = 'form' | 'loading' | 'results' | 'email_blocked' | 'error';

// ─── Questionnaire items ─────────────────────────────────────────────
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

// ─── Component ───────────────────────────────────────────────────────
export default function TradeCheckPage() {
  // Form state
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

  // Page state
  const [pageState, setPageState] = useState<PageState>('form');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasUsedAnalysis, setHasUsedAnalysis] = useState(false);
  const [showFreeTrialPopup, setShowFreeTrialPopup] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  // Booking form
  const [bookingEmail, setBookingEmail] = useState('');
  const [bookingContact, setBookingContact] = useState('');
  const [bookingNote, setBookingNote] = useState('');
  const [bookingSubmitted, setBookingSubmitted] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const screenshotInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Check if IP is already blocked on mount or local storage analysis used
  useEffect(() => {
    try {
      const used = localStorage.getItem('trade_audit_used') === 'true';
      if (used) {
        setHasUsedAnalysis(true);
      }
      const savedReport = localStorage.getItem('trade_audit_report');
      if (savedReport) {
        const parsed = JSON.parse(savedReport) as AnalysisResult;
        setResult(parsed);
        if (used) {
          setPageState('results');
        }
      }
      const savedEmail = localStorage.getItem('trade_audit_email');
      if (savedEmail) {
        setEmail(savedEmail);
        setEmailSubmitted(true);
      }
    } catch {}

    async function checkStatus() {
      try {
        const res = await fetch('/api/trade-check/status');
        const data = await res.json();
        if (data.blocked) {
          setPageState('email_blocked'); // triggers the "already used" screen
        }
      } catch (e) {
        // silently ignore network errors for the initial check
      }
    }
    checkStatus();
  }, []);

  // Handle firm selection → auto-fill defaults
  const handleFirmChange = useCallback((firm: string) => {
    setFirmName(firm);
    const defaults = FIRM_DEFAULTS[firm];
    if (defaults) {
      setMaxDailyLoss(defaults.dailyLoss.toString());
      setMaxDrawdown(defaults.drawdown.toString());
      setProfitTarget(defaults.profitTarget.toString());
    }
  }, []);

  // Validate CSV on upload
  const handleCSVUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['text/csv', 'application/vnd.ms-excel', 'text/plain'];
    const isCSV = validTypes.includes(file.type) || file.name.endsWith('.csv') || file.name.endsWith('.txt');

    if (!isCSV) {
      setErrorMessage('Please upload a CSV file (.csv) exported from MT4, MT5, or cTrader.');
      return;
    }

    // Quick validation: read first few lines
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
    reader.readAsText(file.slice(0, 5000)); // Read just first 5KB for validation
  }, []);

  // Submit form
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Client-side validation
    const resolvedFirm = firmName === 'Other' ? (customFirm || 'Other') : firmName;
    if (!resolvedFirm || !phase || !accountSize || !maxDailyLoss || !maxDrawdown) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }
    if (!csvFile) {
      setErrorMessage('Please upload your trade history CSV file.');
      return;
    }

    setPageState('loading');

    try {
      const formData = new FormData();
      formData.append('email', ''); // email is collected post-analysis
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
        if (data.error === 'ip_used') {
          setPageState('email_blocked'); // We reuse this state for the blocked UI
          return;
        }
        setErrorMessage(data.message || data.error || 'Analysis failed. Please try again.');
        setPageState('form');
        return;
      }

      const analysisResult = { analysis: data.analysis, stats: data.stats };
      setResult(analysisResult);
      setPageState('results');

      // Lockout local storage
      try {
        localStorage.setItem('trade_audit_used', 'true');
        localStorage.setItem('trade_audit_report', JSON.stringify(analysisResult));
      } catch {}
      setHasUsedAnalysis(true);

      // Show pricing popup after 1.5s
      setTimeout(() => {
        setShowFreeTrialPopup(true);
      }, 1500);

      // Scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);

    } catch (err: any) {
      console.error('Submit error:', err);
      setErrorMessage('Network error. Please check your connection and try again.');
      setPageState('form');
    }
  }, [firmName, customFirm, phase, accountSize, maxDailyLoss, maxDrawdown, profitTarget, csvFile, questionnaire]);

  // Book audit
  const handleBookAudit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingEmail || !bookingContact) return;

    setBookingLoading(true);
    try {
      const response = await fetch('/api/trade-check/book-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: bookingEmail,
          contactMethod: bookingContact,
          note: bookingNote,
        }),
      });

      if (response.ok) {
        setBookingSubmitted(true);
      }
    } catch {
      // Silently handle
    } finally {
      setBookingLoading(false);
    }
  }, [bookingEmail, bookingContact, bookingNote]);

  // PDF download
  const handleDownloadPDF = useCallback(() => {
    if (!result) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Trade Health Check Report — Paisanomics</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', system-ui, sans-serif; color: #111827; padding: 40px; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 2px solid #059669; }
          .header h1 { font-size: 24px; color: #059669; margin-bottom: 4px; }
          .header p { font-size: 12px; color: #6B7280; }
          h2 { color: #059669; font-size: 18px; margin: 24px 0 12px; }
          h3 { font-size: 14px; color: #111827; margin: 16px 0 8px; }
          p { margin-bottom: 10px; font-size: 13px; }
          .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 16px 0; }
          .stat-item { padding: 8px 12px; background: #F8FAF9; border: 1px solid #E5E7EB; border-radius: 6px; }
          .stat-label { font-size: 11px; color: #6B7280; }
          .stat-value { font-size: 14px; font-weight: 600; color: #111827; }
          .analysis-section { margin: 16px 0; padding: 16px; background: #ECFDF5; border-radius: 8px; border-left: 3px solid #059669; }
          .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #6B7280; border-top: 1px solid #E5E7EB; padding-top: 16px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📊 Trade Health Check Report</h1>
          <p>Generated by Paisanomics — ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <h2>📈 Performance Statistics</h2>
        <div class="stats-grid">
          <div class="stat-item"><div class="stat-label">Total Trades</div><div class="stat-value">${result.stats.totalTrades}</div></div>
          <div class="stat-item"><div class="stat-label">Win Rate</div><div class="stat-value">${result.stats.winRate?.toFixed(1)}%</div></div>
          <div class="stat-item"><div class="stat-label">Avg Win</div><div class="stat-value">$${result.stats.averageWin?.toFixed(2)}</div></div>
          <div class="stat-item"><div class="stat-label">Avg Loss</div><div class="stat-value">$${result.stats.averageLoss?.toFixed(2)}</div></div>
          <div class="stat-item"><div class="stat-label">Avg R:R</div><div class="stat-value">${result.stats.averageRR?.toFixed(2)}</div></div>
          <div class="stat-item"><div class="stat-label">Profit Factor</div><div class="stat-value">${result.stats.profitFactor === Infinity ? '∞' : result.stats.profitFactor?.toFixed(2)}</div></div>
          <div class="stat-item"><div class="stat-label">Total P&L</div><div class="stat-value">$${result.stats.totalPnl?.toFixed(2)}</div></div>
          <div class="stat-item"><div class="stat-label">Trading Days</div><div class="stat-value">${result.stats.tradingDays}</div></div>
          <div class="stat-item"><div class="stat-label">Max Day Loss</div><div class="stat-value">$${result.stats.maxSingleDayLoss?.toFixed(2)}</div></div>
          <div class="stat-item"><div class="stat-label">Days Near Limit</div><div class="stat-value">${result.stats.daysWithin10PercentOfDailyLimit}</div></div>
          <div class="stat-item"><div class="stat-label">Largest Win</div><div class="stat-value">$${result.stats.largestWin?.toFixed(2)}</div></div>
          <div class="stat-item"><div class="stat-label">Largest Loss</div><div class="stat-value">$${result.stats.largestLoss?.toFixed(2)}</div></div>
        </div>

        <h2>🧠 AI Analysis</h2>
        <div class="analysis-section">
          ${result.analysis.split('\n').map(line => `<p>${line}</p>`).join('')}
        </div>

        <div class="footer">
          <p>This report is generated automatically by Paisanomics Trade Health Check.</p>
          <p>For a comprehensive human-reviewed audit, visit paisanomics.com/trade-check</p>
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

  // Send email and download PDF post-analysis
  const handleEmailSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !result) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setSendingEmail(true);
    try {
      const response = await fetch('/api/trade-check/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          analysis: result.analysis,
          stats: result.stats,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      try {
        localStorage.setItem('trade_audit_email', email);
      } catch {}
      setEmailSubmitted(true);
      setBookingEmail(email);

      // Trigger download
      handleDownloadPDF();
    } catch (err) {
      console.error(err);
      // Fallback: still let them download if email API fails
      setEmailSubmitted(true);
      handleDownloadPDF();
    } finally {
      setSendingEmail(false);
    }
  }, [email, result, handleDownloadPDF]);

  // ─── Render ──────────────────────────────────────────────────────
  return (
    <main className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[#6B7280] hover:text-[#059669] transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        {/* Header */}
        <FadeIn>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(5,150,105,0.08)] border border-[rgba(5,150,105,0.2)] mb-6">
              <Shield className="w-4 h-4 text-[#059669]" />
              <span className="text-sm text-[#059669]">Free Trade Analysis Tool</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-[#111827]">Trade</span>{' '}
              <span className="text-gold-gradient">Health Check</span>
            </h1>
            <p className="text-lg text-[#4B5563] max-w-2xl mx-auto">
              Upload your trade history and get an AI-powered risk analysis with actionable insights — tailored to your prop firm rules.
            </p>
          </div>
        </FadeIn>

        {/* ═══ LOADING STATE ═══ */}
        <AnimatePresence mode="wait">
          {pageState === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-24"
            >
              <div className="glass-card p-12 rounded-2xl text-center max-w-md mx-auto">
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#059669] to-[#10B981] flex items-center justify-center mx-auto animate-gold-pulse">
                    <BarChart3 className="w-10 h-10 text-white animate-pulse" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-[#111827] mb-2">Crunching your trade history...</h2>
                <p className="text-[#4B5563] mb-4">Our AI is analyzing your performance data, cross-referencing your behavior patterns, and checking your risk limits.</p>
                <div className="flex items-center justify-center gap-2 text-sm text-[#6B7280]">
                  <Loader className="w-4 h-4 animate-spin" />
                  This may take 15–30 seconds
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══ EMAIL BLOCKED STATE ═══ */}
          {pageState === 'email_blocked' && (
            <motion.div
              key="blocked"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-16"
            >
              <div className="glass-card p-12 rounded-2xl text-center max-w-lg mx-auto">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-6">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-[#111827] mb-3">Upgrade to Pro Audit</h2>
                <p className="text-[#4B5563] mb-6">
                  To get more of this in-depth analysis, upgrade to our <strong>Pro Audit tier ($99)</strong>. You'll receive a comprehensive, human-reviewed analysis including actual chart review, entry timing judgment, setup consistency checks, and personalized 1-on-1 follow-up to fix your leaks.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a
                    href="https://t.me/paisanomics"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#059669] to-[#10B981] text-white font-semibold hover:shadow-[0_0_28px_rgba(5,150,105,0.35)] transition-all hover:scale-105"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Chat on Telegram
                  </a>
                  <button
                    onClick={() => {
                      setPageState('form');
                      setErrorMessage('');
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[rgba(5,150,105,0.08)] text-[#059669] font-semibold border border-[rgba(5,150,105,0.2)] hover:bg-[rgba(5,150,105,0.15)] transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Go Back
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══ FORM ═══ */}
          {pageState === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {hasUsedAnalysis ? (
                <div className="max-w-lg mx-auto mb-12">
                  <div className="glass-card p-8 rounded-2xl text-center">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-4">
                      <Lock className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-[#111827] mb-2">Free analysis already used</h3>
                    <p className="text-sm text-[#4B5563] mb-6">
                      You&apos;ve already run your one free Trade Audit. For additional reports or ongoing guidance, check out our paid plans.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Link href="/pricing">
                        <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#059669] to-[#10B981] text-white font-medium hover:shadow-[0_0_20px_rgba(5,150,105,0.3)] transition-all text-sm cursor-pointer">
                          View Pricing
                        </button>
                      </Link>
                      {result && (
                        <button
                          onClick={() => setPageState('results')}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-[rgba(5,150,105,0.2)] bg-[rgba(5,150,105,0.04)] text-[#059669] font-medium hover:bg-[rgba(5,150,105,0.08)] transition-all text-sm cursor-pointer"
                        >
                          View My Report
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                {/* Error banner */}
                <AnimatePresence>
                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700"
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

                {/* ─── Section 1: Account Context ─── */}
                <FadeIn delay={0.1}>
                  <div className="glass-card rounded-2xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#059669] to-[#10B981] flex items-center justify-center">
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-[#111827]">Account Context</h2>
                        <p className="text-sm text-[#6B7280]">Tell us about your trading account</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Prop Firm */}
                      <div>
                        <label htmlFor="firmName" className="block text-sm font-medium text-[#111827] mb-2">Prop Firm *</label>
                        <div className="relative">
                          <select
                            id="firmName"
                            value={firmName}
                            onChange={(e) => handleFirmChange(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white border border-[rgba(5,150,105,0.2)] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent appearance-none cursor-pointer"
                            required
                          >
                            <option value="">Select firm...</option>
                            {FIRMS.map(f => <option key={f} value={f}>{f}</option>)}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
                        </div>
                        {firmName === 'Other' && (
                          <input
                            type="text"
                            value={customFirm}
                            onChange={(e) => setCustomFirm(e.target.value)}
                            placeholder="Enter firm name..."
                            className="mt-2 w-full px-4 py-3 rounded-xl bg-white border border-[rgba(5,150,105,0.2)] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#059669] placeholder:text-[#9CA3AF]"
                          />
                        )}
                      </div>

                      {/* Phase */}
                      <div>
                        <label htmlFor="phase" className="block text-sm font-medium text-[#111827] mb-2">Account Phase *</label>
                        <div className="relative">
                          <select
                            id="phase"
                            value={phase}
                            onChange={(e) => setPhase(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white border border-[rgba(5,150,105,0.2)] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent appearance-none cursor-pointer"
                            required
                          >
                            <option value="">Select phase...</option>
                            {PHASES.map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
                        </div>
                      </div>

                      {/* Account Size */}
                      <div>
                        <label htmlFor="accountSize" className="block text-sm font-medium text-[#111827] mb-2">Account Size ($) *</label>
                        <input
                          id="accountSize"
                          type="number"
                          value={accountSize}
                          onChange={(e) => setAccountSize(e.target.value)}
                          placeholder="e.g. 100000"
                          className="w-full px-4 py-3 rounded-xl bg-white border border-[rgba(5,150,105,0.2)] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#059669] placeholder:text-[#9CA3AF]"
                          required
                          min="1"
                        />
                      </div>

                      {/* Max Daily Loss */}
                      <div>
                        <label htmlFor="maxDailyLoss" className="block text-sm font-medium text-[#111827] mb-2">Max Daily Loss (%) *</label>
                        <input
                          id="maxDailyLoss"
                          type="number"
                          step="0.1"
                          value={maxDailyLoss}
                          onChange={(e) => setMaxDailyLoss(e.target.value)}
                          placeholder="e.g. 5"
                          className="w-full px-4 py-3 rounded-xl bg-white border border-[rgba(5,150,105,0.2)] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#059669] placeholder:text-[#9CA3AF]"
                          required
                          min="0.1"
                        />
                      </div>

                      {/* Max Drawdown */}
                      <div>
                        <label htmlFor="maxDrawdown" className="block text-sm font-medium text-[#111827] mb-2">Max Total Drawdown (%) *</label>
                        <input
                          id="maxDrawdown"
                          type="number"
                          step="0.1"
                          value={maxDrawdown}
                          onChange={(e) => setMaxDrawdown(e.target.value)}
                          placeholder="e.g. 10"
                          className="w-full px-4 py-3 rounded-xl bg-white border border-[rgba(5,150,105,0.2)] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#059669] placeholder:text-[#9CA3AF]"
                          required
                          min="0.1"
                        />
                      </div>

                      {/* Profit Target */}
                      <div>
                        <label htmlFor="profitTarget" className="block text-sm font-medium text-[#111827] mb-2">Profit Target (%)</label>
                        <input
                          id="profitTarget"
                          type="number"
                          step="0.1"
                          value={profitTarget}
                          onChange={(e) => setProfitTarget(e.target.value)}
                          placeholder="e.g. 10"
                          className="w-full px-4 py-3 rounded-xl bg-white border border-[rgba(5,150,105,0.2)] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#059669] placeholder:text-[#9CA3AF]"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                </FadeIn>

                {/* ─── Section 2: Trade History Upload ─── */}
                <FadeIn delay={0.2}>
                  <div className="glass-card rounded-2xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#059669] to-[#10B981] flex items-center justify-center">
                        <Upload className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-[#111827]">Trade History</h2>
                        <p className="text-sm text-[#6B7280]">Upload your CSV export from MT4, MT5, or cTrader</p>
                      </div>
                    </div>

                    {/* CSV Upload */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all hover:border-[#059669] hover:bg-[rgba(5,150,105,0.04)] ${
                        csvFile ? 'border-[#059669] bg-[rgba(5,150,105,0.04)]' : 'border-[rgba(5,150,105,0.2)]'
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
                          <CheckCircle className="w-8 h-8 text-[#059669]" />
                          <div className="text-left">
                            <p className="font-medium text-[#111827]">{csvFile.name}</p>
                            <p className="text-sm text-[#6B7280]">{(csvFile.size / 1024).toFixed(1)} KB — Click to replace</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <FileText className="w-12 h-12 text-[#059669] mx-auto mb-3 opacity-60" />
                          <p className="font-medium text-[#111827] mb-1">Drop your trade CSV here or click to browse</p>
                          <p className="text-sm text-[#6B7280]">Supports MT4, MT5, and cTrader exports (.csv)</p>
                        </>
                      )}
                    </div>

                    {/* Optional Screenshot */}
                    <div className="mt-4">
                      <label className="block text-sm text-[#6B7280] mb-2">Optional: Upload a dashboard screenshot (for future review)</label>
                      <div
                        onClick={() => screenshotInputRef.current?.click()}
                        className={`border border-dashed rounded-xl p-4 text-center cursor-pointer transition-all hover:border-[#059669] text-sm ${
                          screenshotFile ? 'border-[#059669]' : 'border-[rgba(5,150,105,0.15)]'
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
                          <span className="text-[#059669]">✓ {screenshotFile.name}</span>
                        ) : (
                          <span className="text-[#9CA3AF]">Click to upload screenshot (optional)</span>
                        )}
                      </div>
                    </div>
                  </div>
                </FadeIn>

                {/* ─── Section 3: Behavioral Questionnaire ─── */}
                <FadeIn delay={0.3}>
                  <div className="glass-card rounded-2xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#059669] to-[#10B981] flex items-center justify-center">
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-[#111827]">Behavioral Assessment</h2>
                        <p className="text-sm text-[#6B7280]">Help us cross-reference your habits against your data</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {QUESTIONNAIRE_ITEMS.map((item) => (
                        <div key={item.key}>
                          <label className="block text-sm font-medium text-[#111827] mb-3">{item.label}</label>
                          {item.type === 'number' ? (
                            <input
                              type="number"
                              value={questionnaire[item.key] || ''}
                              onChange={(e) => setQuestionnaire(prev => ({ ...prev, [item.key]: e.target.value }))}
                              placeholder="e.g. 8"
                              className="w-full max-w-[200px] px-4 py-3 rounded-xl bg-white border border-[rgba(5,150,105,0.2)] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#059669] placeholder:text-[#9CA3AF]"
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
                                      ? 'bg-gradient-to-r from-[#059669] to-[#10B981] text-white shadow-md'
                                      : 'bg-white border border-[rgba(5,150,105,0.2)] text-[#4B5563] hover:border-[#059669] hover:text-[#059669]'
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
                </FadeIn>

                {/* ─── Submit Button ─── */}
                <FadeIn delay={0.4}>
                  <div className="flex justify-center pt-4">
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-xl bg-gradient-to-r from-[#059669] to-[#10B981] text-white font-semibold hover:shadow-[0_0_28px_rgba(5,150,105,0.35)] transition-all hover:scale-105 min-w-[240px] text-base cursor-pointer shadow-md"
                    >
                      <Zap className="w-5 h-5" />
                      Analyze My Trades
                    </button>
                  </div>
                </FadeIn>
                </form>
              )}
            </motion.div>
          )}

          {/* ═══ RESULTS ═══ */}
          {pageState === 'results' && result && (
            <motion.div
              key="results"
              ref={resultsRef}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              {/* Success banner */}
              {!emailSubmitted ? (
                <div className="glass-card rounded-2xl p-6 flex flex-col md:flex-row items-center gap-4 border-l-4 border-[#059669]">
                  <CheckCircle className="w-8 h-8 text-[#059669] flex-shrink-0" />
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-lg font-bold text-[#111827]">Analysis Complete</h2>
                    <p className="text-sm text-[#4B5563]">Your report is generated. Enter your email to download the PDF and save your results.</p>
                  </div>
                  
                  <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-3 items-center w-full md:w-auto md:max-w-md">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full md:w-64 px-4 py-2.5 rounded-xl bg-white border border-[rgba(5,150,105,0.2)] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#059669] placeholder:text-[#9CA3AF] text-sm"
                      required
                    />
                    <button
                      type="submit"
                      disabled={sendingEmail}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#059669] to-[#10B981] text-white font-semibold hover:shadow-[0_0_20px_rgba(5,150,105,0.3)] transition-all hover:scale-105 text-sm whitespace-nowrap cursor-pointer disabled:opacity-50"
                    >
                      {sendingEmail ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      Send & Download PDF
                    </button>
                  </form>
                </div>
              ) : (
                <div className="glass-card rounded-2xl p-6 flex items-center gap-4 border-l-4 border-[#059669]">
                  <CheckCircle className="w-8 h-8 text-[#059669] flex-shrink-0" />
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-[#111827]">Analysis Complete</h2>
                    <p className="text-sm text-[#4B5563]">Your report has been sent to {email}. You can download the PDF below.</p>
                  </div>
                  <button
                    onClick={handleDownloadPDF}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#059669] to-[#10B981] text-white font-medium hover:shadow-[0_0_20px_rgba(5,150,105,0.3)] transition-all hover:scale-105 text-sm cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
                  </button>
                </div>
              )}

              {/* Stats Grid */}
              <FadeIn delay={0.1}>
                <div className="glass-card rounded-2xl p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#059669] to-[#10B981] flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-[#111827]">Performance Statistics</h2>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard label="Total Trades" value={result.stats.totalTrades} />
                    <StatCard label="Win Rate" value={`${result.stats.winRate?.toFixed(1)}%`} highlight={result.stats.winRate >= 50} />
                    <StatCard label="Avg Win" value={`$${result.stats.averageWin?.toFixed(2)}`} highlight />
                    <StatCard label="Avg Loss" value={`$${result.stats.averageLoss?.toFixed(2)}`} danger />
                    <StatCard label="Avg R:R" value={result.stats.averageRR?.toFixed(2)} highlight={result.stats.averageRR >= 1} />
                    <StatCard label="Profit Factor" value={result.stats.profitFactor === Infinity ? '∞' : result.stats.profitFactor?.toFixed(2)} highlight={result.stats.profitFactor >= 1} />
                    <StatCard label="Total P&L" value={`$${result.stats.totalPnl?.toFixed(2)}`} highlight={result.stats.totalPnl > 0} danger={result.stats.totalPnl < 0} />
                    <StatCard label="Trading Days" value={result.stats.tradingDays} />
                    <StatCard label="Max Day Loss" value={`$${result.stats.maxSingleDayLoss?.toFixed(2)}`} danger />
                    <StatCard label="Days Near Limit" value={result.stats.daysWithin10PercentOfDailyLimit} danger={result.stats.daysWithin10PercentOfDailyLimit > 0} />
                    <StatCard label="Largest Win" value={`$${result.stats.largestWin?.toFixed(2)}`} highlight />
                    <StatCard label="Largest Loss" value={`$${result.stats.largestLoss?.toFixed(2)}`} danger />
                    <StatCard label="Avg Lot (Wins)" value={result.stats.avgLotSizeWins?.toFixed(2)} />
                    <StatCard label="Avg Lot (Losses)" value={result.stats.avgLotSizeLosses?.toFixed(2)} />
                    <StatCard label="Win Streak" value={result.stats.longestWinStreak} highlight />
                    <StatCard label="Lose Streak" value={result.stats.longestLoseStreak} danger={result.stats.longestLoseStreak >= 5} />
                  </div>

                  {result.stats.instrumentsTraded?.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-[rgba(5,150,105,0.1)]">
                      <p className="text-sm text-[#6B7280]">
                        <span className="font-medium text-[#111827]">Instruments traded:</span>{' '}
                        {result.stats.instrumentsTraded.join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              </FadeIn>

              {/* AI Analysis */}
              <FadeIn delay={0.2}>
                <div className="glass-card rounded-2xl p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#059669] to-[#10B981] flex items-center justify-center">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-[#111827]">AI Risk Analysis</h2>
                  </div>

                  <div className="prose prose-sm max-w-none">
                    {typeof result.analysis === 'string' ? (
                      result.analysis.split('\n').map((line: string, i: number) => {
                        if (!line.trim()) return <div key={i} className="h-3" />;
                        if (line.match(/^\d+\.\s/) || line.match(/^#+\s/) || line.match(/^\*\*\d+\./)) {
                          const cleanLine = line.replace(/^#+\s/, '').replace(/^\*\*/,'').replace(/\*\*$/,'');
                          return (
                            <h3 key={i} className="text-base font-bold text-[#059669] mt-6 mb-2 flex items-center gap-2">
                              {cleanLine}
                            </h3>
                          );
                        }
                        return (
                          <p key={i} className="text-[#4B5563] leading-relaxed mb-2">
                            {line.replace(/^\*\*/, '').replace(/\*\*$/, '')}
                          </p>
                        );
                      })
                    ) : (
                      <div className="space-y-6">
                        {/* Overall Verdict */}
                        {result.analysis.overallVerdict && (
                          <div className="p-4 rounded-xl bg-[rgba(5,150,105,0.06)] border border-[rgba(5,150,105,0.15)]">
                            <p className="text-[#374151] leading-relaxed font-medium">{result.analysis.overallVerdict}</p>
                          </div>
                        )}

                        {/* Sections */}
                        {Array.isArray(result.analysis.sections) && result.analysis.sections.map((section: { id?: string; title?: string; severity?: string; score?: number; summary?: string; detail?: string }, idx: number) => {
                          const severityColor = section.severity === 'good' ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
                            : section.severity === 'warning' ? 'text-amber-600 bg-amber-50 border-amber-200'
                            : section.severity === 'critical' ? 'text-red-600 bg-red-50 border-red-200'
                            : 'text-blue-600 bg-blue-50 border-blue-200';
                          const severityLabel = section.severity === 'good' ? '✓ Good'
                            : section.severity === 'warning' ? '⚠ Warning'
                            : section.severity === 'critical' ? '✕ Critical'
                            : section.severity || 'Info';
                          return (
                            <div key={section.id || idx} className="border border-gray-100 rounded-xl p-5">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-base font-bold text-[#111827]">{section.title}</h3>
                                <div className="flex items-center gap-2">
                                  {section.score != null && (
                                    <span className="text-sm font-bold text-[#059669]">{section.score}/100</span>
                                  )}
                                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${severityColor}`}>
                                    {severityLabel}
                                  </span>
                                </div>
                              </div>
                              {section.summary && (
                                <p className="text-sm font-medium text-[#374151] mb-1">{section.summary}</p>
                              )}
                              {section.detail && (
                                <p className="text-sm text-[#6B7280] leading-relaxed">{section.detail}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </FadeIn>

              {/* ═══ PRO AUDIT CTA ═══ */}
              <FadeIn delay={0.3}>
                <div className="relative rounded-2xl overflow-hidden">
                  {/* Background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#047857] via-[#059669] to-[#10B981] opacity-[0.07]" />
                  <div className="glass-card rounded-2xl p-10 relative">
                    <div className="text-center max-w-2xl mx-auto">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#059669] to-[#10B981] flex items-center justify-center mx-auto mb-5">
                        <TrendingUp className="w-7 h-7 text-white" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-[#111827] mb-3">
                        Want a human to look at this?
                      </h2>
                      <p className="text-[#4B5563] mb-8 leading-relaxed">
                        The automated report catches patterns in your numbers — but a Pro Audit goes deeper: 
                        actual chart review, entry timing judgment, whether your setups match your stated strategy, 
                        and ongoing follow-up. Things an AI structurally can&apos;t do.
                      </p>

                      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                        <a
                          href="https://t.me/paisanomics"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#059669] to-[#10B981] text-white font-semibold hover:shadow-[0_0_28px_rgba(5,150,105,0.35)] transition-all hover:scale-105"
                        >
                          <MessageCircle className="w-5 h-5" />
                          Chat with us on Telegram
                        </a>
                      </div>

                      {/* Booking Form */}
                      <div className="border-t border-[rgba(5,150,105,0.15)] pt-8">
                        <h3 className="text-lg font-bold text-[#111827] mb-4">Book a Pro Audit</h3>
                        {bookingSubmitted ? (
                          <div className="flex items-center justify-center gap-2 p-4 rounded-xl bg-[rgba(5,150,105,0.08)] text-[#059669]">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-medium">Request received! We&apos;ll be in touch within 24 hours.</span>
                          </div>
                        ) : (
                          <form onSubmit={handleBookAudit} className="max-w-md mx-auto space-y-3">
                            <input
                              type="email"
                              value={bookingEmail}
                              onChange={(e) => setBookingEmail(e.target.value)}
                              placeholder="Your email"
                              className="w-full px-4 py-3 rounded-xl bg-white border border-[rgba(5,150,105,0.2)] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#059669] placeholder:text-[#9CA3AF]"
                              required
                            />
                            <div className="relative">
                              <select
                                value={bookingContact}
                                onChange={(e) => setBookingContact(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-white border border-[rgba(5,150,105,0.2)] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#059669] appearance-none cursor-pointer"
                                required
                              >
                                <option value="">Preferred contact method...</option>
                                <option value="telegram">Telegram</option>
                                <option value="email">Email</option>
                                <option value="whatsapp">WhatsApp</option>
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
                            </div>
                            <textarea
                              value={bookingNote}
                              onChange={(e) => setBookingNote(e.target.value)}
                              placeholder="Brief note (optional) — e.g. what you'd like reviewed"
                              rows={3}
                              className="w-full px-4 py-3 rounded-xl bg-white border border-[rgba(5,150,105,0.2)] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#059669] placeholder:text-[#9CA3AF] resize-none"
                            />
                            <button
                              type="submit"
                              disabled={bookingLoading}
                              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[rgba(5,150,105,0.08)] text-[#059669] font-semibold border border-[rgba(5,150,105,0.2)] hover:bg-[rgba(5,150,105,0.15)] transition-all disabled:opacity-50"
                            >
                              {bookingLoading ? (
                                <Loader className="w-4 h-4 animate-spin" />
                              ) : (
                                <Send className="w-4 h-4" />
                              )}
                              Submit Request
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </motion.div>
          )}

          {/* ═══ ERROR STATE ═══ */}
          {pageState === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-16"
            >
              <div className="glass-card p-12 rounded-2xl text-center max-w-md mx-auto">
                <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-[#111827] mb-2">Something went wrong</h2>
                <p className="text-[#4B5563] mb-6">{errorMessage || 'An unexpected error occurred.'}</p>
                <button
                  onClick={() => { setPageState('form'); setErrorMessage(''); }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#059669] to-[#10B981] text-white font-semibold hover:shadow-[0_0_28px_rgba(5,150,105,0.35)] transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Try Again
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Free Trial Popup */}
        <AnimatePresence>
          {showFreeTrialPopup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowFreeTrialPopup(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="relative w-full max-w-md rounded-2xl glass-card p-8 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setShowFreeTrialPopup(false)}
                  className="absolute top-4 right-4 text-[#6B7280] hover:text-[#059669] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-[rgba(5,150,105,0.08)] border border-[rgba(5,150,105,0.15)] flex items-center justify-center mx-auto mb-5">
                    <CheckCircle className="w-8 h-8 text-[#059669]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#111827] mb-2">Report generated!</h3>
                  <p className="text-sm text-[#4B5563] mb-1">
                    That was your <span className="font-bold text-[#111827]">one free analysis</span>.
                  </p>
                  <p className="text-sm text-[#4B5563] mb-6">
                    For additional reports or ongoing guidance, subscribe to a paid plan.
                  </p>
                  <div className="flex flex-col gap-3">
                    <Link href="/pricing">
                      <button className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#059669] to-[#10B981] text-white font-semibold hover:shadow-[0_0_20px_rgba(5,150,105,0.3)] transition-all hover:scale-105 cursor-pointer">
                        View Pricing Plans
                      </button>
                    </Link>
                    <button
                      onClick={() => setShowFreeTrialPopup(false)}
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-[rgba(5,150,105,0.2)] bg-[rgba(5,150,105,0.04)] text-[#059669] font-medium hover:bg-[rgba(5,150,105,0.08)] transition-all text-sm cursor-pointer"
                    >
                      Continue Viewing Report
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

// ─── Stat Card component ─────────────────────────────────────────────
function StatCard({ label, value, highlight, danger }: {
  label: string;
  value: string | number;
  highlight?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="p-4 rounded-xl bg-white/80 border border-[rgba(5,150,105,0.1)] hover:border-[rgba(5,150,105,0.25)] transition-all">
      <p className="text-xs text-[#6B7280] mb-1">{label}</p>
      <p className={`text-lg font-bold ${
        danger ? 'text-red-600' : highlight ? 'text-[#059669]' : 'text-[#111827]'
      }`}>
        {value}
      </p>
    </div>
  );
}
