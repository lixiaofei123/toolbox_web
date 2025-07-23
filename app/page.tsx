"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRightLeft,
  Hash,
  ImageIcon,
  FileText,
  QrCode,
  Key,
  Clock,
  LinkIcon,
  Palette,
  Search,
  Diff,
  Cog,
  Shuffle,
  Crop,
  Pipette,
  Bot,
} from "lucide-react"

const tools = [
  {
    title: "Base64 转换",
    description: "Base64 编码和解码工具",
    href: "/base64-converter",
    icon: ArrowRightLeft,
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
  },
  {
    title: "哈希值生成",
    description: "MD5、SHA-1、SHA-256、SHA-384、SHA-512 哈希计算",
    href: "/hash-generator",
    icon: Hash,
    color: "from-emerald-500 to-green-500",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-700",
  },
  {
    title: "图片格式转换",
    description: "支持 JPG、PNG、WebP、GIF 等格式互转",
    href: "/image-converter",
    icon: ImageIcon,
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50",
    textColor: "text-purple-700",
  },
  {
    title: "JSON 格式化",
    description: "JSON 数据格式化、压缩和验证",
    href: "/json-formatter",
    icon: FileText,
    color: "from-orange-500 to-red-500",
    bgColor: "bg-orange-50",
    textColor: "text-orange-700",
  },
  {
    title: "二维码工具",
    description: "二维码生成和识别工具",
    href: "/qr-code-tools",
    icon: QrCode,
    color: "from-indigo-500 to-purple-500",
    bgColor: "bg-indigo-50",
    textColor: "text-indigo-700",
  },
  {
    title: "JWT 解析",
    description: "JWT Token 解析和验证工具",
    href: "/jwt-parser",
    icon: Key,
    color: "from-teal-500 to-cyan-500",
    bgColor: "bg-teal-50",
    textColor: "text-teal-700",
  },
  {
    title: "时间戳转换",
    description: "Unix 时间戳与日期时间互转",
    href: "/timestamp-converter",
    icon: Clock,
    color: "from-amber-500 to-yellow-500",
    bgColor: "bg-amber-50",
    textColor: "text-amber-700",
  },
  {
    title: "URL 编码",
    description: "URL 编码和解码工具",
    href: "/url-encoder",
    icon: LinkIcon,
    color: "from-rose-500 to-pink-500",
    bgColor: "bg-rose-50",
    textColor: "text-rose-700",
  },
  {
    title: "颜色转换",
    description: "HEX、RGB、HSL 等颜色格式转换",
    href: "/color-converter",
    icon: Palette,
    color: "from-violet-500 to-purple-500",
    bgColor: "bg-violet-50",
    textColor: "text-violet-700",
  },
  {
    title: "密码生成器",
    description: "生成安全的随机密码",
    href: "/password-generator",
    icon: Shuffle,
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
  },
  {
    title: "正则表达式测试",
    description: "正则表达式匹配和测试工具",
    href: "/regex-tester",
    icon: Search,
    color: "from-blue-500 to-indigo-500",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
  },
  {
    title: "文本差异对比",
    description: "比较两个文本的差异",
    href: "/text-diff",
    icon: Diff,
    color: "from-cyan-500 to-blue-500",
    bgColor: "bg-cyan-50",
    textColor: "text-cyan-700",
  },
  {
    title: "Cron 表达式生成",
    description: "Cron 表达式生成和解析工具",
    href: "/cron-generator",
    icon: Cog,
    color: "from-gray-500 to-slate-500",
    bgColor: "bg-gray-50",
    textColor: "text-gray-700",
  },
  {
    title: "UUID 生成器",
    description: "生成各种版本的 UUID",
    href: "/uuid-generator",
    icon: Hash,
    color: "from-pink-500 to-rose-500",
    bgColor: "bg-pink-50",
    textColor: "text-pink-700",
  },
  {
    title: "图片编辑器",
    description: "在线图片编辑和处理工具",
    href: "/image-editor",
    icon: Crop,
    color: "from-indigo-500 to-blue-500",
    bgColor: "bg-indigo-50",
    textColor: "text-indigo-700",
  },
  {
    title: "文本搜索替换",
    description: "批量文本搜索和替换工具",
    href: "/text-search-replace",
    icon: Search,
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-700",
  },
  {
    title: "颜色取色器",
    description: "从图片中提取颜色信息",
    href: "/color-picker",
    icon: Pipette,
    color: "from-purple-500 to-violet-500",
    bgColor: "bg-purple-50",
    textColor: "text-purple-700",
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Bot className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                开发者工具箱
              </h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              为开发者精心打造的在线工具集合，提供各种实用的开发和调试工具
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <Badge variant="outline" className="text-xs">
                <Bot className="w-3 h-3 mr-1" />
                AI 生成
              </Badge>
              <Badge variant="outline" className="text-xs">
                {tools.length} 个工具
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Tools Grid */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tools.map((tool, index) => {
            const Icon = tool.icon
            return (
              <Link key={index} href={tool.href}>
                <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-md bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${tool.bgColor} group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Icon className={`w-5 h-5 ${tool.textColor}`} />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {tool.title}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-gray-600 leading-relaxed">{tool.description}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-gray-200">
            <Bot className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-gray-600">本网站由 AI 生成</span>
          </div>
        </footer>
      </main>
    </div>
  )
}
