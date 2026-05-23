import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "Flipped It Doley CRM",
  description: "Real Estate Investor Lead Manager",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full bg-gray-50 text-gray-900 antialiased">
        <nav className="bg-slate-900 text-white px-6 py-3 flex items-center gap-6 shadow">
          <span className="font-bold text-lg tracking-tight">Flipped It Doley CRM</span>
          <a href="/today" className="text-slate-300 hover:text-white text-sm transition-colors">Today</a>
          <a href="/" className="text-slate-300 hover:text-white text-sm transition-colors">Pipeline</a>
          <a href="/revival" className="text-slate-300 hover:text-white text-sm transition-colors">Revival</a>
          <a href="/api/export" className="text-slate-300 hover:text-white text-sm transition-colors">Export CSV</a>
          <a href="/leads/new" className="ml-auto bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-1.5 rounded-md transition-colors">
            + Add Lead
          </a>
        </nav>
        <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
