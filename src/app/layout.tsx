import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { dark } from "@clerk/themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MYGYM | Aesthetic Workout Tracker",
  description: "Track your progress, crush your goals, stay consistent.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        elements: {
          card: "bg-card border border-border shadow-2xl rounded-3xl",
          formButtonPrimary: "bg-primary text-black hover:bg-white transition-all duration-300 rounded-xl font-bold uppercase tracking-widest",
          footerActionLink: "text-primary hover:text-white",
          identityPreviewText: "text-muted font-bold",
          identityPreviewEditButtonIcon: "text-primary",
        },
      }}
    >
      <html 
        lang="en" 
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
        suppressHydrationWarning
      >
        <body 
          className="min-h-full bg-background text-foreground flex flex-col md:flex-row overflow-x-hidden"
          suppressHydrationWarning
        >
          <div className="flex w-full relative">
            <Sidebar />
            <main className="flex-1 w-full lg:ml-64 flex flex-col h-screen overflow-y-auto overflow-x-hidden">
              <Header />
              <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-10 pb-[120px] md:pb-20 relative px-4 md:px-10">
                {children}
              </div>
            </main>
            <BottomNav />
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
