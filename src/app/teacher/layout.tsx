"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const { user, userRole, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // If not logged in or not a teacher, redirect to home
      if (!user || userRole !== 'teacher') {
        router.push('/');
      }
    }
  }, [user, userRole, loading, router]);

  if (loading) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        background: "var(--ms-bg)",
        color: "var(--ms-text)"
      }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
            <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: "2rem", color: "var(--ms-primary)" }}></i>
            <span>선생님 권한을 확인 중입니다...</span>
        </div>
      </div>
    );
  }

  // If authorized, render children
  if (!user || userRole !== 'teacher') {
      return null; // Will redirect
  }

  return <>{children}</>;
}
