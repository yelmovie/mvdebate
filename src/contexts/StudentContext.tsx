"use client";

import { useAuth } from "./AuthContext";

// Compat layer: This file now just proxies AuthContext
export const useStudent = () => {
  const { studentProfile, loading, loginStudent, logout } = useAuth();
  
  return {
    studentProfile,
    loading,
    loginStudent,
    logoutStudent: logout // Map logoutStudent to global logout for now
  };
};

// Dummy Provider to prevent breaking existing layout imports
export function StudentProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>; 
}
