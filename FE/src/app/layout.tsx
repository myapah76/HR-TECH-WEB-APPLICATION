import QueryProvider from "@/src/providers/QueryProvider";
import Footer from "@/src/components/layout/Footer";
import Header from "@/src/components/layout/Header";
import "@/src/styles/global.css";
import { Geist } from "next/font/google";
import { cn } from "@/src/lib/utils";
import { Metadata } from "next";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "HR-Tech",
  description: "Tuyển dụng kỹ sư cao cấp",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={cn("font-sans", geist.variable)}>
      <body>
        <Header />
        <QueryProvider>{children}</QueryProvider>
        <Footer />
      </body>
    </html>
  );
}
