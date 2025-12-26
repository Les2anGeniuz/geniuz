"use client";

import Image from "next/image";
import Link from "next/link";

export default function Promo() {
    return(
        <section 
            id="promo-section"
            className="
                mx-auto mt-10 px-8 py-32 
                bg-[url('/Background.png')] 
                bg-cover 
                bg-center 
                bg-no-repeat 
                min-h-[80vh]
                flex items-center justify-center text-white
            "
        >
            <div className="text-center max-w-4xl px-6">
                <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-2">
                    Promo
                    <br />
                    Paket Membership
                </h1>
                
                <p className="text-lg md:text-xl font-medium text-gray-300 mb-8">
                    Summer Sale!
                </p>

                <div className="relative inline-block mb-10">
                    <p className="text-5xl md:text-6xl font-extrabold opacity-70">
                        Rp 6.999.000
                    </p>
                    <div className="absolute top-1/2 left-0 w-full h-2 bg-red-600 transform -translate-y-1/2 rotate-[-5deg] pointer-events-none"></div>
                </div>

                <div className="relative mb-6 flex justify-center items-center">
                    <p className="text-7xl md:text-9xl font-black leading-none">
                        Rp 5.999.000
                    </p>
                    <Image
                        src="/Tag Harga.svg"
                        alt="Tag Harga"
                        width={100}
                        height={100}
                        className="absolute right-0 bottom-0 md:-right-24 md:-bottom-8 transform rotate-6 hidden md:block"
                    />
                </div>
                
                <p className="text-base md:text-lg font-normal text-left py-5 text-gray-200 mb-16">
                    berlaku s.d November 2025
                </p>

                <div className="mt-12">
                    <Image
                        src="/logo_putih.svg"
                        alt="Logo Geniuz"
                        width={150}
                        height={50}
                        className="mx-auto"
                    />
                </div>
            </div>
        </section>
    );
}