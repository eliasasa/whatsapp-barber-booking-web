import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import Navbar from "@/components/layouts/navbar/Navbar";
import { ToastProvider } from "@/components/ui/toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WhatsApp Barber - Painel",
  description: "Painel de operação para agendamentos da barbearia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col">
        <ToastProvider>
          <Navbar />

          <main className="flex-1 pb-8 sm:pb-10">
            {children}
          </main>

          <footer className="container-shell mt-4 pb-6 pt-2 text-center text-xs text-[var(--color-text-disabled)] sm:pb-8">
            <div className="surface-card px-4 py-3">
              <p>Barber Dashboard v1.0.0</p>
            </div>
          </footer>
        </ToastProvider>
      </body>
    </html>
  );
}
