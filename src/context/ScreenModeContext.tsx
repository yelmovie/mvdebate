"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type ScreenMode = "phone-portrait" | "tablet-landscape";

interface ScreenModeContextType {
  screenMode: ScreenMode;
  setScreenMode: (mode: ScreenMode) => void;
}

const ScreenModeContext = createContext<ScreenModeContextType | undefined>(undefined);

export function ScreenModeProvider({ children }: { children: React.ReactNode }) {
  const [screenMode, setScreenModeState] = useState<ScreenMode>("tablet-landscape");

  useEffect(() => {
    // Load from localStorage on mount
    const savedMode = localStorage.getItem("mvdebate_screen_mode") as ScreenMode;
    if (savedMode === "phone-portrait" || savedMode === "tablet-landscape") {
      setScreenModeState(savedMode);
    } else {
      // Auto-detect if no saved preference
      const isMobile = window.matchMedia("(max-width: 768px)").matches;
      if (isMobile) {
        setScreenModeState("phone-portrait");
      }
    }
  }, []);

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
