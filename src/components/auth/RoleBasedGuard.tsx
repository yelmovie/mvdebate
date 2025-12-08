"use client";

import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { UserRole } from "../../constants/roles";

interface Props {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
}

export default function RoleBasedGuard({ children, allowedRoles, requireAuth = true }: Props) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (requireAuth && !user) {
      router.push("/"); // Redirect to home/login
      return;
    }

    if (allowedRoles && profile && (!('role' in profile) || !allowedRoles.includes(profile.role))) {
      alert("접근 권한이 없습니다.");
      router.push("/"); // Or an 'unauthorized' page
      return;
    }
  }, [user, profile, loading, requireAuth, allowedRoles, router]);

  if (loading) {
    return <div style={{ padding: 20 }}>Loading authentication...</div>;
  }

  // If requiring auth but not logged in, render nothing (effect will redirect)
  if (requireAuth && !user) return null;

  // If role check failed, render nothing (effect will redirect)
  if (allowedRoles && profile && (!('role' in profile) || !allowedRoles.includes(profile.role))) return null;

  return <>{children}</>;
}
