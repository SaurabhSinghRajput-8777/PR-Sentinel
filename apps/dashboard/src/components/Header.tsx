import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Box, Cpu } from "lucide-react";

export const Header: React.FC = () => {
  const location = useLocation();

  const navLinks = [
    { to: "/", label: "PULL REQUESTS" },
    { to: "/command-center", label: "ANALYTICS" },
    { to: "/about", label: "ABOUT" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[#d4d0c7] bg-[#efece6] backdrop-blur-sm">
      <div className="w-full flex h-14 items-stretch justify-between">
        {/* Left side: Brand + Space + Nav Links */}
        <div className="flex items-stretch">
          {/* Brand / Logo section with vertical divider */}
          <div className="flex items-center px-6 sm:px-8 border-r border-[#d4d0c7]">
            <Link to="/" className="group flex items-center space-x-3.5">
              {/* Isometric 3D wireframe cube icon */}
              <div className="flex items-center justify-center text-[#111111] transition-transform group-hover:scale-105">
                <Box className="h-5 w-5 stroke-[1.8]" />
              </div>
              <span className="font-display text-sm font-bold tracking-tight text-[#111111] uppercase">
                PR SENTINEL
              </span>
            </Link>
          </div>

          {/* Architectural spacing cell between product name and nav items */}
          <div className="w-8 sm:w-16 border-r border-[#d4d0c7] bg-[#f2efe9]/40" />

          {/* Nav tabs with vertical border cells and red active indicator */}
          <nav className="flex items-stretch divide-x divide-[#d4d0c7] border-r border-[#d4d0c7]">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative flex items-center px-6 sm:px-8 text-xs font-mono tracking-wider transition-colors select-none ${
                    isActive
                      ? "text-[#e63920] font-bold bg-[#efece6]"
                      : "text-[#111111] hover:text-[#e63920] hover:bg-[#e9e6df]"
                  }`}
                >
                  <span>{link.label}</span>
                  {/* Active red underline indicator */}
                  {isActive && (
                    <div className="absolute bottom-0 left-6 right-6 h-[2px] bg-[#e63920]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Rightmost: Engine status and Gemini version cell with left vertical divider */}
        <div className="hidden sm:flex items-center px-6 sm:px-8 border-l border-[#d4d0c7]">
          <div className="flex items-center space-x-2.5 text-xs font-mono">
            <Cpu className="h-3.5 w-3.5 text-[#e63920]" />
            <span className="text-[#666660] font-medium uppercase tracking-wider">ENGINE:</span>
            <span className="text-[#107040] font-bold">ONLINE</span>
            <span className="text-[#b5b0a4]">·</span>
            <span className="text-[#111111] font-semibold">GEMINI 1.5 FLASH</span>
          </div>
        </div>
      </div>
    </header>
  );
};
