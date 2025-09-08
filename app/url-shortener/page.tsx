"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Copy, Link2, Trash2, CheckCircle, ArrowLeft, Home, Plus, ExternalLink, Sparkles, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function UrlShortener() {
  const [originalUrl, setOriginalUrl] = useState("")
  const [password, setPassword] = useState("")
  const [hasIntermediatePage, setHasIntermediatePage] = useState(false)
  const [shortUrl, setShortUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  // 删除短网址相关状态
  const [deletePassword, setDeletePassword] = useState("")
  const [deleteShortUrl, setDeleteShortUrl] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  const { toast } = useToast()

  // 获取当前域名
  const getBasePath = () => {
    if (typeof window !== "undefined") {
      return window.location.origin
    }
    return ""
  }

  // 从完整短网址中提取标识
  const extractKeyFromShortUrl = (shortUrl: string): string | null => {
    try {
      const url = new URL(shortUrl)
      const pathname = url.pathname
      
      // 匹配 /d/ 后面的标识部分
      const match = pathname.match(/^\/d\/([a-zA-Z0-9]+)$/)
      if (match && match[1]) {
        return match[1]
      }
      
      return null
    } catch {
      return null
    }
  }

  // 生成短网址
  const generateShortUrl = async () => {
    setError("")
    setIsLoading(true)

    if (!originalUrl.trim()) {
      setError("请输入要缩短的网址")
      setIsLoading(false)
      return
    }

    if (!password.trim()) {
      setError("请输入密码")
      setIsLoading(false)
      return
    }

    // 验证URL格式
    try {
      new URL(originalUrl)
    } catch {
      setError("请输入有效的网址格式")
      setIsLoading(false)
      return
    }

    try {
      const basePath = getBasePath()
      const response = await fetch(`${basePath}/api/dwz`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: originalUrl,
          password: password,
          length: 8,
          hasIntermediatePage: hasIntermediatePage,
        }),
      })

      if (!response.ok) {
        throw new Error("生成短网址失败")
      }

      const result = await response.json()
      const generatedShortUrl = `${basePath}/d/${result.data}`
      setShortUrl(generatedShortUrl)

      toast({
        title: "生成成功",
        description: "短网址已生成并复制到剪贴板",
      })

      // 自动复制到剪贴板
      await copyToClipboard(generatedShortUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成短网址失败")
    } finally {
      setIsLoading(false)
    }
  }

  // 删除短网址
  const handleDeleteShortUrl = async () => {
    setError("")
    setIsDeleting(true)

    if (!deletePassword.trim()) {
      setError("请输入密码")
      setIsDeleting(false)
      return
    }

    if (!deleteShortUrl.trim()) {
      setError("请输入完整短网址")
      setIsDeleting(false)
      return
    }

    // 从完整短网址中提取标识
    const key = extractKeyFromShortUrl(deleteShortUrl)
    if (!key) {
      setError("无效的短网址格式，请确保输入完整的短网址")
      setIsDeleting(false)
      return
    }

    try {
      const basePath = getBasePath()
      const response = await fetch(`${basePath}/api/dwz`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: deletePassword,
          key: key,
        }),
      })

      if (!response.ok) {
        throw new Error("删除短网址失败")
      }

      toast({
        title: "删除成功",
        description: "短网址已成功删除",
      })

      // 清空表单
      setDeletePassword("")
      setDeleteShortUrl("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除短网址失败")
    } finally {
      setIsDeleting(false)
    }
  }

  // 复制到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: "复制成功",
        description: "短网址已复制到剪贴板",
      })
    } catch (err) {
      toast({
        title: "复制失败",
        description: "请手动选择并复制文本",
        variant: "destructive",
      })
    }
  }

  // 清空表单
  const clearForm = () => {
    setOriginalUrl("")
    setPassword("")
    setHasIntermediatePage(false)
    setShortUrl("")
    setError("")
    setCopied(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-cyan-50">
      <header className="border-b bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="hover:bg-violet-100">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回首页
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-violet-500 to-blue-600 rounded-lg">
                  <Link2 className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                  短网址生成器
                </h1>
              </div>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm" className="hover:bg-violet-50 border-violet-200 bg-transparent">
                <Home className="w-4 h-4 mr-2" />
                工具箱
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-violet-200 mb-4">
              <Sparkles className="w-4 h-4 text-violet-500" />
              <span className="text-sm font-medium text-violet-700">智能短网址服务</span>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              快速生成和管理短网址，支持API密码验证和中间页设置，让您的链接更简洁、更安全
            </p>
          </div>

          <Tabs defaultValue="generate" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/60 backdrop-blur-sm border border-violet-200">
              <TabsTrigger
                value="generate"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-blue-500 data-[state=active]:text-white"
              >
                <Plus className="w-4 h-4" />
                生成短网址
              </TabsTrigger>
              <TabsTrigger
                value="delete"
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
              >
                <Trash2 className="w-4 h-4" />
                删除短网址
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generate">
              <div className="grid lg:grid-cols-2 gap-8">
                <Card className="bg-white/80 backdrop-blur-sm border-violet-200 shadow-xl shadow-violet-100/50">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-2 bg-gradient-to-br from-violet-500 to-blue-600 rounded-lg">
                        <Link2 className="w-5 h-5 text-white" />
                      </div>
                      生成短网址
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      输入原始网址和设置参数，快速生成专属短链接
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="original-url" className="text-sm font-medium text-gray-700">
                        原始网址
                      </Label>
                      <Input
                        id="original-url"
                        type="url"
                        placeholder="https://example.com/very/long/url"
                        value={originalUrl}
                        onChange={(e) => setOriginalUrl(e.target.value)}
                        className="border-violet-200 focus:border-violet-400 focus:ring-violet-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-violet-500" />
                        API 验证密码
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="用于后台API验证的密码"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border-violet-200 focus:border-violet-400 focus:ring-violet-400"
                      />
                      <p className="text-xs text-gray-500">此密码用于API调用时的后台验证，不是访问密码</p>
                    </div>
                    <div className="flex items-center space-x-3 p-4 bg-violet-50 rounded-lg border border-violet-200">
                      <Switch
                        id="intermediate-page"
                        checked={hasIntermediatePage}
                        onCheckedChange={setHasIntermediatePage}
                        className="data-[state=checked]:bg-violet-500"
                      />
                      <div>
                        <Label htmlFor="intermediate-page" className="text-sm font-medium text-gray-700">
                          启用中间页
                        </Label>
                        <p className="text-xs text-gray-500">在跳转前显示中间确认页面</p>
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Button
                        onClick={generateShortUrl}
                        className="flex-1 bg-gradient-to-r from-violet-500 to-blue-600 hover:from-violet-600 hover:to-blue-700 shadow-lg"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            生成中...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            生成短网址
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={clearForm}
                        className="border-violet-200 hover:bg-violet-50 bg-transparent"
                      >
                        清空
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-violet-200 shadow-xl shadow-violet-100/50">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      生成结果
                    </CardTitle>
                    <CardDescription className="text-gray-600">您的专属短网址已准备就绪</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {shortUrl ? (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="short-url" className="text-sm font-medium text-gray-700">
                            短网址
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              id="short-url"
                              value={shortUrl}
                              readOnly
                              className="font-mono bg-green-50 border-green-200 text-green-800"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => copyToClipboard(shortUrl)}
                              className="border-green-200 hover:bg-green-50"
                            >
                              {copied ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <Copy className="w-4 h-4 text-green-600" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            variant="outline"
                            onClick={() => window.open(shortUrl, "_blank")}
                            className="border-blue-200 hover:bg-blue-50 text-blue-700"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            测试访问
                          </Button>
                          <Button
                            onClick={() => copyToClipboard(shortUrl)}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                          >
                            {copied ? (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                已复制
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4 mr-2" />
                                复制链接
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-violet-300 rounded-xl p-12 text-center bg-gradient-to-br from-violet-50 to-blue-50">
                        <div className="space-y-4">
                          <div className="p-4 bg-white/60 backdrop-blur-sm rounded-full w-fit mx-auto">
                            <Link2 className="w-8 h-8 text-violet-400" />
                          </div>
                          <div>
                            <p className="text-gray-600 font-medium">生成的短网址将在这里显示</p>
                            <p className="text-sm text-gray-500 mt-1">填写左侧表单开始生成</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="delete">
              <div className="max-w-2xl mx-auto">
                <Card className="bg-white/80 backdrop-blur-sm border-red-200 shadow-xl shadow-red-100/50">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-2 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg">
                        <Trash2 className="w-5 h-5 text-white" />
                      </div>
                      删除短网址
                    </CardTitle>
                    <CardDescription className="text-gray-600">输入API验证密码和完整短网址来删除短网址</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="delete-password"
                        className="text-sm font-medium text-gray-700 flex items-center gap-2"
                      >
                        <Shield className="w-4 h-4 text-red-500" />
                        API 验证密码
                      </Label>
                      <Input
                        id="delete-password"
                        type="password"
                        placeholder="输入创建时设置的API验证密码"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        className="border-red-200 focus:border-red-400 focus:ring-red-400"
                      />
                      <p className="text-xs text-gray-500">此密码用于API调用时的后台验证</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="delete-short-url" className="text-sm font-medium text-gray-700">
                        完整短网址
                      </Label>
                      <Input
                        id="delete-short-url"
                        type="url"
                        placeholder="例如：https://example.com/d/4UuEh6Uf"
                        value={deleteShortUrl}
                        onChange={(e) => setDeleteShortUrl(e.target.value)}
                        className="border-red-200 focus:border-red-400 focus:ring-red-400"
                      />
                      <p className="text-xs text-gray-500">输入完整的短网址，系统会自动提取标识</p>
                    </div>
                    <Button
                      onClick={handleDeleteShortUrl}
                      className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 shadow-lg"
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          删除中...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-2" />
                          删除短网址
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {error && (
            <Alert className="mt-8 border-red-200 bg-red-50" variant="destructive">
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/60 backdrop-blur-sm rounded-full border border-gray-200">
              <span className="text-sm text-gray-600">
                感谢{" "}
                <a
                  href="https://github.com/aihttp/eodwz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-600 hover:text-violet-800 underline font-medium"
                >
                  aihttp/eodwz
                </a>{" "}
                提供的灵感
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
