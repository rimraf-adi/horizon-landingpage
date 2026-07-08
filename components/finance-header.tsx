'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TrendingUp, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function FinanceHeader() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 glass">
            <div className="max-w-6xl mx-auto px-4 py-4">
                <nav className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-[11px] bg-primary flex items-center justify-center shadow-lg transition-all duration-400 ease-out">
                            <TrendingUp className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-foreground">Paisanomics</h1>
                            <p className="text-xs text-muted-foreground tracking-wide hidden sm:block">Financial Markets & Analysis</p>
                        </div>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link
                            href="/"
                            className="text-foreground hover:text-primary transition-colors font-medium"
                        >
                            Home
                        </Link>
                        <Link
                            href="/blogs"
                            className="text-muted-foreground hover:text-primary transition-colors"
                        >
                            Blogs
                        </Link>
                        <Link
                            href="/trade-check"
                            className="text-muted-foreground hover:text-primary transition-colors"
                        >
                            Trade Check
                        </Link>
                        <Link
                            href="/#about"
                            className="text-muted-foreground hover:text-primary transition-colors"
                        >
                            About
                        </Link>
                    </div>

                    {/* Desktop CTA Button */}
                    <Link
                        href="/blogs"
                        className="hidden md:block px-5 py-2.5 rounded-[10px] bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all duration-400 ease-out"
                    >
                        Read Articles
                    </Link>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 rounded-lg bg-secondary border border-border text-foreground"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </nav>
            </div>

            {/* Mobile Menu Dropdown */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="md:hidden glass border-t border-border"
                    >
                        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-4">
                            <Link
                                href="/"
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-foreground hover:text-primary transition-colors font-medium py-2"
                            >
                                Home
                            </Link>
                            <Link
                                href="/blogs"
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-muted-foreground hover:text-primary transition-colors py-2"
                            >
                                Blogs
                            </Link>
                            <Link
                                href="/trade-check"
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-muted-foreground hover:text-primary transition-colors py-2"
                            >
                                Trade Check
                            </Link>
                            <Link
                                href="/#about"
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-muted-foreground hover:text-primary transition-colors py-2"
                            >
                                About
                            </Link>
                            <Link
                                href="/blogs"
                                onClick={() => setMobileMenuOpen(false)}
                                className="mt-2 px-5 py-3 rounded-[10px] bg-primary text-primary-foreground font-semibold text-center"
                            >
                                Read Articles
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
