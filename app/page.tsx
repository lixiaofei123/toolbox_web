import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  FileImage,
  ImageIcon,
  Scissors,
  QrCode,
  Key,
  Clock,
  Hash,
  Fingerprint,
  Search,
  GitCompare,
  Braces,
  Palette,
  LinkIcon,
  Shield,
  Calendar,
} from "lucide-react"

const tools = [
  {
    title: "Base64 转换",
    description: "图片与Base64字符串互转",
    href: "/base64-converter",
    icon: FileImage,
    color: "bg-blue-500",
  },
  {
    title: "图片格式转换",
    description: "JPG、PNG、WebP、GIF格式互转",
    href: "/image-converter",
    icon: ImageIcon,
    color: "bg-green-500",
  },
  {
    title: "图片剪裁编辑",
    description: "剪裁、调整尺寸和比例",
    href: "/image-editor",
    icon: Scissors,
    color: "bg-purple-500",
  },
  {
    title: "二维码工具",
    description: "生成二维码和识别二维码内容",
    href: "/qr-code-tools",
    icon: QrCode,
    color: "bg-indigo-500",
  },
  {
    title: "JWT 解析",
    description: "解析JWT token和验证签名",
    href: "/jwt-parser",
    icon: Key,
    color: "bg-orange-500",
  },
  {
    title: "Cron 表达式",
    description: "生成和分析Cron定时任务表达式",
    href: "/cron-generator",
    icon: Clock,
    color: "bg-teal-500",
  },
  {
    title: "MD5 生成",
    description: "字符串和文件MD5哈希值生成",
    href: "/md5-generator",
    icon: Hash,
    color: "bg-red-500",
  },
  {
    title: "UUID 生成",
    description: "批量生成唯一标识符UUID",
    href: "/uuid-generator",
    icon: Fingerprint,
    color: "bg-pink-500",
  },
  {
    title: "正则表达式测试",
    description: "验证正则表达式语法，测试匹配结果",
    href: "/regex-tester",
    icon: Search,
    color: "bg-cyan-500",
  },
  {
    title: "文本差异对比",
    description: "对比两段文本的差异，高亮显示变化",
    href: "/text-diff",
    icon: GitCompare,
    color: "bg-emerald-500",
  },
  {
    title: "JSON 格式化",
    description: "JSON美化、压缩、格式验证",
    href: "/json-formatter",
    icon: Braces,
    color: "bg-yellow-500",
  },
  {
    title: "颜色转换",
    description: "HEX、RGB、HSL颜色格式互转",
    href: "/color-converter",
    icon: Palette,
    color: "bg-rose-500",
  },
  {
    title: "URL 编码",
    description: "URL编码解码工具",
    href: "/url-encoder",
    icon: LinkIcon,
    color: "bg-violet-500",
  },
  {
    title: "密码生成器",
    description: "生成安全的随机密码",
    href: "/password-generator",
    icon: Shield,
    color: "bg-slate-500",
  },
  {
    title: "时间戳转换",
    description: "时间戳与日期时间互转",
    href: "/timestamp-converter",
    icon: Calendar,
    color: "bg-amber-500",
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">在线工具箱</h1>
            <p className="text-lg text-gray-600">开发者实用工具集合</p>
          </div>
        </div>
      </header>

      {/* Tools Grid */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tools.map((tool) => {
            const IconComponent = tool.icon
            return (
              <Link key={tool.href} href={tool.href}>
                <Card className="h-full hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 ${tool.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}
                      >
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                          {tool.title}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-sm leading-relaxed">{tool.description}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/50 backdrop-blur-sm mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">在线工具箱 - 让开发更简单</p>
            <p className="text-sm">包含 {tools.length} 个实用工具，持续更新中...</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
