import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "在线工具箱 - 开发者实用工具集合 | AI Generated",
  description:
    "提供Base64转换、图片处理、二维码工具、JWT解析、正则表达式测试等实用在线工具。完全由AI生成，本地运行，保护隐私。",
  keywords: "在线工具,Base64转换,图片处理,二维码,JWT,正则表达式,开发者工具,AI生成",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
