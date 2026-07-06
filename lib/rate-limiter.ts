/**
 * Rate Limiter — One-time per IP address tracking using filesystem JSON.
 */

import fs from 'fs';
import path from 'path';

const USED_IPS_PATH = path.join(process.cwd(), 'data', 'used-ips.json');

export type RateLimitStatus = 'allowed' | 'ip_used';

function ensureDataDir() {
  try {
    const dataDir = path.dirname(USED_IPS_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  } catch (error) {
    console.warn('[Rate Limiter] Failed to create data dir (likely read-only filesystem):', error);
  }
}

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

export function isIPUsed(ip: string): boolean {
  const ips = getUsedIPs();
  return ips.includes(ip.trim());
}

export function markIPUsed(ip: string): void {
  ensureDataDir();
  const ips = getUsedIPs();
  const normalized = ip.trim();
  if (!ips.includes(normalized)) {
    ips.push(normalized);
    try {
      fs.writeFileSync(USED_IPS_PATH, JSON.stringify(ips, null, 2), 'utf-8');
    } catch (error) {
      console.warn('[Rate Limiter] Failed to write IP file (likely read-only filesystem):', error);
    }
  }
}

export function checkRateLimit(email: string, ip: string): RateLimitStatus {
  if (isIPUsed(ip)) {
    return 'ip_used';
  }
  return 'allowed';
}

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
  try {
    const submissionsDir = path.join(process.cwd(), 'data', 'submissions');
    if (!fs.existsSync(submissionsDir)) {
      fs.mkdirSync(submissionsDir, { recursive: true });
    }

    const filename = `${data.timestamp.replace(/[:.]/g, '-')}_${data.email.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
    const filepath = path.join(submissionsDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.warn('[Trade Check] Failed to store submission (likely read-only filesystem):', error);
  }
}
