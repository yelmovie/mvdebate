"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function HomeHeader() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "홈", icon: "fa-home", path: "/" },
    { href: "/debate", label: "학생 토론", icon: "fa-comments", path: "/debate" },
    { href: "/student/mypage", label: "마이페이지", icon: "fa-user", path: "/student/mypage" },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed top-0 left-0 w-full h-[60px] bg-white/95 backdrop-blur-md border-b border-lavender-200/30 shadow-sm z-50">
      <div className="h-full max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
        {/* Left: Logo + Service Name */}
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-lavender-400 to-mint-300 flex items-center justify-center shadow-sm flex-shrink-0">
            <i className="fas fa-comments text-white text-sm"></i>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm md:text-base font-bold text-slate-800 leading-tight truncate">
              MovieSSam Debate Lab
            </span>
            <span className="text-[10px] md:text-xs text-slate-500 leading-tight hidden sm:block">
              학생용 AI 모의 토론 연습
            </span>
          </div>
        </div>

        {/* Right: Navigation Icons */}
        <div className="flex items-center gap-2 md:gap-4 lg:gap-6">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex flex-col items-center gap-0.5 md:gap-1 px-2 md:px-3 py-1 md:py-1.5 rounded-lg transition-all
                  ${active 
                    ? "text-lavender-600 bg-lavender-50" 
                    : "text-slate-600 hover:text-lavender-600 hover:bg-lavender-50/50"
                  }
                `}
              >
                <i className={`fas ${item.icon} text-[24px]`}></i>
                <span className="text-[10px] md:text-xs font-medium hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
          
          {/* Help Button */}
          <button
            className="flex flex-col items-center gap-0.5 md:gap-1 px-2 md:px-3 py-1 md:py-1.5 rounded-lg transition-all text-slate-600 hover:text-lavender-600 hover:bg-lavender-50/50"
            onClick={(e) => {
              e.preventDefault();
              // TODO: 도움말 모달 또는 페이지 연결
            }}
          >
            <i className="fas fa-circle-question text-[24px]"></i>
            <span className="text-[10px] md:text-xs font-medium hidden sm:inline">도움말</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

