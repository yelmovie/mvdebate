"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { userRole, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // If userRole is explicitly 'teacher', they shouldn't be here (unless we allow preview?)
      // User requested: "Teacher can't access /student" logic.
      if (userRole === 'teacher') {
        router.push('/teacher/dashboard');
      }
    }
  }, [userRole, loading, router]);

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
            Loading...
          </div>
    );
  }

  return <>{children}</>;
}
