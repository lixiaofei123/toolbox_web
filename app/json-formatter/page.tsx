"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Copy, Code, ArrowLeft, Home, CheckCircle, AlertCircle, FileText, Minimize2, Maximize2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function JsonFormatter() {
  const [jsonInput, setJsonInput] = useState("")
  const [formattedJson, setFormattedJson] = useState("")
  const [minifiedJson, setMinifiedJson] = useState("")
  const [error, setError] = useState("")
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [jsonStats, setJsonStats] = useState({
    keys: 0,
    values: 0,
    objects: 0,
    arrays: 0,
    size: 0,
  })
  const [copied, setCopied] = useState<string>("")
  const { toast } = useToast()

  const analyzeJson = (obj: any, stats = { keys: 0, values: 0, objects: 0, arrays: 0 }) => {
    if (Array.isArray(obj)) {
      stats.arrays++
      obj.forEach((item) => analyzeJson(item, stats))
    } else if (obj !== null && typeof obj === "object") {
      stats.objects++
      Object.keys(obj).forEach((key) => {
        stats.keys++
        stats.values++
        analyzeJson(obj[key], stats)
      })
    } else {
      stats.values++
    }
    return stats
  }

  const validateAndFormat = () => {
    if (!jsonInput.trim()) {
      setError("请输入JSON字符串")
      setIsValid(null)
      return
    }

    try {
      const parsed = JSON.parse(jsonInput)
      const formatted = JSON.stringify(parsed, null, 2)
      const minified = JSON.stringify(parsed)

      setFormattedJson(formatted)
      setMinifiedJson(minified)
      setError("")
      setIsValid(true)

      // 分析JSON结构
      const stats = analyzeJson(parsed)
      setJsonStats({
        ...stats,
        size: new Blob([jsonInput]).size,
      })

      toast({
        title: "验证成功",
        description: "JSON格式正确，已完成格式化",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "JSON格式错误")
      setIsValid(false)
      setFormattedJson("")
      setMinifiedJson("")
      setJsonStats({ keys: 0, values: 0, objects: 0, arrays: 0, size: 0 })
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
    setJsonInput("")
    setFormattedJson("")
    setMinifiedJson("")
    setError("")
    setIsValid(null)
    setJsonStats({ keys: 0, values: 0, objects: 0, arrays: 0, size: 0 })
    setCopied("")
  }

  const loadSampleJson = () => {
    const sample = {
      name: "示例数据",
      version: "1.0.0",
      users: [
        {
          id: 1,
          name: "张三",
          email: "zhangsan@example.com",
          active: true,
          profile: {
            age: 28,
            city: "北京",
            hobbies: ["阅读", "旅行", "编程"],
          },
        },
        {
          id: 2,
          name: "李四",
          email: "lisi@example.com",
          active: false,
          profile: {
            age: 32,
            city: "上海",
            hobbies: ["音乐", "运动"],
          },
        },
      ],
      settings: {
        theme: "dark",
        language: "zh-CN",
        notifications: true,
      },
    }
    setJsonInput(JSON.stringify(sample))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
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
              <h1 className="text-2xl font-bold text-gray-900">JSON 格式化</h1>
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
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-gray-600">JSON代码美化、压缩、格式验证和错误检查</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* 输入区域 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  JSON 输入
                </CardTitle>
                <CardDescription>粘贴或输入您的JSON代码</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="json-input">JSON 代码</Label>
                  <Textarea
                    id="json-input"
                    placeholder="在这里粘贴您的JSON代码..."
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    className="min-h-[300px] font-mono text-sm"
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={validateAndFormat} className="flex-1">
                    <Code className="w-4 h-4 mr-2" />
                    验证并格式化
                  </Button>
                  <Button onClick={loadSampleJson} variant="outline">
                    示例
                  </Button>
                  <Button onClick={clearAll} variant="outline">
                    清空
                  </Button>
                </div>

                {/* 验证状态 */}
                {isValid !== null && (
                  <div className="flex items-center gap-2">
                    {isValid ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          JSON 格式正确
                        </Badge>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <Badge variant="destructive">JSON 格式错误</Badge>
                      </>
                    )}
                  </div>
                )}

                {/* JSON 统计信息 */}
                {isValid && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">键数量:</span>
                        <span className="font-mono">{jsonStats.keys}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">值数量:</span>
                        <span className="font-mono">{jsonStats.values}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">对象数:</span>
                        <span className="font-mono">{jsonStats.objects}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">数组数:</span>
                        <span className="font-mono">{jsonStats.arrays}</span>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">文件大小:</span>
                        <span className="font-mono">{jsonStats.size} 字节</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 输出区域 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  格式化结果
                </CardTitle>
                <CardDescription>美化后的JSON代码</CardDescription>
              </CardHeader>
              <CardContent>
                {formattedJson ? (
                  <Tabs defaultValue="formatted" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="formatted" className="flex items-center gap-2">
                        <Maximize2 className="w-4 h-4" />
                        美化格式
                      </TabsTrigger>
                      <TabsTrigger value="minified" className="flex items-center gap-2">
                        <Minimize2 className="w-4 h-4" />
                        压缩格式
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="formatted" className="space-y-4">
                      <div>
                        <Label htmlFor="formatted-output">美化后的 JSON</Label>
                        <Textarea
                          id="formatted-output"
                          value={formattedJson}
                          readOnly
                          className="min-h-[300px] font-mono text-sm"
                        />
                      </div>
                      <Button
                        onClick={() => copyToClipboard(formattedJson, "美化格式")}
                        className="w-full"
                        variant="outline"
                      >
                        {copied === "美化格式" ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            已复制
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            复制美化格式
                          </>
                        )}
                      </Button>
                    </TabsContent>

                    <TabsContent value="minified" className="space-y-4">
                      <div>
                        <Label htmlFor="minified-output">压缩后的 JSON</Label>
                        <Textarea
                          id="minified-output"
                          value={minifiedJson}
                          readOnly
                          className="min-h-[300px] font-mono text-sm"
                        />
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        <p>压缩后大小: {new Blob([minifiedJson]).size} 字节</p>
                        <p>
                          节省空间:{" "}
                          {(((jsonStats.size - new Blob([minifiedJson]).size) / jsonStats.size) * 100).toFixed(1)}%
                        </p>
                      </div>
                      <Button
                        onClick={() => copyToClipboard(minifiedJson, "压缩格式")}
                        className="w-full"
                        variant="outline"
                      >
                        {copied === "压缩格式" ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            已复制
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            复制压缩格式
                          </>
                        )}
                      </Button>
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500 min-h-[300px] flex items-center justify-center">
                    <div>
                      <Code className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p>格式化后的JSON将在这里显示</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {error && (
            <Alert className="mt-6" variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                <strong>JSON 格式错误:</strong> {error}
              </AlertDescription>
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
                  <h3 className="font-semibold mb-2">主要功能</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• JSON 格式验证和错误检查</li>
                    <li>• 代码美化，增强可读性</li>
                    <li>• 代码压缩，减少文件大小</li>
                    <li>• 统计JSON结构信息</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">使用技巧</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 支持复杂嵌套的JSON结构</li>
                    <li>• 自动检测并报告语法错误</li>
                    <li>• 一键复制格式化结果</li>
                    <li>• 显示压缩前后的大小对比</li>
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
