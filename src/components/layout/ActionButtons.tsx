"use client";

import { useRouter } from "next/navigation";

export default function ActionButtons() {
  const router = useRouter();

  const buttons = [
    {
      icon: "fa-arrow-left",
      title: "뒤로가기",
      onClick: () => {
        if (typeof window !== 'undefined' && window.history.length > 1) {
          router.back();
        } else {
          router.push("/");
        }
      },
      color: "bg-slate-100 hover:bg-slate-200 text-slate-700",
    },
    {
      icon: "fa-rotate-right",
      title: "새로고침",
      onClick: () => {
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      },
      color: "bg-mint-100 hover:bg-mint-200 text-mint-700",
    },
    {
      icon: "fa-circle-question",
      title: "도움말",
      onClick: () => {
        // TODO: 도움말 모달 또는 페이지 연결
      },
      color: "bg-lavender-100 hover:bg-lavender-200 text-lavender-700",
    },
    {
      icon: "fa-gear",
      title: "설정",
      onClick: () => {
        // TODO: 설정 모달 또는 페이지 연결
      },
      color: "bg-slate-100 hover:bg-slate-200 text-slate-700",
    },
  ];

  return (
    <div className="flex items-center justify-center gap-3">
      {buttons.map((button, index) => (
        <button
          key={index}
          onClick={button.onClick}
          className={`
            w-11 h-11 rounded-full flex items-center justify-center
            transition-all duration-200 shadow-sm hover:shadow-md
            transform hover:scale-110 active:scale-95
            ${button.color}
          `}
          title={button.title}
        >
          <i className={`fas ${button.icon} text-base`}></i>
        </button>
      ))}
    </div>
  );
}

