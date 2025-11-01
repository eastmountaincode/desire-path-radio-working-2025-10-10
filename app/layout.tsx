import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";
import { DevModeProvider } from "./components/DevModeProvider";
import { AudioPlayerProvider } from "./components/AudioPlayer/AudioPlayerProvider";
import { MobileMenuProvider } from "./components/MobileMenuProvider";
import { LiveChannelToggleProvider } from "./components/LiveChannelToggleProvider";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "DPR",
  description: "Desire Path Radio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <DevModeProvider>
          <ThemeProvider>
            <MobileMenuProvider>
              <AudioPlayerProvider>
                <LiveChannelToggleProvider>
                  {children}
                </LiveChannelToggleProvider>
              </AudioPlayerProvider>
            </MobileMenuProvider>
          </ThemeProvider>
        </DevModeProvider>
        <Analytics />
      </body>
    </html>
  );
}