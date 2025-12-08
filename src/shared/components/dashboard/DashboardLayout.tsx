import React from "react";
import GreetingHeader from "./GreetingHeader";
// DashboardCard is usually used inside the page, but Layout handles the grid structure.

interface Props {
  role: "student" | "teacher";
  children: React.ReactNode;
  userName: string;
  layoutMode?: "grid" | "custom";
  classInfo?: {
    name: string;
    code: string;
  } | null;
}

export default function DashboardLayout({ role, children, userName, layoutMode = "grid", classInfo }: Props) {
  return (
    <main style={{ maxWidth: "1400px", margin: "0 auto", padding: "30px 40px 60px" }}>
      <GreetingHeader role={role} name={userName} classInfo={classInfo} />
      
      {layoutMode === "grid" ? (
        <div 
            className="dashboard-grid"
            style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "24px",
            }}
        >
            {children}
        </div>
      ) : (
        <div className="dashboard-custom-layout">
            {children}
        </div>
      )}
    </main>
  );
}
