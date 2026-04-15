import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: {
    default: "ConceptLeak — ML Data Leakage Detector",
    template: "%s | ConceptLeak",
  },
  description:
    "ConceptLeak is a production-grade platform for detecting concept leakage in machine learning datasets. Upload your CSV or XLSX files and get instant AI-powered risk analysis.",
  keywords: ["concept leakage", "data leakage", "machine learning", "data science", "AI audit", "ML integrity"],
  authors: [{ name: "ConceptLeak Team" }],
  creator: "ConceptLeak",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "ConceptLeak — ML Data Leakage Detector",
    description: "Detect concept leakage in your ML datasets with AI-powered analysis.",
    siteName: "ConceptLeak",
  },
  twitter: {
    card: "summary_large_image",
    title: "ConceptLeak — ML Data Leakage Detector",
    description: "Detect concept leakage in your ML datasets with AI-powered analysis.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-[#0f172a] text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
