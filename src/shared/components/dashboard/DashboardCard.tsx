import React from "react";

interface DashboardCardProps {
  title: string;
  children: React.ReactNode;
  actionButton?: React.ReactNode; // Optional header button
  footer?: React.ReactNode;
  className?: string;
  theme?: "default" | "highlight";
}

export default function DashboardCard({
  title,
  children,
  actionButton,
  footer,
  className = "",
  theme = "default"
}: DashboardCardProps) {
  const isHighlight = theme === "highlight";

  return (
    <div
      className={`dashboard-card ${className}`}
      style={{
        background: isHighlight ? "rgba(255, 255, 255, 0.08)" : "var(--ms-surface)",
        border: isHighlight ? "1px solid rgba(255,255,255,0.2)" : "1px solid var(--ms-border-subtle)",
        borderRadius: "16px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        height: "100%", // for grid consistency
        ...(!isHighlight ? {} : { backdropFilter: "blur(10px)" })
      }}
    >
      <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--ms-text)" }}>
          {title}
        </h3>
        {actionButton}
      </div>

      <div className="card-content" style={{ flex: 1 }}>
        {children}
      </div>

      {footer && (
        <div className="card-footer" style={{ marginTop: "auto", paddingTop: "12px" }}>
          {footer}
        </div>
      )}
    </div>
  );
}
