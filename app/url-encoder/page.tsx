"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, LinkIcon, ArrowLeft, Home, CheckCircle, RotateCcw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function UrlEncoder() {
  const [originalText, setOriginalText] = useState("")
  const [encodedText, setEncodedText] = useState("")
  const [decodedText, setDecodedText] = useState("")
  const [error, setError] = useState("")
  const [copied, setCopied] = useState("")
  const { toast } = useToast()

  const encodeUrl = () => {
    if (!originalText.trim()) {
      setError("请输入要编码的文本")
      return
    }

    try {
      const encoded = encodeURIComponent(originalText)
      setEncodedText(encoded)
      setError("")
      toast({
        title: "编码成功",
        description: "文本已成功进行URL编码",
      })
    } catch (err) {
      setError("编码失败")
    }
  }

  const decodeUrl = () => {
    if (!originalText.trim()) {
      setError("请输入要解码的文本")
      return
    }

    try {
      const decoded = decodeURIComponent(originalText)
      setDecodedText(decoded)
      setError("")
      toast({
        title: "解码成功",
        description: "文本已成功进行URL解码",
      })
    } catch (err) {
      setError("解码失败，请检查输入的URL编码格式")
    }
  }

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(""), 2000)
      toast({
        title: "复制成功",
        description: `${type}已复制到剪贴板`,
      })
    } catch (err) {
      toast({
        title: "复制失败",
        description: "请手动选择并复制文本",
        variant: "destructive",
      })
    }
  }

  const clearAll = () => {
    setOriginalText("")
    setEncodedText("")
    setDecodedText("")
    setError("")
    setCopied("")
  }

  const loadSample = () => {
    const sample = "https://example.com/search?q=你好世界&type=文档&page=1"
    setOriginalText(sample)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回首页
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">URL 编码解码</h1>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm">
                <Home className="w-4 h-4 mr-2" />
                工具箱
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-gray-600">URL编码解码工具，处理特殊字符和中文</p>
          </div>

          <Tabs defaultValue="encode" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="encode" className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4" />
                URL 编码
              </TabsTrigger>
              <TabsTrigger value="decode" className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                URL 解码
              </TabsTrigger>
            </TabsList>

            <TabsContent value="encode">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LinkIcon className="w-5 h-5" />
                      原始文本
                    </CardTitle>
                    <CardDescription>输入需要进行URL编码的文本</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="original-text">原始文本</Label>
                      <Textarea
                        id="original-text"
                        placeholder="输入要编码的文本或URL..."
                        value={originalText}
                        onChange={(e) => setOriginalText(e.target.value)}
                        className="min-h-[200px] font-mono text-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={encodeUrl} className="flex-1">
                        开始编码
                      </Button>
                      <Button onClick={loadSample} variant="outline">
                        示例
                      </Button>
                      <Button onClick={clearAll} variant="outline">
                        清空
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      编码结果
                    </CardTitle>
                    <CardDescription>URL编码后的文本</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {encodedText ? (
                      <>
                        <div>
                          <Label htmlFor="encoded-text">编码后的文本</Label>
                          <Textarea
                            id="encoded-text"
                            value={encodedText}
                            readOnly
                            className="min-h-[200px] font-mono text-sm"
                          />
                        </div>
                        <Button
                          onClick={() => copyToClipboard(encodedText, "编码结果")}
                          className="w-full"
                          variant="outline"
                        >
                          {copied === "编码结果" ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              已复制
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 mr-2" />
                              复制编码结果
                            </>
                          )}
                        </Button>
                      </>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500 min-h-[200px] flex items-center justify-center">
                        <div>
                          <LinkIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                          <p>编码后的文本将在这里显示</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="decode">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <RotateCcw className="w-5 h-5" />
                      编码文本
                    </CardTitle>
                    <CardDescription>输入需要解码的URL编码文本</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="decode-text">编码文本</Label>
                      <Textarea
                        id="decode-text"
                        placeholder="输入要解码的URL编码文本..."
                        value={originalText}
                        onChange={(e) => setOriginalText(e.target.value)}
                        className="min-h-[200px] font-mono text-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={decodeUrl} className="flex-1">
                        开始解码
                      </Button>
                      <Button onClick={clearAll} variant="outline">
                        清空
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      解码结果
                    </CardTitle>
                    <CardDescription>URL解码后的文本</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {decodedText ? (
                      <>
                        <div>
                          <Label htmlFor="decoded-text">解码后的文本</Label>
                          <Textarea
                            id="decoded-text"
                            value={decodedText}
                            readOnly
                            className="min-h-[200px] font-mono text-sm"
                          />
                        </div>
                        <Button
                          onClick={() => copyToClipboard(decodedText, "解码结果")}
                          className="w-full"
                          variant="outline"
                        >
                          {copied === "解码结果" ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              已复制
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 mr-2" />
                              复制解码结果
                            </>
                          )}
                        </Button>
                      </>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500 min-h-[200px] flex items-center justify-center">
                        <div>
                          <RotateCcw className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                          <p>解码后的文本将在这里显示</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {error && (
            <Alert className="mt-6" variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* 使用说明 */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>使用说明</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">URL编码</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 将特殊字符转换为%编码格式</li>
                    <li>• 处理中文和其他Unicode字符</li>
                    <li>• 适用于URL参数和查询字符串</li>
                    <li>• 确保URL的正确传输</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">URL解码</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 将%编码格式还原为原始字符</li>
                    <li>• 恢复中文和特殊字符</li>
                    <li>• 解析URL参数值</li>
                    <li>• 提高URL可读性</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
