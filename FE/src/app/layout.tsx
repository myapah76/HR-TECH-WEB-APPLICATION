import QueryProvider from '@/src/providers/QueryProvider'
import AuthProvider from '../providers/AuthProvider'
import GoogleProvider from '../providers/GoogleProvider'
import Footer from '@/src/components/layout/Footer'
import Header from '@/src/components/layout/Header'
import '@/src/styles/global.css'
import { Geist } from 'next/font/google'
import { cn } from '@/src/lib/utils'
import { Metadata } from 'next'
import { Toaster } from 'sonner'
import { CookieWarningPopup } from '@/src/components/CookieWarningPopup'

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'HR-Tech',
  description: 'Tuyển dụng kỹ sư cao cấp',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" className={cn('font-sans', geist.variable)} suppressHydrationWarning>
      <body>
        <Header />
        <GoogleProvider>
          <QueryProvider>
            <AuthProvider>
              {children}
              <Toaster position="top-right" richColors closeButton />
              <CookieWarningPopup />
            </AuthProvider>
          </QueryProvider>
        </GoogleProvider>
        <Footer />
      </body>
    </html>
  )
}
