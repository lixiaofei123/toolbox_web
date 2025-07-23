import Link from "next/link"
import {
  FileText,
  ImageIcon,
  QrCode,
  Key,
  Clock,
  Code,
  Palette,
  FileJson,
  Lock,
  Pipette,
  Search,
  Diff,
  BarChart4,
  Layers,
  Cpu,
  Hash,
} from "lucide-react"

export default function Home() {
  // 工具列表
  const tools = [
    {
      name: "Base64 转换器",
      description: "图片与 Base64 编码互转",
      href: "/base64-converter",
      icon: <FileText className="w-4 h-4" />,
      color: "bg-blue-100 text-blue-600",
    },
    {
      name: "图片转换器",
      description: "转换图片格式",
      href: "/image-converter",
      icon: <ImageIcon className="w-4 h-4" />,
      color: "bg-green-100 text-green-600",
    },
    {
      name: "图片编辑器",
      description: "调整图片大小和格式",
      href: "/image-editor",
      icon: <Layers className="w-4 h-4" />,
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      name: "二维码工具",
      description: "生成和解析二维码",
      href: "/qr-code-tools",
      icon: <QrCode className="w-4 h-4" />,
      color: "bg-purple-100 text-purple-600",
    },
    {
      name: "密码生成器",
      description: "生成安全的随机密码",
      href: "/password-generator",
      icon: <Key className="w-4 h-4" />,
      color: "bg-red-100 text-red-600",
    },
    {
      name: "时间戳转换",
      description: "时间戳与日期互转",
      href: "/timestamp-converter",
      icon: <Clock className="w-4 h-4" />,
      color: "bg-amber-100 text-amber-600",
    },
    {
      name: "URL 编解码",
      description: "URL 编码与解码转换",
      href: "/url-encoder",
      icon: <Code className="w-4 h-4" />,
      color: "bg-indigo-100 text-indigo-600",
    },
    {
      name: "颜色转换器",
      description: "颜色格式互转",
      href: "/color-converter",
      icon: <Palette className="w-4 h-4" />,
      color: "bg-pink-100 text-pink-600",
    },
    {
      name: "JSON 格式化",
      description: "格式化和验证 JSON",
      href: "/json-formatter",
      icon: <FileJson className="w-4 h-4" />,
      color: "bg-cyan-100 text-cyan-600",
    },
    {
      name: "JWT 解析器",
      description: "解码和验证 JWT 令牌",
      href: "/jwt-parser",
      icon: <Lock className="w-4 h-4" />,
      color: "bg-violet-100 text-violet-600",
    },
    {
      name: "哈希值生成",
      description: "支持MD5、SHA1、SHA256等多种哈希算法",
      href: "/hash-generator",
      icon: <Hash className="w-4 h-4" />,
      color: "bg-rose-100 text-rose-600",
    },
    {
      name: "UUID 生成器",
      description: "生成 UUID 标识符",
      href: "/uuid-generator",
      icon: <Cpu className="w-4 h-4" />,
      color: "bg-lime-100 text-lime-600",
    },
    {
      name: "Cron 表达式",
      description: "生成和解析 Cron 表达式",
      href: "/cron-generator",
      icon: <BarChart4 className="w-4 h-4" />,
      color: "bg-teal-100 text-teal-600",
    },
    {
      name: "正则表达式",
      description: "测试和验证正则表达式",
      href: "/regex-tester",
      icon: <Search className="w-4 h-4" />,
      color: "bg-orange-100 text-orange-600",
    },
    {
      name: "文本差异比较",
      description: "比较两段文本的差异",
      href: "/text-diff",
      icon: <Diff className="w-4 h-4" />,
      color: "bg-sky-100 text-sky-600",
    },
    {
      name: "文本搜索替换",
      description: "搜索和替换文本内容",
      href: "/text-search-replace",
      icon: <Search className="w-4 h-4" />,
      color: "bg-fuchsia-100 text-fuchsia-600",
    },
    {
      name: "颜色取色器",
      description: "从图片中提取颜色",
      href: "/color-picker",
      icon: <Pipette className="w-4 h-4" />,
      color: "bg-amber-100 text-amber-600",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-6">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">在线工具箱</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            免费、快速、易用的在线工具集合，无需安装，即开即用，提高您的工作效率
          </p>
          <div className="mt-2 text-sm text-gray-500">由 AI 自动生成</div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col h-24"
            >
              <div className="flex items-center mb-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tool.color} flex-shrink-0`}>
                  {tool.icon}
                </div>
                <h2 className="ml-3 font-medium text-sm leading-tight">{tool.name}</h2>
              </div>
              <p className="text-gray-500 text-xs leading-tight truncate flex-1">{tool.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
