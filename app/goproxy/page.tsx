"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, Check, Terminal, Settings, AlertTriangle } from "lucide-react"

export default function GoProxyPage() {
  const [goproxyUrl, setGoproxyUrl] = useState("")
  const [copied, setCopied] = useState("")

  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentUrl = window.location.origin
      setGoproxyUrl(`${currentUrl}/goproxy`)
    }
  }, [])

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(""), 2000)
    } catch (err) {
      console.error("复制失败:", err)
    }
  }

  const linuxCommand = `export GOPROXY=${goproxyUrl},direct`
  const windowsCommand = `$env:GOPROXY = "${goproxyUrl},direct"`

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      {/* 顶部导航 */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-gray-900 hover:text-blue-600 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">工具</span>
              </div>
              <span className="font-semibold">在线工具箱</span>
            </Link>
            <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
              返回首页
            </Link>
          </div>
        </div>
      </nav>

      {/* 主要内容区域 */}
      <div className="flex-1">
        <div className="max-w-4xl mx-auto p-6">
          <header className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">GOPROXY 代理</h1>
            <p className="text-gray-600">为 Go 模块提供代理服务，加速依赖下载</p>
          </header>

          <div className="space-y-6">
            {/* 代理地址显示 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  代理地址
                </CardTitle>
                <CardDescription>当前工具的 GOPROXY 代理地址</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <code className="text-lg font-mono text-blue-600 break-all">{goproxyUrl || "正在获取地址..."}</code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(goproxyUrl, "url")}
                      className="ml-2 flex-shrink-0"
                    >
                      {copied === "url" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>重要提示：</strong>此代理服务只有在工具部署到 EdgeOne Pages 上时才能正常使用。
                    如果您在其他平台使用，代理功能可能无法正常工作。访问<a href="https://github.com/lixiaofei123/toolbox_web" target="blank">https://github.com/lixiaofei123/toolbox_web</a>查看如何部署 
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* 使用方法 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="w-5 h-5" />
                  使用方法
                </CardTitle>
                <CardDescription>在不同操作系统中配置 GOPROXY 环境变量</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Linux/macOS */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary">Linux/macOS</Badge>
                    <span className="text-sm text-gray-600">配置方法</span>
                  </div>

                  {/* 临时设置 */}
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">临时设置（当前终端会话有效）</h5>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <code className="text-green-400 font-mono text-sm break-all">{linuxCommand}</code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(linuxCommand, "linux")}
                          className="ml-2 flex-shrink-0"
                        >
                          {copied === "linux" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* 永久设置 */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">永久设置（推荐）</h5>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">1. 添加到配置文件</p>
                        <div className="bg-gray-900 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <code className="text-green-400 font-mono text-sm break-all">
                              {'echo "export GOPROXY=' + goproxyUrl + ',direct" >> ~/.profile'}
                            </code>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                copyToClipboard(`echo "export GOPROXY=${goproxyUrl},direct" >> ~/.profile`, "profile")
                              }
                              className="ml-2 flex-shrink-0"
                            >
                              {copied === "profile" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 mb-1">2. 重新加载配置</p>
                        <div className="bg-gray-900 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <code className="text-green-400 font-mono text-sm">source ~/.profile</code>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard("source ~/.profile", "source")}
                              className="ml-2 flex-shrink-0"
                            >
                              {copied === "source" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-700">
                        <strong>提示：</strong>您也可以将配置添加到 ~/.bashrc（Bash）或 ~/.zshrc（Zsh）文件中，
                        然后执行相应的 <code>source ~/.bashrc</code> 或 <code>source ~/.zshrc</code> 命令。
                      </p>
                    </div>
                  </div>
                </div>

                {/* Windows */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary">Windows</Badge>
                    <span className="text-sm text-gray-600">PowerShell 临时设置</span>
                  </div>
                  <div className="bg-blue-900 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <code className="text-blue-200 font-mono text-sm break-all">{windowsCommand}</code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(windowsCommand, "windows")}
                        className="ml-2 flex-shrink-0"
                      >
                        {copied === "windows" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    或者通过系统设置 → 高级系统设置 → 环境变量，添加名为{" "}
                    <code className="bg-gray-100 px-1 rounded">GOPROXY</code> 的环境变量，值为{" "}
                    <code className="bg-gray-100 px-1 rounded">{goproxyUrl},direct</code>。
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 验证配置 */}
            <Card>
              <CardHeader>
                <CardTitle>验证配置</CardTitle>
                <CardDescription>确认 GOPROXY 配置是否生效</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <code className="text-green-400 font-mono text-sm">go env GOPROXY</code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard("go env GOPROXY", "verify")}
                      className="ml-2 flex-shrink-0"
                    >
                      {copied === "verify" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">执行此命令应该显示您配置的 GOPROXY 地址。</p>
              </CardContent>
            </Card>

            {/* 使用说明 */}
            <Card>
              <CardHeader>
                <CardTitle>关于 GOPROXY</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">什么是 GOPROXY？</h4>
                  <p className="text-sm text-gray-600">
                    GOPROXY 是 Go 模块代理服务，用于加速 Go
                    依赖包的下载。通过配置代理，可以提高模块下载速度并提供更好的稳定性。
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">direct 的作用</h4>
                  <p className="text-sm text-gray-600">
                    在代理地址后添加 ",direct" 表示当代理无法获取模块时，会直接从源地址下载，确保下载的可靠性。
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">注意事项</h4>
                  <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                    <li>此代理服务仅在 EdgeOne Pages 部署环境下可用</li>
                    <li>建议在企业网络环境中使用以提高下载速度</li>
                    <li>如遇到问题，可以临时移除 GOPROXY 配置使用默认设置</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
