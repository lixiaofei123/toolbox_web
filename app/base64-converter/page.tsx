"use client"

import type React from "react"

import { useState, useRef } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, Upload, Download, ImageIcon, FileText, CheckCircle, ArrowLeft, Home, Code } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function Base64Converter() {
  const [base64Input, setBase64Input] = useState("")
  const [imagePreview, setImagePreview] = useState("")
  const [uploadedImage, setUploadedImage] = useState("")
  const [base64Output, setBase64Output] = useState("")
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const [stringInput, setStringInput] = useState("")
  const [stringBase64Output, setStringBase64Output] = useState("")
  const [base64StringInput, setBase64StringInput] = useState("")
  const [decodedStringOutput, setDecodedStringOutput] = useState("")

  // Base64转图片
  const convertBase64ToImage = () => {
    setError("")
    if (!base64Input.trim()) {
      setError("请输入Base64字符串")
      return
    }

    try {
      let base64Data = base64Input.trim()

      // 检查是否已经包含data前缀
      if (!base64Data.startsWith("data:")) {
        // 尝试检测图片格式
        let mimeType = "image/png" // 默认PNG

        // 简单的格式检测
        if (base64Data.startsWith("/9j/")) {
          mimeType = "image/jpeg"
        } else if (base64Data.startsWith("iVBORw0KGgo")) {
          mimeType = "image/png"
        } else if (base64Data.startsWith("R0lGODlh")) {
          mimeType = "image/gif"
        } else if (base64Data.startsWith("UklGR")) {
          mimeType = "image/webp"
        }

        base64Data = `data:${mimeType};base64,${base64Data}`
      }

      // 验证base64格式
      const img = new Image()
      img.onload = () => {
        setImagePreview(base64Data)
        toast({
          title: "转换成功",
          description: "Base64字符串已成功转换为图片",
        })
      }
      img.onerror = () => {
        setError("无效的Base64图片数据")
      }
      img.src = base64Data
    } catch (err) {
      setError("Base64字符串格式错误")
    }
  }

  // 图片转Base64
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("请选择图片文件")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setUploadedImage(result)
      setBase64Output(result)
      setError("")
      toast({
        title: "上传成功",
        description: "图片已成功转换为Base64字符串",
      })
    }
    reader.onerror = () => {
      setError("文件读取失败")
    }
    reader.readAsDataURL(file)
  }

  // 复制到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: "复制成功",
        description: "Base64字符串已复制到剪贴板",
      })
    } catch (err) {
      toast({
        title: "复制失败",
        description: "请手动选择并复制文本",
        variant: "destructive",
      })
    }
  }

  // 下载图片
  const downloadImage = () => {
    if (!imagePreview) return

    const link = document.createElement("a")
    link.href = imagePreview
    link.download = "converted-image.png"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 字符串转Base64
  const encodeStringToBase64 = () => {
    if (!stringInput.trim()) {
      setError("请输入要编码的文本")
      return
    }

    try {
      const encoded = btoa(unescape(encodeURIComponent(stringInput)))
      setStringBase64Output(encoded)
      setError("")
      toast({
        title: "编码成功",
        description: "文本已成功转换为Base64编码",
      })
    } catch (err) {
      setError("文本编码失败")
    }
  }

  // Base64转字符串
  const decodeBase64ToString = () => {
    if (!base64StringInput.trim()) {
      setError("请输入Base64编码")
      return
    }

    try {
      const decoded = decodeURIComponent(escape(atob(base64StringInput.trim())))
      setDecodedStringOutput(decoded)
      setError("")
      toast({
        title: "解码成功",
        description: "Base64编码已成功解码为文本",
      })
    } catch (err) {
      setError("Base64解码失败，请检查输入格式")
    }
  }

  // 清空数据
  const clearData = () => {
    setBase64Input("")
    setImagePreview("")
    setUploadedImage("")
    setBase64Output("")
    setStringInput("")
    setStringBase64Output("")
    setBase64StringInput("")
    setDecodedStringOutput("")
    setError("")
    setCopied(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const loadStringExample = () => {
    const examples = [
      "Hello, World! 你好世界！",
      "这是一个Base64编码示例文本",
      "Base64 encoding example with 中文字符 and symbols: !@#$%^&*()",
      'JSON示例: {"name": "张三", "age": 25, "city": "北京"}',
    ]
    const randomExample = examples[Math.floor(Math.random() * examples.length)]
    setStringInput(randomExample)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
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
              <h1 className="text-2xl font-bold text-gray-900">Base64 图片转换</h1>
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
            <p className="text-gray-600">在线转换Base64字符串和图片，支持多种图片格式</p>
          </div>

          <Tabs defaultValue="base64-to-image" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="base64-to-image" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Base64 转 图片
              </TabsTrigger>
              <TabsTrigger value="image-to-base64" className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                图片 转 Base64
              </TabsTrigger>
              <TabsTrigger value="string-base64" className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                字符串 ⇄ Base64
              </TabsTrigger>
            </TabsList>

            <TabsContent value="base64-to-image">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      输入 Base64 字符串
                    </CardTitle>
                    <CardDescription>支持带data前缀和不带前缀的Base64字符串</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="base64-input">Base64 字符串</Label>
                      <Textarea
                        id="base64-input"
                        placeholder="粘贴您的Base64字符串到这里..."
                        value={base64Input}
                        onChange={(e) => setBase64Input(e.target.value)}
                        className="min-h-[200px] font-mono text-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={convertBase64ToImage} className="flex-1">
                        转换为图片
                      </Button>
                      <Button variant="outline" onClick={clearData}>
                        清空
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="w-5 h-5" />
                      图片预览
                    </CardTitle>
                    <CardDescription>转换后的图片将在这里显示</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {imagePreview ? (
                      <div className="space-y-4">
                        <div className="border rounded-lg p-4 bg-gray-50 flex items-center justify-center min-h-[200px]">
                          <img
                            src={imagePreview || "/placeholder.svg"}
                            alt="转换后的图片"
                            className="max-w-full max-h-[300px] object-contain rounded"
                          />
                        </div>
                        <Button onClick={downloadImage} className="w-full bg-transparent" variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          下载图片
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500 min-h-[200px] flex items-center justify-center">
                        <div>
                          <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                          <p>转换后的图片将在这里显示</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="image-to-base64">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="w-5 h-5" />
                      上传图片
                    </CardTitle>
                    <CardDescription>支持 JPG、PNG、GIF、WebP 等格式</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="image-upload">选择图片文件</Label>
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        ref={fileInputRef}
                        className="cursor-pointer"
                      />
                    </div>
                    {uploadedImage && (
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <img
                          src={uploadedImage || "/placeholder.svg"}
                          alt="上传的图片"
                          className="max-w-full max-h-[200px] object-contain mx-auto rounded"
                        />
                      </div>
                    )}
                    <Button variant="outline" onClick={clearData} className="w-full bg-transparent">
                      清空
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Base64 输出
                    </CardTitle>
                    <CardDescription>生成的Base64字符串</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {base64Output ? (
                      <>
                        <div>
                          <Label htmlFor="base64-output">Base64 字符串</Label>
                          <Textarea
                            id="base64-output"
                            value={base64Output}
                            readOnly
                            className="min-h-[200px] font-mono text-sm"
                          />
                        </div>
                        <Button onClick={() => copyToClipboard(base64Output)} className="w-full" variant="outline">
                          {copied ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              已复制
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 mr-2" />
                              复制到剪贴板
                            </>
                          )}
                        </Button>
                      </>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500 min-h-[200px] flex items-center justify-center">
                        <div>
                          <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                          <p>上传图片后，Base64字符串将在这里显示</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="string-base64">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="w-5 h-5" />
                      字符串 转 Base64
                    </CardTitle>
                    <CardDescription>将普通文本转换为Base64编码</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="string-input">输入文本</Label>
                      <Textarea
                        id="string-input"
                        placeholder="输入要编码的文本..."
                        value={stringInput}
                        onChange={(e) => setStringInput(e.target.value)}
                        className="min-h-[150px]"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={encodeStringToBase64} className="flex-1">
                        编码为 Base64
                      </Button>
                      <Button onClick={loadStringExample} variant="outline">
                        示例
                      </Button>
                    </div>
                    {stringBase64Output && (
                      <div>
                        <Label htmlFor="string-base64-output">Base64 编码结果</Label>
                        <Textarea
                          id="string-base64-output"
                          value={stringBase64Output}
                          readOnly
                          className="min-h-[150px] font-mono text-sm"
                        />
                        <Button
                          onClick={() => copyToClipboard(stringBase64Output)}
                          className="w-full mt-2"
                          variant="outline"
                        >
                          {copied ? (
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
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Base64 转 字符串
                    </CardTitle>
                    <CardDescription>将Base64编码解码为普通文本</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="base64-string-input">Base64 编码</Label>
                      <Textarea
                        id="base64-string-input"
                        placeholder="粘贴Base64编码的文本..."
                        value={base64StringInput}
                        onChange={(e) => setBase64StringInput(e.target.value)}
                        className="min-h-[150px] font-mono text-sm"
                      />
                    </div>
                    <Button onClick={decodeBase64ToString} className="w-full">
                      解码为文本
                    </Button>
                    {decodedStringOutput && (
                      <div>
                        <Label htmlFor="decoded-string-output">解码结果</Label>
                        <Textarea
                          id="decoded-string-output"
                          value={decodedStringOutput}
                          readOnly
                          className="min-h-[150px]"
                        />
                        <Button
                          onClick={() => copyToClipboard(decodedStringOutput)}
                          className="w-full mt-2"
                          variant="outline"
                        >
                          {copied ? (
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
        </div>
      </div>
    </div>
  )
}
