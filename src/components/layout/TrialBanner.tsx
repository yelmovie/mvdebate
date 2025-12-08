"use client";

import { useEffect, useState } from "react";
import { isTrialActive, getTrialDaysLeft } from "../../config/trialConfig";

export default function TrialBanner() {
  const [active, setActive] = useState(false);
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    setActive(isTrialActive());
    setDaysLeft(getTrialDaysLeft());
  }, []);

  if (!active) return null;

  return (
    <div style={{ 
        background: "linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)", 
        color: "white", 
        textAlign: "center", 
        padding: "8px", 
        fontSize: "13px",
        fontWeight: "bold"
    }}>
        🎉 현재 12월 말까지 <span style={{ textDecoration: "underline" }}>시범 운영 기간</span>입니다. 
        (남은 기간: {daysLeft}일)
    </div>
  );
}
