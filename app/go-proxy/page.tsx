"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, Check, Terminal, Settings, AlertTriangle, ArrowLeft, Package } from "lucide-react"

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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* 顶部导航 */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-3 text-gray-900 hover:text-green-600 transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center shadow-lg">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-lg">GOPROXY 代理</span>
                <div className="text-xs text-gray-500">在线工具箱</div>
              </div>
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>返回首页</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* 主要内容区域 */}
      <div className="flex-1">
        <div className="max-w-5xl mx-auto p-6">
          {/* 页面头部 */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl shadow-xl mb-6">
              <Package className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">GOPROXY 代理服务</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              为 Go 模块提供高速代理服务，显著提升依赖包下载速度，优化开发体验
            </p>
          </div>

          <div className="space-y-8">
            {/* 代理地址显示 */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-green-600" />
                  </div>
                  代理地址
                </CardTitle>
                <CardDescription className="text-base text-gray-600">
                  当前工具的 GOPROXY 代理地址，复制后即可使用
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="relative">
                  <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 shadow-inner">
                    <div className="flex items-center justify-between gap-4">
                      <code className="text-lg font-mono text-green-400 break-all flex-1 leading-relaxed">
                        {goproxyUrl || "正在获取地址..."}
                      </code>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => copyToClipboard(goproxyUrl, "url")}
                        className="flex-shrink-0 bg-green-600 hover:bg-green-700 text-white border-0 shadow-lg transition-all duration-200"
                      >
                        {copied === "url" ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            已复制
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            复制
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <Alert className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 shadow-sm">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <AlertDescription className="text-amber-800 leading-relaxed">
                    <strong className="font-semibold">重要提示：</strong>此代理服务只有在工具部署到 EdgeOne Pages
                    上时才能正常使用。 如果您在其他平台使用，代理功能可能无法正常工作。
                    <a
                      href="https://github.com/lixiaofei123/toolbox_web"
                      target="_blank"
                      className="inline-flex items-center gap-1 ml-2 text-amber-700 hover:text-amber-900 underline font-medium"
                      rel="noreferrer"
                    >
                      查看部署指南
                    </a>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* 使用方法 */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Terminal className="w-5 h-5 text-blue-600" />
                  </div>
                  配置方法
                </CardTitle>
                <CardDescription className="text-base text-gray-600">
                  在不同操作系统中配置 GOPROXY 环境变量
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Linux/macOS */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-green-100 text-green-700 px-3 py-1 text-sm font-medium">
                      Linux/macOS
                    </Badge>
                    <span className="text-gray-600">推荐配置方法</span>
                  </div>

                  {/* 临时设置 */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <h5 className="font-semibold text-gray-800">临时设置（当前终端会话有效）</h5>
                    </div>
                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-5 shadow-lg">
                      <div className="flex items-center justify-between gap-4">
                        <code className="text-green-400 font-mono text-sm break-all flex-1 leading-relaxed">
                          {linuxCommand}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(linuxCommand, "linux")}
                          className="flex-shrink-0 bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
                        >
                          {copied === "linux" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* 永久设置 */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <h5 className="font-semibold text-gray-800">永久设置（推荐方法）</h5>
                    </div>
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">
                            1
                          </div>
                          <p className="text-sm font-medium text-gray-700">添加到配置文件</p>
                        </div>
                        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-5 shadow-lg">
                          <div className="flex items-center justify-between gap-4">
                            <code className="text-green-400 font-mono text-sm break-all flex-1 leading-relaxed">
                              {'echo "export GOPROXY=' + goproxyUrl + ',direct" >> ~/.profile'}
                            </code>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                copyToClipboard(`echo "export GOPROXY=${goproxyUrl},direct" >> ~/.profile`, "profile")
                              }
                              className="flex-shrink-0 bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
                            >
                              {copied === "profile" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">
                            2
                          </div>
                          <p className="text-sm font-medium text-gray-700">重新加载配置</p>
                        </div>
                        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-5 shadow-lg">
                          <div className="flex items-center justify-between gap-4">
                            <code className="text-green-400 font-mono text-sm flex-1">source ~/.profile</code>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard("source ~/.profile", "source")}
                              className="flex-shrink-0 bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
                            >
                              {copied === "source" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                      <p className="text-sm text-blue-800 leading-relaxed">
                        <strong className="font-semibold">💡 小贴士：</strong>您也可以将配置添加到
                        <code className="bg-blue-100 px-2 py-1 rounded mx-1 font-mono">~/.bashrc</code>（Bash）或
                        <code className="bg-blue-100 px-2 py-1 rounded mx-1 font-mono">~/.zshrc</code>（Zsh）文件中，
                        然后执行相应的 <code className="bg-blue-100 px-2 py-1 rounded mx-1 font-mono">source</code>{" "}
                        命令。
                      </p>
                    </div>
                  </div>
                </div>

                {/* Windows */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 px-3 py-1 text-sm font-medium">
                      Windows
                    </Badge>
                    <span className="text-gray-600">PowerShell 配置方法</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <h5 className="font-semibold text-gray-800">临时设置</h5>
                    </div>
                    <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-xl p-5 shadow-lg">
                      <div className="flex items-center justify-between gap-4">
                        <code className="text-blue-200 font-mono text-sm break-all flex-1 leading-relaxed">
                          {windowsCommand}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(windowsCommand, "windows")}
                          className="flex-shrink-0 bg-blue-800 border-blue-600 text-blue-200 hover:bg-blue-700 hover:text-white transition-all duration-200"
                        >
                          {copied === "windows" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-200">
                      <p className="text-sm text-purple-800 leading-relaxed">
                        <strong className="font-semibold">🔧 永久设置：</strong>通过系统设置 → 高级系统设置 → 环境变量，
                        添加名为 <code className="bg-purple-100 px-2 py-1 rounded mx-1 font-mono">GOPROXY</code>{" "}
                        的环境变量， 值为{" "}
                        <code className="bg-purple-100 px-2 py-1 rounded mx-1 font-mono">{goproxyUrl},direct</code>。
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 验证配置 */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Check className="w-5 h-5 text-purple-600" />
                  </div>
                  验证配置
                </CardTitle>
                <CardDescription className="text-base text-gray-600">确认 GOPROXY 配置是否生效</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-5 shadow-lg">
                  <div className="flex items-center justify-between gap-4">
                    <code className="text-green-400 font-mono text-sm flex-1">go env GOPROXY</code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard("go env GOPROXY", "verify")}
                      className="flex-shrink-0 bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
                    >
                      {copied === "verify" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                  执行此命令应该显示您配置的 GOPROXY 地址，确认配置成功。
                </p>
              </CardContent>
            </Card>

            {/* 使用说明 */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">关于 GOPROXY</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      什么是 GOPROXY？
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      GOPROXY 是 Go 模块代理服务，用于加速 Go
                      依赖包的下载。通过配置代理，可以显著提高模块下载速度并提供更好的稳定性。
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      direct 的作用
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      在代理地址后添加 ",direct"
                      表示当代理无法获取模块时，会直接从源地址下载，确保下载的可靠性和完整性。
                    </p>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    注意事项
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-2 leading-relaxed">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0"></div>
                      此代理服务仅在 EdgeOne Pages 部署环境下可用
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0"></div>
                      建议在企业网络环境中使用以提高下载速度
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0"></div>
                      如遇到问题，可以临时移除 GOPROXY 配置使用默认设置
                    </li>
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
