"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Copy, LinkIcon, ArrowLeft, Home, CheckCircle, RotateCcw, Globe, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function UrlEncoder() {
  const [leftText, setLeftText] = useState("")
  const [rightText, setRightText] = useState("")
  const [error, setError] = useState("")
  const [copied, setCopied] = useState("")
  const [showUrlChoice, setShowUrlChoice] = useState(false)
  const [detectedUrl, setDetectedUrl] = useState("")
  const { toast } = useToast()

  // 检测是否为URL格式
  const isUrl = (text: string): boolean => {
    try {
      const url = new URL(text)
      return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
      return false
    }
  }

  // 智能编码URL参数部分
  const encodeUrlParams = (urlString: string): string => {
    try {
      const url = new URL(urlString)
      const searchParams = new URLSearchParams(url.search)
      
      // 对每个参数值进行编码
      for (const [key, value] of searchParams.entries()) {
        if (value) {
          searchParams.set(key, value)
        }
      }
      
      // 重新构建URL
      url.search = searchParams.toString()
      return url.toString()
    } catch (err) {
      throw new Error("URL参数编码失败")
    }
  }

  // 编码整个URL
  const encodeFullUrl = (urlString: string): string => {
    return encodeURIComponent(urlString)
  }

  const encodeUrl = () => {
    if (!leftText.trim()) {
      setError("请输入要编码的文本")
      return
    }

    // 检测是否为URL
    if (isUrl(leftText.trim())) {
      setDetectedUrl(leftText.trim())
      setShowUrlChoice(true)
      return
    }

    // 普通文本编码
    try {
      const encoded = encodeURIComponent(leftText)
      setRightText(encoded)
      setError("")
      toast({
        title: "编码成功",
        description: "文本已成功进行URL编码",
      })
    } catch (err) {
      setError("编码失败")
    }
  }

  // 处理URL编码选择
  const handleUrlEncodingChoice = (encodeParamsOnly: boolean) => {
    try {
      let result: string
      if (encodeParamsOnly) {
        result = encodeUrlParams(detectedUrl)
        toast({
          title: "参数编码成功",
          description: "URL参数部分已成功编码",
        })
      } else {
        result = encodeFullUrl(detectedUrl)
        toast({
          title: "完整编码成功",
          description: "整个URL已成功编码",
        })
      }
      
      setRightText(result)
      setError("")
      setShowUrlChoice(false)
      setDetectedUrl("")
    } catch (err) {
      setError("URL编码失败")
      setShowUrlChoice(false)
      setDetectedUrl("")
    }
  }

  const decodeUrl = () => {
    if (!rightText.trim()) {
      setError("请输入要解码的文本")
      return
    }

    try {
      const decoded = decodeURIComponent(rightText)
      setLeftText(decoded)
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
    setLeftText("")
    setRightText("")
    setError("")
    setCopied("")
    setShowUrlChoice(false)
    setDetectedUrl("")
  }

  const loadSample = () => {
    const sample = "https://example.com/search?q=你好世界&type=文档&page=1"
    setLeftText(sample)
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
              <h1 className="text-2xl font-bold text-gray-900">URL 编解码</h1>
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

          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="w-5 h-5" />
                  输入文本
                </CardTitle>
                <CardDescription>输入需要进行URL编码的文本，或显示解码后的结果</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="left-text">文本内容</Label>
                  <Textarea
                    id="left-text"
                    placeholder="输入要编码的文本或URL..."
                    value={leftText}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setLeftText(e.target.value)}
                    className="min-h-[200px] font-mono text-sm"
                  />
                </div>
                <div className="flex gap-2">
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
                  输出文本
                </CardTitle>
                <CardDescription>显示编码后的结果，或输入需要解码的URL编码文本</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="right-text">文本内容</Label>
                  <Textarea
                    id="right-text"
                    placeholder="编码后的文本将在这里显示，或输入要解码的URL编码文本..."
                    value={rightText}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRightText(e.target.value)}
                    className="min-h-[200px] font-mono text-sm"
                  />
                </div>
                {rightText && (
                  <Button
                    onClick={() => copyToClipboard(rightText, "输出文本")}
                    className="w-full"
                    variant="outline"
                  >
                    {copied === "输出文本" ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        已复制
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        复制文本
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-center gap-4 mb-6">
            <Button onClick={encodeUrl} size="lg" className="px-8">
              <LinkIcon className="w-5 h-5 mr-2" />
              URL 编码
            </Button>
            <Button onClick={decodeUrl} size="lg" variant="outline" className="px-8">
              <RotateCcw className="w-5 h-5 mr-2" />
              URL 解码
            </Button>
          </div>

          {/* URL编码选择弹窗 */}
          <Dialog open={showUrlChoice} onOpenChange={setShowUrlChoice}>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle>检测到URL地址</DialogTitle>
                <DialogDescription>
                  请选择编码方式
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-3">
                <Button 
                  onClick={() => handleUrlEncodingChoice(true)}
                  className="w-full"
                  variant="outline"
                >
                  只编码参数部分
                </Button>
                
                <Button 
                  onClick={() => handleUrlEncodingChoice(false)}
                  className="w-full"
                >
                  编码整个URL
                </Button>
              </div>
            </DialogContent>
          </Dialog>

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
                    <li>• 在左侧文本框输入原始文本</li>
                    <li>• 点击"URL编码"按钮</li>
                    <li>• 如果输入的是URL，可选择编码方式：</li>
                    <li>  - 只编码参数部分：保持URL结构</li>
                    <li>  - 编码整个URL：完整编码</li>
                    <li>• 编码结果将显示在右侧文本框</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">URL解码</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 在右侧文本框输入URL编码文本</li>
                    <li>• 点击"URL解码"按钮</li>
                    <li>• 解码结果将显示在左侧文本框</li>
                    <li>• 将%编码格式还原为原始字符</li>
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
