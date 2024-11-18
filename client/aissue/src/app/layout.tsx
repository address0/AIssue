import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import ReactQueryProviders from '@/providers/ReactQueryProvider'

const pretendard = localFont({
  src: '../static/fonts/PretendardVariable.woff2',
  display: 'swap',
  weight: '45 920',
  variable: '--font-pretendard',
})

export const metadata: Metadata = {
  title: 'Aissue',

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
      <body style={{
        overflow: 'hidden', // 내부 스크롤 제거
      }}>
        <ReactQueryProviders> {children}</ReactQueryProviders>
      </body>
    </html>
  )
}
