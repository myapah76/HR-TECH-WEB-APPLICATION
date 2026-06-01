import QueryProvider from "@/src/providers/QueryProvider"
import { Footer } from "@/src/components/Footer"
import { Header } from "@/src/components/Header"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi">
      <body>
        <Header />

        <QueryProvider>{children}</QueryProvider>

        <Footer />
      </body>
    </html>
  )
}
