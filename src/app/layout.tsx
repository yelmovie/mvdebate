import type { Metadata } from "next";
import "../styles/globals.css";
import "../styles/moviesam-dark.css";
import "../styles/persona.css";
import "../styles/responsive.css";
import AppShell from "../components/layout/AppShell";
import { Providers } from "../components/layout/Providers";

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
    <html lang="ko" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
      </head>
      <body className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
        <Providers>
          <div className="min-h-screen flex flex-col">
            <AppShell /> 

            <div className="flex-1">
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
