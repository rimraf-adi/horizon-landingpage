/**
 * Rate Limiter — One-time per IP address (forever) tracking.
 * Uses filesystem JSON for IP persistence.
 */

import fs from 'fs';
import path from 'path';

// Vercel serverless functions have a read-only filesystem except for /tmp
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;
const DATA_DIR = isVercel ? '/tmp/data' : path.join(process.cwd(), 'data');
const USED_IPS_PATH = path.join(DATA_DIR, 'used-ips.json');

export type RateLimitStatus = 'allowed' | 'ip_used';

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.dirname(USED_IPS_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Read used IPs from file
function getUsedIPs(): string[] {
  ensureDataDir();
  try {
    if (!fs.existsSync(USED_IPS_PATH)) {
      fs.writeFileSync(USED_IPS_PATH, '[]', 'utf-8');
      return [];
    }
    const content = fs.readFileSync(USED_IPS_PATH, 'utf-8');
    return JSON.parse(content);
  } catch {
    return [];
  }
}

// Mark an IP as used (permanent)
export function markIPUsed(ip: string): void {
  ensureDataDir();
  const ips = getUsedIPs();
  const normalized = ip.trim();
  if (!ips.includes(normalized)) {
    ips.push(normalized);
    try {
      fs.writeFileSync(USED_IPS_PATH, JSON.stringify(ips, null, 2), 'utf-8');
    } catch (e) {
      console.warn('Could not write to used-ips.json', e);
    }
  }
}

// Check if an IP has already been used
export function isIPUsed(ip: string): boolean {
  const ips = getUsedIPs();
  return ips.includes(ip.trim());
}

// Main rate limit check
export function checkRateLimit(email: string, ip: string): RateLimitStatus {
  // Check IP (permanent block)
  if (isIPUsed(ip)) {
    return 'ip_used';
  }

  return 'allowed';
}

// Store submission data
export function storeSubmission(data: {
  email: string;
  ip: string;
  timestamp: string;
  accountContext: object;
  questionnaire: object;
  stats: object;
  llmResponse: string;
  provider: string;
  keyIndex: number;
}): void {
  const submissionsDir = path.join(DATA_DIR, 'submissions');
  if (!fs.existsSync(submissionsDir)) {
    fs.mkdirSync(submissionsDir, { recursive: true });
  }

  const filename = `${data.timestamp.replace(/[:.]/g, '-')}_${data.email.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
  const filepath = path.join(submissionsDir, filename);
  try {
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Could not write submission file', e);
  }
}

// Store audit booking
export function storeAuditBooking(data: {
  email: string;
  contactMethod: string;
  note: string;
  timestamp: string;
}): void {
  const bookingsDir = path.join(DATA_DIR, 'audit-bookings');
  if (!fs.existsSync(bookingsDir)) {
    fs.mkdirSync(bookingsDir, { recursive: true });
  }

  const filename = `${data.timestamp.replace(/[:.]/g, '-')}_${data.email.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
  const filepath = path.join(bookingsDir, filename);
  try {
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Could not write booking file', e);
  }
}
