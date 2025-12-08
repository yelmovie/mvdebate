"use client";

import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ROLES } from "../../constants/roles";

interface Props {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: Props) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Check if logged in & is Admin
    if (!user || !profile || !('role' in profile) || profile.role !== ROLES.ADMIN) {
      alert("관리자 권한이 필요합니다.");
      router.replace("/"); // Redirect to home
      return;
    }
  }, [user, profile, loading, router]);

  if (loading) {
    return <div className="flex-center" style={{ height: "100vh" }}>Admin check...</div>;
  }

  if (!user || !profile || !('role' in profile) || profile.role !== ROLES.ADMIN) return null;

  return <>{children}</>;
}
