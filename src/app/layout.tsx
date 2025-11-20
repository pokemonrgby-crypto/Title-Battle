import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '칭호 배틀 - Title Battle',
  description: '칭호를 얻고 강화하며 전투하는 게임',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
