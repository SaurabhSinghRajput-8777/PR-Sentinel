import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Shield, GitPullRequest, Activity, LayoutDashboard } from "lucide-react";

export const Header: React.FC = () => {
  const location = useLocation();

  const navLinks = [
    { to: "/", label: "Queue", icon: GitPullRequest },
    { to: "/command-center", label: "Cockpit", icon: LayoutDashboard },
    { to: "/live-surface", label: "Live Surface", icon: Activity },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[#262626] bg-[#080808]/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#d8ff3e] text-black">
              <Shield className="h-5 w-5 stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-sm font-bold tracking-tight text-[#f5f5f0]">
                PR SENTINEL
              </span>
              <span className="text-[10px] font-mono text-[#686863] -mt-1 tracking-wider uppercase">
                Risk Engine v1.0
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-[#262626]">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                    isActive
                      ? "bg-[#181818] text-[#d8ff3e]"
                      : "text-[#a5a5a0] hover:text-[#f5f5f0] hover:bg-[#121212]"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-2 px-2.5 py-1 rounded bg-[#121212] border border-[#262626] text-xs font-mono text-[#a5a5a0]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#10b981] animate-pulse"></span>
            <span>WORKER: ACTIVE</span>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono text-[#a5a5a0]">
            <span className="px-2 py-0.5 rounded bg-[#181818] border border-[#262626] text-[#d8ff3e]">
              FREE TIER
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
