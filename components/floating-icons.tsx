'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

interface FloatingIcon {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    icon: string;
    size: number;
    opacity: number;
    rotation: number;
    rotationSpeed: number;
}

const ICONS = ['$', '₹', '%', '+', '−', '📊', '📈', '💰', '🧮', '÷', '×', '¢'];

// Organic feel: fewer icons, more variation
const ICON_COUNT = 11;
const REPEL_RADIUS = 130;
const REPEL_FORCE = 6;
const FRICTION = 0.94;
const BASE_VELOCITY = 0.25;

export function FloatingIcons() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [icons, setIcons] = useState<FloatingIcon[]>([]);
    const mousePos = useRef({ x: -1000, y: -1000 });
    const animationRef = useRef<number>();
    const iconsRef = useRef<FloatingIcon[]>([]);

    // Initialize icons
    useEffect(() => {
        const initIcons: FloatingIcon[] = [];
        for (let i = 0; i < ICON_COUNT; i++) {
            initIcons.push({
                id: i,
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
                vx: (Math.random() - 0.5) * BASE_VELOCITY,
                vy: (Math.random() - 0.5) * BASE_VELOCITY,
                icon: ICONS[Math.floor(Math.random() * ICONS.length)],
                // More varied sizes for organic feel
                size: 16 + Math.random() * 32,
                // More varied opacity - some barely visible, some more prominent
                opacity: 0.08 + Math.random() * 0.28,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 0.4,
            });
        }
        setIcons(initIcons);
        iconsRef.current = initIcons;
    }, []);

    // Animation loop
    const animate = useCallback(() => {
        const width = typeof window !== 'undefined' ? window.innerWidth : 1000;
        const height = typeof window !== 'undefined' ? window.innerHeight : 800;

        iconsRef.current = iconsRef.current.map((icon) => {
            let { x, y, vx, vy, rotation, rotationSpeed } = icon;

            // Calculate distance from mouse/touch
            const dx = x - mousePos.current.x;
            const dy = y - mousePos.current.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Apply repel force if within radius
            if (distance < REPEL_RADIUS && distance > 0) {
                const force = (REPEL_RADIUS - distance) / REPEL_RADIUS * REPEL_FORCE;
                vx += (dx / distance) * force;
                vy += (dy / distance) * force;
            }

            // Apply friction
            vx *= FRICTION;
            vy *= FRICTION;

            // Add subtle drift
            vx += (Math.random() - 0.5) * 0.02;
            vy += (Math.random() - 0.5) * 0.02;

            // Update position
            x += vx;
            y += vy;

            // Wrap around screen edges
            if (x < -50) x = width + 50;
            if (x > width + 50) x = -50;
            if (y < -50) y = height + 50;
            if (y > height + 50) y = -50;

            // Update rotation
            rotation += rotationSpeed;

            return { ...icon, x, y, vx, vy, rotation };
        });

        setIcons([...iconsRef.current]);
        animationRef.current = requestAnimationFrame(animate);
    }, []);

    // Start animation
    useEffect(() => {
        animationRef.current = requestAnimationFrame(animate);
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [animate]);

    // Mouse tracking
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mousePos.current = { x: e.clientX, y: e.clientY };
        };

        const handleMouseLeave = () => {
            mousePos.current = { x: -1000, y: -1000 };
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    // Touch tracking
    useEffect(() => {
        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length > 0) {
                mousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }
        };

        const handleTouchEnd = () => {
            mousePos.current = { x: -1000, y: -1000 };
        };

        window.addEventListener('touchmove', handleTouchMove);
        window.addEventListener('touchend', handleTouchEnd);

        return () => {
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 pointer-events-none overflow-hidden z-0"
            aria-hidden="true"
        >
            {icons.map((icon) => (
                <div
                    key={icon.id}
                    className="absolute select-none transition-opacity duration-300"
                    style={{
                        left: icon.x,
                        top: icon.y,
                        fontSize: icon.size,
                        opacity: icon.opacity,
                        transform: `translate(-50%, -50%) rotate(${icon.rotation}deg)`,
                        color: '#059669',
                        textShadow: '0 0 20px rgba(5, 150, 105, 0.4)',
                        willChange: 'transform, left, top',
                    }}
                >
                    {icon.icon}
                </div>
            ))}
        </div>
    );
}
