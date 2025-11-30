import type { Metadata } from "next";
import "../styles/globals.css";
import "../styles/moviesam-dark.css";
import "../styles/persona.css";
import AppShell from "../components/layout/AppShell";
import { ScreenModeProvider } from "../context/ScreenModeContext";

export const metadata: Metadata = {
  title: "MovieSSam Debate Lab",
  description: "AI와 함께 연습하는 학생용 토론 웹앱"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body>
        <ScreenModeProvider>
          <AppShell>{children}</AppShell>
        </ScreenModeProvider>
      </body>
    </html>
  );
}
