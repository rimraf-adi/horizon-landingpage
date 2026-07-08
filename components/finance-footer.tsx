'use client';

import Link from 'next/link';
import { TrendingUp, Twitter, Linkedin, Mail,Instagram } from 'lucide-react';

export function FinanceFooter() {
    return (
        <footer className="relative z-10 border-t border-[rgba(212,175,55,0.2)] mt-auto">
            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="md:col-span-2">
                        <Link href="/" className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#059669] to-[#10B981] flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-[#FFFFFF]" />
                            </div>
                            <h2 className="text-xl font-bold text-gold-gradient">Paisanomics</h2>
                        </Link>
                        <p className="text-[#94A3B8] max-w-md">
                            Your trusted source for financial market analysis, investment strategies,
                            and economic insights. Stay informed, make better decisions.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-[#F8FAFC] font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/" className="text-[#94A3B8] hover:text-[#10B981] transition-colors">
                                    Latest Posts
                                </Link>
                            </li>
                            <li>
                                <Link href="/" className="text-[#94A3B8] hover:text-[#10B981] transition-colors">
                                    Market Analysis
                                </Link>
                            </li>
                            <li>
                                <Link href="/" className="text-[#94A3B8] hover:text-[#10B981] transition-colors">
                                    Investment Tips
                                </Link>
                            </li>
                            <li>
                                <Link href="/" className="text-[#94A3B8] hover:text-[#10B981] transition-colors">
                                    About Us
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Connect */}
                    <div>
                        <h3 className="text-[#94A3B8] hover:text-[#D4AF37] font-semibold mb-4">Connect</h3>
                        <div className="flex gap-4">
                            <a
                                href="https://www.instagram.com/paisanomicswithpranav/"
                                target='_blank'
                                className="w-10 h-10 rounded-lg bg-[rgba(255, 255, 255, 0.6)] flex items-center justify-center text-[#94A3B8] hover:text-[#D4AF37] hover:bg-[rgba(212,175,55,0.2)] transition-all"
                                aria-label="Instagram"
                            >
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 rounded-lg bg-[rgba(255, 255, 255, 0.6)] flex items-center justify-center text-[#94A3B8] hover:text-[#D4AF37] hover:bg-[rgba(212,175,55,0.2)] transition-all"
                                aria-label="Instagram"
                            >
                                <Linkedin className="w-5 h-5" />
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 rounded-lg bg-[rgba(255, 255, 255, 0.6)] flex items-center justify-center text-[#94A3B8] hover:text-[#D4AF37] hover:bg-[rgba(212,175,55,0.2)] transition-all"
                                aria-label="Email"
                            >
                                <Mail className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-[rgba(212,175,55,0.1)] mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-[#64748B] text-sm">
                        © 2025 Paisanomics. All rights reserved.
                    </p>
                    <p className="text-[#64748B] text-sm">
                        Built with 💚 for financial enthusiasts
                    </p>
                </div>
            </div>
        </footer>
    );
}
