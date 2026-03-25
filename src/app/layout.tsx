import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
  description: "Painel de operacao para agendamentos da barbearia",
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
      <body className="min-h-screen flex flex-col" style={{ background: "linear-gradient(135deg, #121212 0%, #1a1a1a 100%)" }}>
        {/* Premium Header */}
        <header className="border-b" style={{ borderColor: "#2a2a2a", background: "#121212" }}>
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <div
                  className="px-3 py-2 rounded-sm text-lg font-bold"
                  style={{ color: "#d4af37", letterSpacing: "2px" }}
                >
                  ✂
                </div>
                <div>
                  <h1 className="text-xl font-bold" style={{ color: "#d4af37" }}>
                    BARBER
                  </h1>
                  <p className="text-xs" style={{ color: "#b0b0b0" }}>
                    Sistema de Agenda
                  </p>
                </div>
              </div>

              {/* Nav Pills */}
              <nav className="flex gap-1">
                <a
                  href="#"
                  className="px-4 py-2 rounded-full text-xs font-medium transition-all duration-300"
                  style={{
                    color: "#eaeaea",
                    background: "#d4af37",
                  }}
                >
                  Agenda
                </a>
                <a
                  href="#"
                  className="px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 hover:opacity-80"
                  style={{
                    color: "#b0b0b0",
                  }}
                >
                  Clientes
                </a>
                <a
                  href="#"
                  className="px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 hover:opacity-80"
                  style={{
                    color: "#b0b0b0",
                  }}
                >
                  Serviços
                </a>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer */}
        <footer
          className="border-t text-center py-4 text-xs"
          style={{ borderColor: "#2a2a2a", color: "#808080" }}
        >
          <p>Barber Dashboard v1.0.0</p>
        </footer>
      </body>
    </html>
  );
}
