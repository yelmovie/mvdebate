import React from 'react';
import { ICONS } from "@/constants/icons";

interface Props {
  title: string;
  iconClassName?: string;
  children: React.ReactNode;
  variant?: 'normal' | 'primary' | 'gold' | 'rose' | 'green';
  highlight?: boolean;
}

export default function GamifiedCard({ title, iconClassName, children, variant = 'normal', highlight = false }: Props) {
  let bg = "var(--ms-surface)";
  let border = "1px solid var(--ms-border-subtle)";
  
  if (highlight) {
    bg = "rgba(255, 255, 255, 0.08)";
    border = "1px solid rgba(255, 255, 255, 0.2)";
  }
  
  const cardStyle: React.CSSProperties = {
    background: bg,
    border: border,
    borderRadius: "16px",
    padding: "20px",
    position: "relative",
    overflow: "hidden",
    transition: "transform 0.2s, box-shadow 0.2s",
    boxShadow: highlight ? "0 0 15px rgba(255, 255, 255, 0.1)" : "0 4px 6px rgba(0,0,0,0.05)"
  };

  return (
    <div className="gamified-card" style={cardStyle}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
        {iconClassName && <i className={`${iconClassName}`} style={{ fontSize: "1.2rem", color: "var(--ms-primary)" }} />}
        <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>{title}</h3>
      </div>
      <div>{children}</div>
      <style jsx>{`
        .gamified-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
      `}</style>
    </div>
  );
}
