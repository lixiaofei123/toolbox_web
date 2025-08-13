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
  Monitor,
  ArrowLeftRight,
  Heart,
  Github,
  Globe,
  Gift,
  Network,
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
    {
      name: "浏览器信息",
      description: "检测浏览器信息和生成浏览器指纹",
      href: "/browser-info",
      icon: <Monitor className="w-4 h-4" />,
      color: "bg-slate-100 text-slate-600",
    },
    {
      name: "JSON/YAML转换",
      description: "JSON和YAML格式互相转换",
      href: "/json-yaml-converter",
      icon: <ArrowLeftRight className="w-4 h-4" />,
      color: "bg-blue-100 text-blue-600",
    },
    {
      name: "IP信息查询",
      description: "获取本机IP地址和地理位置信息",
      href: "/ip-info",
      icon: <Globe className="w-4 h-4" />,
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      name: "抽奖程序",
      description: "支持导入名单、设置中奖人数的抽奖工具",
      href: "/lottery",
      icon: <Gift className="w-4 h-4" />,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      name: "DNS 查询工具",
      description: "查询域名解析记录，支持多种记录类型",
      href: "/dns-lookup",
      icon: <Network className="w-4 h-4" />,
      color: "bg-cyan-100 text-cyan-600",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      {/* 主要内容区域 */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto p-6">
          <header className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">在线工具箱</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              免费、快速、易用的在线工具集合，无需安装，即开即用，提高您的工作效率
            </p>
            <div className="mt-2 text-sm text-gray-500">由 V0.dev 自动生成</div>
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

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span>by v0.dev</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-600">
              <span>© 2024 在线工具箱</span>
              <div className="flex items-center gap-4">
                <a
                  href="https://github.com/lixiaofei123/toolbox_web"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-gray-900 transition-colors"
                >
                  <Github className="w-4 h-4" />
                  <span>GitHub</span>
                </a>
              </div>
              <div className="flex items-center gap-4">
                <a
                  href="https://cnb.cool/xiaofei/toolbox_web"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-gray-900 transition-colors"
                >
                  <img
                    src="https://docs.cnb.cool/images/logo/svg/LogoMonochromeIcon.svg"
                    className="w-4 h-4"
                    alt="CNB"
                  />
                  <span>CNB</span>
                </a>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 text-center text-xs text-gray-500">
            <p>本工具箱完全在浏览器本地运行，不会上传或存储您的任何数据，保护您的隐私安全</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
