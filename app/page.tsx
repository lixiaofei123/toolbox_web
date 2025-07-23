import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  ImageIcon,
  Palette,
  QrCode,
  Key,
  Clock,
  LinkIcon,
  Hash,
  Shuffle,
  Code,
  Calendar,
  Shield,
  Search,
  Diff,
  Pipette,
} from "lucide-react"

const tools = [
  {
    title: "Base64 转换器",
    description: "Base64 编码解码工具",
    href: "/base64-converter",
    icon: FileText,
    color: "bg-blue-500",
  },
  {
    title: "图片格式转换",
    description: "支持多种图片格式互转",
    href: "/image-converter",
    icon: ImageIcon,
    color: "bg-green-500",
  },
  {
    title: "颜色转换器",
    description: "RGB、HEX、HSL 颜色转换",
    href: "/color-converter",
    icon: Palette,
    color: "bg-purple-500",
  },
  {
    title: "二维码工具",
    description: "生成和识别二维码",
    href: "/qr-code-tools",
    icon: QrCode,
    color: "bg-indigo-500",
  },
  {
    title: "密码生成器",
    description: "生成安全的随机密码",
    href: "/password-generator",
    icon: Key,
    color: "bg-red-500",
  },
  {
    title: "时间戳转换",
    description: "Unix 时间戳转换工具",
    href: "/timestamp-converter",
    icon: Clock,
    color: "bg-yellow-500",
  },
  {
    title: "URL 编码器",
    description: "URL 编码解码工具",
    href: "/url-encoder",
    icon: LinkIcon,
    color: "bg-cyan-500",
  },
  {
    title: "JSON 格式化",
    description: "JSON 美化和压缩工具",
    href: "/json-formatter",
    icon: Code,
    color: "bg-teal-500",
  },
  {
    title: "图片编辑器",
    description: "在线图片编辑和调整",
    href: "/image-editor",
    icon: ImageIcon,
    color: "bg-orange-500",
  },
  {
    title: "Cron 表达式",
    description: "Cron 表达式生成和解析",
    href: "/cron-generator",
    icon: Calendar,
    color: "bg-pink-500",
  },
  {
    title: "MD5 生成器",
    description: "MD5 哈希值生成工具",
    href: "/md5-generator",
    icon: Hash,
    color: "bg-gray-500",
  },
  {
    title: "UUID 生成器",
    description: "UUID 唯一标识符生成",
    href: "/uuid-generator",
    icon: Shuffle,
    color: "bg-emerald-500",
  },
  {
    title: "JWT 解析器",
    description: "JWT Token 解析和验证",
    href: "/jwt-parser",
    icon: Shield,
    color: "bg-violet-500",
  },
  {
    title: "正则表达式测试",
    description: "正则表达式测试和匹配",
    href: "/regex-tester",
    icon: Search,
    color: "bg-rose-500",
  },
  {
    title: "文本差异对比",
    description: "文本内容差异对比工具",
    href: "/text-diff",
    icon: Diff,
    color: "bg-amber-500",
  },
  {
    title: "文本搜索替换",
    description: "文本搜索和替换工具",
    href: "/text-search-replace",
    icon: Search,
    color: "bg-lime-500",
  },
  {
    title: "颜色取色器",
    description: "从图片中提取颜色",
    href: "/color-picker",
    icon: Pipette,
    color: "bg-fuchsia-500",
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">开发者工具箱</h1>
            <p className="text-lg text-gray-600 mb-4">一站式在线工具集合，提升开发效率</p>
            <Badge variant="secondary" className="text-sm">
              ✨ 本网站由 AI 生成
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tools.map((tool) => {
            const IconComponent = tool.icon
            return (
              <Link key={tool.href} href={tool.href}>
                <Card className="h-full hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg ${tool.color} flex items-center justify-center group-hover:scale-110 transition-transform`}
                      >
                        <IconComponent className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm font-semibold text-gray-900 truncate">{tool.title}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-xs text-gray-600 line-clamp-2">{tool.description}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>© 2024 开发者工具箱. 所有工具均可免费使用.</p>
        </footer>
      </main>
    </div>
  )
}
