import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function renderAnalysis(analysis: string) {
  const lines = analysis.split('\n');
  return lines.map(line => {
    if (!line.trim()) return '<div style="height:12px"></div>';
    if (line.match(/^\d+\.\s/) || line.match(/^#+\s/) || line.match(/^\*\*\d+\./)) {
      const clean = line.replace(/^#+\s+/, '').replace(/^\*\*/, '').replace(/\*\*$/, '');
      return `<h3 style="color:#059669;font-size:15px;font-weight:700;margin:20px 0 8px">${clean}</h3>`;
    }
    const text = line.replace(/^\*\*/, '').replace(/\*\*$/, '');
    return `<p style="color:#4B5563;font-size:13px;line-height:1.6;margin:0 0 8px">${text}</p>`;
  }).join('');
}

interface StatEntry {
  label: string;
  value: string | number;
  highlight?: boolean;
  danger?: boolean;
}

function statCard(s: StatEntry) {
  const color = s.danger ? '#DC2626' : s.highlight ? '#059669' : '#111827';
  return `
    <td style="width:50%;padding:4px">
      <table style="width:100%;border-collapse:collapse">
        <tr>
          <td style="padding:12px;border:1px solid rgba(5,150,105,0.15);border-radius:10px;background:rgba(255,255,255,0.8)">
            <div style="font-size:11px;color:#6B7280;margin-bottom:4px">${s.label}</div>
            <div style="font-size:15px;font-weight:700;color:${color}">${s.value}</div>
          </td>
        </tr>
      </table>
    </td>
  `;
}

export async function sendAnalysisEmail(to: string, analysis: string, stats: Record<string, any>) {
  const cards: StatEntry[] = [
    { label: 'Total Trades', value: stats.totalTrades },
    { label: 'Win Rate', value: `${(stats.winRate ?? 0).toFixed(1)}%`, highlight: stats.winRate >= 50 },
    { label: 'Avg Win', value: `$${(stats.averageWin ?? 0).toFixed(2)}`, highlight: true },
    { label: 'Avg Loss', value: `$${(stats.averageLoss ?? 0).toFixed(2)}`, danger: true },
    { label: 'Avg R:R', value: (stats.averageRR ?? 0).toFixed(2), highlight: stats.averageRR >= 1 },
    { label: 'Profit Factor', value: stats.profitFactor === Infinity ? '∞' : (stats.profitFactor ?? 0).toFixed(2), highlight: stats.profitFactor >= 1 },
    { label: 'Total P&L', value: `$${(stats.totalPnl ?? 0).toFixed(2)}`, highlight: stats.totalPnl > 0, danger: stats.totalPnl < 0 },
    { label: 'Trading Days', value: stats.tradingDays },
    { label: 'Max Day Loss', value: `$${(stats.maxSingleDayLoss ?? 0).toFixed(2)}`, danger: true },
    { label: 'Days Near Limit', value: stats.daysWithin10PercentOfDailyLimit, danger: stats.daysWithin10PercentOfDailyLimit > 0 },
    { label: 'Largest Win', value: `$${(stats.largestWin ?? 0).toFixed(2)}`, highlight: true },
    { label: 'Largest Loss', value: `$${(stats.largestLoss ?? 0).toFixed(2)}`, danger: true },
    { label: 'Avg Lot (Wins)', value: (stats.avgLotSizeWins ?? 0).toFixed(2) },
    { label: 'Avg Lot (Losses)', value: (stats.avgLotSizeLosses ?? 0).toFixed(2) },
    { label: 'Win Streak', value: stats.longestWinStreak, highlight: true },
    { label: 'Lose Streak', value: stats.longestLoseStreak, danger: stats.longestLoseStreak >= 5 },
  ];

  let statsGrid = '';
  for (let i = 0; i < cards.length; i += 2) {
    statsGrid += '<tr>';
    statsGrid += statCard(cards[i]);
    statsGrid += i + 1 < cards.length ? statCard(cards[i + 1]) : '<td></td>';
    statsGrid += '</tr>';
  }

  const instrumentsHtml = stats.instrumentsTraded?.length
    ? `<p style="font-size:12px;color:#6B7280;margin:16px 0 0;padding:12px 0 0;border-top:1px solid rgba(5,150,105,0.12)"><strong style="color:#111827">Instruments traded:</strong> ${stats.instrumentsTraded.join(', ')}</p>`
    : '';

  const html = `
    <div style="font-family:'Segoe UI',system-ui,sans-serif;max-width:600px;margin:0 auto;padding:0">
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
        <tr>
          <td style="padding:16px 20px;border:1px solid rgba(5,150,105,0.15);border-radius:12px;border-left:4px solid #059669;background:rgba(255,255,255,0.95)">
            <table style="width:100%">
              <tr>
                <td>
                  <div style="font-size:16px;font-weight:700;color:#111827">Analysis Complete</div>
                  <div style="font-size:12px;color:#4B5563;margin-top:2px">Your Trade Audit report is ready.</div>
                </td>
                <td style="text-align:right;width:1px">
                  <span style="display:inline-block;padding:8px 16px;border-radius:10px;background:linear-gradient(135deg,#059669,#10B981);color:#fff;font-size:12px;font-weight:600">&#9733; Report</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;border:1px solid rgba(5,150,105,0.1);border-radius:12px;background:rgba(255,255,255,0.95)">
        <tr>
          <td style="padding:20px">
            <table style="width:100%;border-collapse:collapse">
              <tr>
                <td>
                  <div style="display:inline-block;width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#059669,#10B981);vertical-align:middle;text-align:center;line-height:36px;color:#fff;font-size:16px;font-weight:700;margin-right:10px">&#9881;</div>
                  <span style="font-size:17px;font-weight:700;color:#111827;vertical-align:middle">Performance Statistics</span>
                </td>
              </tr>
            </table>
            <table style="width:100%;border-collapse:collapse;margin-top:16px">
              ${statsGrid}
            </table>
            ${instrumentsHtml}
          </td>
        </tr>
      </table>

      <table style="width:100%;border-collapse:collapse;border:1px solid rgba(5,150,105,0.1);border-radius:12px;background:rgba(255,255,255,0.95)">
        <tr>
          <td style="padding:20px">
            <table style="width:100%;border-collapse:collapse">
              <tr>
                <td>
                  <div style="display:inline-block;width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#059669,#10B981);vertical-align:middle;text-align:center;line-height:36px;color:#fff;font-size:16px;font-weight:700;margin-right:10px">&#9879;</div>
                  <span style="font-size:17px;font-weight:700;color:#111827;vertical-align:middle">AI Risk Analysis</span>
                </td>
              </tr>
            </table>
            <div style="margin-top:12px">
              ${renderAnalysis(analysis)}
            </div>
          </td>
        </tr>
      </table>

      <p style="color:#6B7280;font-size:11px;margin-top:24px;text-align:center">Generated by Trade Audit</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Trade Audit" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Your Trade Audit Report',
    html,
  });
}
