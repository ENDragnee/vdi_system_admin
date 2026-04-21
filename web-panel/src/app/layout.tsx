import type { Metadata, Viewport } from "next";
import { Libre_Baskerville, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/provider/theme-provider";
import SessionProviderWrapper from "@/provider/session-provider";
import { QueryProvider } from "@/provider/query-provider";
import { NotificationProvider } from "@/provider/notification-provider";

const libreBaskerville = Libre_Baskerville({ 
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-sans" 
});
const geistMono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "VDI Control Plane",
    template: "%s | VDI Admin"
  },
  description: "Enterprise Virtual Desktop Infrastructure Management & Real-time Telemetry",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning={true}>
      <body className={`${libreBaskerville.variable} ${geistMono.variable} antialiased selection:bg-primary selection:text-primary-foreground font-sans`}>
        <SessionProviderWrapper>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <QueryProvider>
              <NotificationProvider>
                {/* Removed fixed h-screen to allow proper scrolling in main content */}
                <div className="min-h-screen bg-background">
                  {children}
                </div>
              </NotificationProvider>
            </QueryProvider>
          </ThemeProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
