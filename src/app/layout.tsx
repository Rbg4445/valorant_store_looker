import type { Metadata, Viewport } from "next";
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
  title: "VALORANT Günlük Mağaza | Canlı Mağaza Kontrolü",
  description: "Valorant günlük silah kaplaması mağazanızı, VP fiyatlarını ve video önizlemelerini canlı görüntüleyin.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Valorant Mağaza",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#060b10",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#060b10] text-gray-100 selection:bg-red-500 selection:text-white overscroll-none">
        {children}
      </body>
    </html>
  );
}
