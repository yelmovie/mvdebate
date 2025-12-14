"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavIcons } from "@/lib/icons";

const navItems = [
  { href: "/", label: "홈", icon: NavIcons.Home },
  { href: "/debate", label: "학생 토론", icon: NavIcons.StudentDebate },
  { href: "/student/mypage", label: "마이페이지", icon: NavIcons.MyPage },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 h-[70px] nav-glass-bar">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4">
        {/* 로고 + 제목 */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl text-lg"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid var(--landing-border)",
            }}
          >
            🎬
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--landing-text)" }}>
              MovieSSam Debate Lab
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                style={{
                  background: "rgba(125, 211, 252, 0.18)",
                  border: "1px solid rgba(255,255,255,0.16)",
                  color: "var(--landing-text)",
                }}
              >
                v1.0
              </span>
            </div>
            <p className="text-xs truncate" style={{ color: "var(--landing-faint)" }}>
              학생용 AI 모의 토론 연습실
            </p>
          </div>
        </div>

        {/* 네비게이션 */}
        <nav className="flex items-center gap-3 md:gap-4 flex-nowrap">
          {navItems.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="nav-pill landing-focus"
                data-active={active}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={18} className="shrink-0" />
                <span className="font-semibold whitespace-nowrap">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
