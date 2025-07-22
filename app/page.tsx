"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ImageIcon,
  FileText,
  Crop,
  Code,
  ArrowRight,
  Sparkles,
  Palette,
  LinkIcon,
  QrCode,
  Shield,
  Clock,
  Key,
  Timer,
} from "lucide-react"

const tools = [
  {
    id: "base64-converter",
    title: "Base64 转换",
    description: "图片与Base64字符串互转",
    icon: FileText,
    href: "/base64-converter",
    color: "bg-blue-500",
  },
  {
    id: "image-converter",
    title: "图片格式转换",
    description: "JPG、PNG、WebP、GIF格式互转",
    icon: ImageIcon,
    href: "/image-converter",
    color: "bg-green-500",
  },
  {
    id: "image-editor",
    title: "图片剪裁编辑",
    description: "剪裁、调整尺寸和比例",
    icon: Crop,
    href: "/image-editor",
    color: "bg-purple-500",
  },
  {
    id: "qr-code-tools",
    title: "二维码工具",
    description: "生成二维码和识别二维码内容",
    icon: QrCode,
    href: "/qr-code-tools",
    color: "bg-teal-500",
  },
  {
    id: "jwt-parser",
    title: "JWT 解析",
    description: "解析JWT token和验证签名",
    icon: Key,
    href: "/jwt-parser",
    color: "bg-amber-500",
  },
  {
    id: "cron-generator",
    title: "Cron 表达式",
    description: "生成和分析Cron定时任务表达式",
    icon: Timer,
    href: "/cron-generator",
    color: "bg-violet-500",
  },
  {
    id: "json-formatter",
    title: "JSON 格式化",
    description: "JSON美化、压缩、格式验证",
    icon: Code,
    href: "/json-formatter",
    color: "bg-orange-500",
  },
  {
    id: "color-converter",
    title: "颜色转换",
    description: "HEX、RGB、HSL颜色格式互转",
    icon: Palette,
    href: "/color-converter",
    color: "bg-pink-500",
  },
  {
    id: "url-encoder",
    title: "URL 编码",
    description: "URL编码解码工具",
    icon: LinkIcon,
    href: "/url-encoder",
    color: "bg-indigo-500",
  },
  {
    id: "password-generator",
    title: "密码生成器",
    description: "生成安全的随机密码",
    icon: Shield,
    href: "/password-generator",
    color: "bg-red-500",
  },
  {
    id: "timestamp-converter",
    title: "时间戳转换",
    description: "时间戳与日期时间互转",
    icon: Clock,
    href: "/timestamp-converter",
    color: "bg-cyan-500",
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              在线工具箱
            </h1>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">实用在线工具集合</h2>
          <p className="text-lg text-gray-600 mb-8">图片处理、格式转换、代码美化等工具，本地运行，保护隐私</p>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => {
              const IconComponent = tool.icon
              return (
                <Card
                  key={tool.id}
                  className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-1"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div
                        className={`w-12 h-12 ${tool.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {tool.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600">{tool.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Link href={tool.href}>
                      <Button className="w-full group-hover:bg-blue-600 transition-colors">
                        开始使用
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-4 bg-gray-50 border-t mt-12">
        <div className="max-w-4xl mx-auto text-center text-gray-600">
          <p>所有工具均在本地运行，保护您的隐私安全</p>
        </div>
      </footer>
    </div>
  )
}
