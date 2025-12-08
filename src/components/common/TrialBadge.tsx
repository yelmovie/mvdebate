"use client";

export default function TrialBadge() {
  return (
    <div 
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
      style={{
        background: "#C084FC20",
        color: "#C084FC",
      }}
    >
      <span>🧪</span>
      <span>시범 운영(10개 반 / 최대 300명)</span>
    </div>
  );
}

