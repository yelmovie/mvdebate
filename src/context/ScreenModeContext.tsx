"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export type ScreenMode = "phone-portrait" | "tablet-landscape";

interface ScreenModeContextType {
  screenMode: ScreenMode;
  setScreenMode: (mode: ScreenMode) => void;
}

const ScreenModeContext = createContext<ScreenModeContextType | undefined>(undefined);

export function ScreenModeProvider({ children }: { children: React.ReactNode }) {
  const [screenMode, setScreenModeState] = useState<ScreenMode>("tablet-landscape");

  const { user, profile } = useAuth();

  useEffect(() => {
    // 1. If authenticated (Teacher/Student), FORCE 'tablet-landscape' (PC/Tablet view)
    if (user && profile && 'role' in profile) {
      if (profile.role === 'teacher' || profile.role === 'student') {
        setScreenModeState("tablet-landscape");
        return; 
      }
    }

    // 2. Otherwise (Guest/Public), use saved preference or DEFAULT TO LANDSCAPE
    const savedMode = localStorage.getItem("mvdebate_screen_mode") as ScreenMode;
    if (savedMode === "phone-portrait" || savedMode === "tablet-landscape") {
      setScreenModeState(savedMode);
    } else {
      // FORCE DEFAULT LANDSCAPE (Disable auto-mobile detect)
      setScreenModeState("tablet-landscape");
    }
  }, [user, profile]);

  const setScreenMode = (mode: ScreenMode) => {
    setScreenModeState(mode);
    localStorage.setItem("mvdebate_screen_mode", mode);
  };

  return (
    <ScreenModeContext.Provider value={{ screenMode, setScreenMode }}>
      <div 
        className={`app-root app-root--${screenMode}`}
        data-screen-mode={screenMode}
        style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
      >
        {children}
      </div>
    </ScreenModeContext.Provider>
  );
}

export function useScreenMode() {
  const context = useContext(ScreenModeContext);
  if (context === undefined) {
    throw new Error("useScreenMode must be used within a ScreenModeProvider");
  }
  return context;
}
