import QueryProvider from '@/src/providers/QueryProvider'
import AuthProvider from '../providers/AuthProvider'
import GoogleProvider from '../providers/GoogleProvider'
import { ThemeProvider } from '../providers/ThemeProvider'
import { NotificationProvider } from '@/src/providers/NotificationProvider'
import Footer from '@/src/components/layout/Footer'
import Header from '@/src/components/layout/Header'
import '@/src/styles/global.css'
import { Geist } from 'next/font/google'
import { cn } from '@/src/utils'
import { Metadata } from 'next'
import { Toaster } from 'sonner'
import { CookieWarningPopup } from '@/src/components/layout/CookieWarningPopup'

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
      <head>
        <script
          // chống nhấp nháy sáng
          dangerouslySetInnerHTML={{
            __html: `
        (function() {
          try {
            var theme = localStorage.getItem('theme') || 'light';
            if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          } catch (e) {}
        })()
      `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <GoogleProvider>
            <QueryProvider>
              <AuthProvider>
                <NotificationProvider>
                  <Header />
                  {children}
                  <Toaster position="top-right" richColors closeButton />
                  <CookieWarningPopup />
                </NotificationProvider>
              </AuthProvider>
            </QueryProvider>
          </GoogleProvider>
        </ThemeProvider>
        <Footer />
      </body>
    </html>
  )
}

