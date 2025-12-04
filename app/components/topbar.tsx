"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

const Topbar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-sm z-50">
      <div className="max-w-8xl mx-auto flex items-center justify-between px-6 py-1">
        
        {/* === LOGO === */}
        <div className="flex items-center gap-2 ml-0"> {/* Align logo with sidebar */}
          <Image
            src="/logo_geniuz.png"
            alt="Logo Les-lesan Geniuz"
            width={120}  // Ensuring the logo size is consistent
            height={40}
            priority
          />
        </div>

        {/* === PROFILE AND NOTIFICATION ICON === */}
        <div className="flex items-center gap-4"> {/* Adjusted for more spacing to the right */}
          <Link href="/notifications">
            <Image
              src="/notification.svg" // Ensure path is correct
              alt="Notification Icon"
              width={24}  // Adjusted to match sidebar icon size
              height={24}
            />
          </Link>
          <Link href="/profile">
            <Image
              src="/profile_placeholder.jpg" // Profile image
              alt="Profile Icon"
              width={40}  // Consistent with sidebar icon size
              height={40}
              className="rounded-full"
            />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Topbar;