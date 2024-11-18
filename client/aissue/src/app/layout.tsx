import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import ReactQueryProviders from '@/providers/ReactQueryProvider'

const APP_NAME = 'Aissue App'
const APP_DEFAULT_TITLE = 'Aissue App'
const APP_TITLE_TEMPLATE = '%s - PWA App'
const APP_DESCRIPTION = 'Best jira API app in the world!'

const pretendard = localFont({
  src: '../static/fonts/PretendardVariable.woff2',
  display: 'swap',
  weight: '45 920',
  variable: '--font-pretendard',
})

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: APP_DEFAULT_TITLE,
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: 'summary',
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
}

export const viewport: Viewport = {
  themeColor: '#84e5d7',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="kr" className={`${pretendard.variable} font-pretendard`}>
      <head>
        {/* public/img/chatbot.png 파일을 favicon으로 설정 */}
        <link rel="icon" href="/img/chatbot.png" type="image/png" />
      </head>
      <body className="overflow-hidden">
        <ReactQueryProviders> {children}</ReactQueryProviders>
      </body>
    </html>
  )
}
