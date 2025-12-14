"use client";

import { ScreenModeProvider } from "../../context/ScreenModeContext";
import { AuthProvider } from "../../contexts/AuthContext";
import { StudentProvider } from "../../contexts/StudentContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <StudentProvider>
        <ScreenModeProvider>
          {children}
        </ScreenModeProvider>
      </StudentProvider>
    </AuthProvider>
  );
}
