import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cashflow Tracker",
  description: "Track your income, expenses, and savings",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="min-h-screen bg-background">
            <div className="container mx-auto p-4">
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold">Cashflow Tracker</h1>
                <ThemeToggle />
              </div>
              {children}
            </div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
