"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Footer() {
    return (
        <footer className="bg-[url('/background.png')] py-16 text-white overflow-hidden relative">
            
            {/* Background Stripes (Horizontal blue lines in image) */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <div className="h-full w-full bg-repeat-x" style={{ 
                    backgroundImage: 'repeating-linear-gradient(to right, #1F4A75, #1F4A75 2px, transparent 2px, transparent 60px)' 
                }}></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6">
                
                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12  pb-12">
                    
                    {/* Logo Column */}
                    <div className="md:col-span-2">
                        <Image
                            src="/logo_putih.svg" 
                            alt="LesZan Geniuz Logo"
                            width={180} 
                            height={60} 
                            className="mb-8"
                        />
                    </div>
                    
                    {/* Hubungi Kami Column */}
                    <div>
                        <h3 className="text-xl font-bold mb-4 whitespace-nowrap">Hubungi Kami</h3>
                        <div className="space-y-2 text-sm">
                            <Link href="https://wa.me/6285XXXXXX" className="block hover:underline whitespace-nowrap">wa.me//6285XXXXXX</Link>
                            <a href="mailto:hello@geniuz.com" className="block hover:underline whitespace-nowrap">hello@geniuz.com</a>
                            <p className="whitespace-nowrap">Surakarta, Indonesia</p>
                        </div>
                    </div>
                    
                    {/* Info Lebih Lanjut Column */}
                    <div>
                        <h3 className="text-xl font-bold mb-4 whitespace-nowrap">Info Lebih Lanjut</h3>
                        <div className="space-y-2 text-sm">
                            <Link href="/about" className="block hover:underline">Tentang Kami</Link>
                            <Link href="/privacy" className="block hover:underline whitespace-nowrap">Kebijakan Privasi</Link>
                            <Link href="/faq" className="block hover:underline">FAQ</Link>
                        </div>
                    </div>
                </div>

                {/* Copyright Section */}
                <div className="mt-8 text-sm pt-4 flex justify-start">
                    <p>
                        <span className="py-1 px-3 rounded inline-block">
                            &copy; Copyright 2025, Geniuz. All Rights Reserved
                        </span>
                    </p>
                </div>

            </div>
        </footer>
    );
}