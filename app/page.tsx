import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  Palette,
  ImageIcon,
  Edit3,
  Code,
  Key,
  QrCode,
  Clock,
  LinkIcon,
  Hash,
  Fingerprint,
  Calendar,
  TestTube,
  GitCompare,
  Search,
  Sparkles,
} from "lucide-react"

const tools = [
  {
    title: "Base64 转换器",
    description: "Base64 编码解码，支持文本和图片",
    href: "/base64-converter",
    icon: FileText,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "颜色转换器",
    description: "RGB、HEX、HSL 等颜色格式转换",
    href: "/color-converter",
    icon: Palette,
    gradient: "from-purple-500 to-pink-500",
  },
  {
    title: "图片转换器",
    description: "图片格式转换，支持多种格式",
    href: "/image-converter",
    icon: ImageIcon,
    gradient: "from-green-500 to-emerald-500",
  },
  {
    title: "图片编辑器",
    description: "在线图片编辑，调整尺寸和格式",
    href: "/image-editor",
    icon: Edit3,
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    title: "JSON 格式化",
    description: "JSON 美化、压缩和验证工具",
    href: "/json-formatter",
    icon: Code,
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    title: "密码生成器",
    description: "生成安全的随机密码",
    href: "/password-generator",
    icon: Key,
    gradient: "from-red-500 to-pink-500",
  },
  {
    title: "二维码工具",
    description: "二维码生成和识别工具",
    href: "/qr-code-tools",
    icon: QrCode,
    gradient: "from-teal-500 to-cyan-500",
  },
  {
    title: "时间戳转换",
    description: "Unix 时间戳与日期时间转换",
    href: "/timestamp-converter",
    icon: Clock,
    gradient: "from-amber-500 to-yellow-500",
  },
  {
    title: "URL 编码器",
    description: "URL 编码解码工具",
    href: "/url-encoder",
    icon: LinkIcon,
    gradient: "from-lime-500 to-green-500",
  },
  {
    title: "JWT 解析器",
    description: "JWT Token 解析和验证",
    href: "/jwt-parser",
    icon: Hash,
    gradient: "from-violet-500 to-purple-500",
  },
  {
    title: "Cron 表达式",
    description: "Cron 表达式生成和解析工具",
    href: "/cron-generator",
    icon: Calendar,
    gradient: "from-rose-500 to-pink-500",
  },
  {
    title: "MD5 生成器",
    description: "MD5 哈希值生成工具",
    href: "/md5-generator",
    icon: Fingerprint,
    gradient: "from-slate-500 to-gray-500",
  },
  {
    title: "UUID 生成器",
    description: "UUID 唯一标识符生成工具",
    href: "/uuid-generator",
    icon: Hash,
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    title: "正则表达式",
    description: "正则表达式测试和验证工具",
    href: "/regex-tester",
    icon: TestTube,
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    title: "文本差异对比",
    description: "文本内容差异对比工具",
    href: "/text-diff",
    icon: GitCompare,
    gradient: "from-pink-500 to-rose-500",
  },
  {
    title: "文本搜索替换",
    description: "文本搜索替换，支持正则表达式",
    href: "/text-search-replace",
    icon: Search,
    gradient: "from-orange-500 to-red-500",
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                开发者工具箱
              </h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              为开发者精心打造的在线工具集合，提供高效便捷的开发辅助功能
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Sparkles className="w-4 h-4" />
              <span>本网站由 AI 生成</span>
            </div>
          </div>
        </div>
      </header>

      {/* Tools Grid */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tools.map((tool) => {
            const Icon = tool.icon
            return (
              <Link key={tool.href} href={tool.href}>
                <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 bg-gradient-to-br ${tool.gradient} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                          {tool.title}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-sm text-gray-600 leading-relaxed">
                      {tool.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        {/* Stats */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-6 px-6 py-3 bg-white/60 backdrop-blur-sm rounded-full border">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {tools.length} 个工具
              </Badge>
            </div>
            <div className="text-sm text-gray-600">持续更新中...</div>
          </div>
        </div>
      </main>
    </div>
  )
}
