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
} from "lucide-react"

const tools = [
  {
    title: "Base64 转换器",
    description: "Base64 编码解码工具",
    href: "/base64-converter",
    icon: FileText,
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "颜色转换器",
    description: "RGB、HEX、HSL 颜色转换",
    href: "/color-converter",
    icon: Palette,
    color: "from-purple-500 to-pink-500",
  },
  {
    title: "图片转换器",
    description: "图片格式转换工具",
    href: "/image-converter",
    icon: ImageIcon,
    color: "from-green-500 to-emerald-500",
  },
  {
    title: "图片编辑器",
    description: "在线图片编辑工具",
    href: "/image-editor",
    icon: Edit3,
    color: "from-orange-500 to-red-500",
  },
  {
    title: "JSON 格式化",
    description: "JSON 美化和压缩工具",
    href: "/json-formatter",
    icon: Code,
    color: "from-indigo-500 to-purple-500",
  },
  {
    title: "密码生成器",
    description: "安全密码生成工具",
    href: "/password-generator",
    icon: Key,
    color: "from-red-500 to-pink-500",
  },
  {
    title: "二维码工具",
    description: "二维码生成和识别",
    href: "/qr-code-tools",
    icon: QrCode,
    color: "from-teal-500 to-cyan-500",
  },
  {
    title: "时间戳转换",
    description: "时间戳与日期转换",
    href: "/timestamp-converter",
    icon: Clock,
    color: "from-amber-500 to-orange-500",
  },
  {
    title: "URL 编码器",
    description: "URL 编码解码工具",
    href: "/url-encoder",
    icon: LinkIcon,
    color: "from-cyan-500 to-blue-500",
  },
  {
    title: "JWT 解析器",
    description: "JWT Token 解析工具",
    href: "/jwt-parser",
    icon: Hash,
    color: "from-violet-500 to-purple-500",
  },
  {
    title: "Cron 表达式",
    description: "Cron 表达式生成和解析",
    href: "/cron-generator",
    icon: Calendar,
    color: "from-emerald-500 to-teal-500",
  },
  {
    title: "MD5 生成器",
    description: "MD5 哈希值生成工具",
    href: "/md5-generator",
    icon: Fingerprint,
    color: "from-rose-500 to-pink-500",
  },
  {
    title: "UUID 生成器",
    description: "UUID 唯一标识符生成",
    href: "/uuid-generator",
    icon: Hash,
    color: "from-blue-500 to-indigo-500",
  },
  {
    title: "正则表达式测试",
    description: "正则表达式测试和验证",
    href: "/regex-tester",
    icon: TestTube,
    color: "from-green-500 to-teal-500",
  },
  {
    title: "文本差异对比",
    description: "文本内容差异对比工具",
    href: "/text-diff",
    icon: GitCompare,
    color: "from-purple-500 to-violet-500",
  },
  {
    title: "文本搜索替换",
    description: "文本搜索和替换工具",
    href: "/text-search-replace",
    icon: Search,
    color: "from-orange-500 to-red-500",
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              开发者工具箱
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              为开发者精心打造的在线工具集合，提供各种实用的转换、生成和处理工具
            </p>
            <div className="flex items-center justify-center">
              <Badge variant="secondary" className="text-xs">
                🤖 本网站由 AI 生成
              </Badge>
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
                <Card className="h-full hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 bg-gradient-to-br ${tool.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}
                      >
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {tool.title}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-xs text-gray-600 leading-relaxed">
                      {tool.description}
                    </CardDescription>
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
