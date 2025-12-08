"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type LogoutButtonProps = {
  label?: string;
  className?: string;
  iconOnly?: boolean;
};

export function LogoutButton({
  label = "로그아웃",
  className = "",
  iconOnly = false
}: LogoutButtonProps) {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    if(!confirm("로그아웃 하시겠습니까?")) return;
    try {
      await logout();
      router.push("/");
    } catch (err) {
      console.error("logout error", err);
      alert("로그아웃 중 오류가 발생했습니다.");
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={
        `px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-800/80 text-slate-200 hover:bg-slate-700/90 transition inline-flex items-center gap-1.5 ` +
        className
      }
      aria-label="로그아웃"
    >
      <LogOut size={14} />
      {!iconOnly && <span>{label}</span>}
    </button>
  );
}
