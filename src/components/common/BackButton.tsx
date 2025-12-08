"use client";

import { useRouter } from "next/navigation";

interface BackButtonProps {
  label?: string;
  fallbackPath?: string;
  className?: string;
  style?: React.CSSProperties; 
}

export default function BackButton({
  label = "이전 화면으로 돌아가기",
  fallbackPath = "/",
  className = "",
  style
}: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    // Check if there is history (this is a rough check, as window.history.length includes the current page)
    // A safer bet in Next.js usually involves checking if we can go back, but simple window.history check + fallback is common pattern.
    // However, window.history.length is not reliable for "can go back".
    // We will try back, but if it fails (not easily detectable), we might need a timeout or just rely on fallback if explicitly provided for 'safer' navigation in deep links.
    // For this requirement: "1. history back 2. else fallback"
    
    // Since we can't easily detect if back() did anything in a SPA without complex history tracking,
    // we'll defer to the user's request pattern:
    if (window.history.length > 1) {
        router.back();
    } else {
        router.push(fallbackPath);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="이전 화면으로 돌아가기"
      className={`inline-flex items-center gap-2 rounded-full bg-slate-200/50 dark:bg-slate-800/50 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-300/50 dark:hover:bg-slate-700/50 transition ${className}`}
      style={{ marginBottom: "16px", alignSelf: "flex-start", ...style }}
    >
      <i className="fa-solid fa-arrow-left" style={{ fontSize: "14px" }}></i>
      <span>{label}</span>
    </button>
  );
}
