import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";
import { DevModeProvider } from "./components/DevModeProvider";

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
            {children}
          </ThemeProvider>
        </DevModeProvider>
      </body>
    </html>
  );
}