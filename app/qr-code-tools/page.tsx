"use client"

import type React from "react"

import { useState, useRef } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  QrCode,
  Download,
  Upload,
  ArrowLeft,
  Home,
  Smartphone,
  Mail,
  Wifi,
  User,
  Copy,
  CheckCircle,
  Scan,
  FileImage,
  Camera,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import QRCode from "qrcode"
import jsQR from "jsqr"

export default function QrCodeTools() {
  // 生成二维码相关状态
  const [qrText, setQrText] = useState("")
  const [qrSize, setQrSize] = useState([200])
  const [qrColor, setQrColor] = useState("#000000")
  const [bgColor, setBgColor] = useState("#FFFFFF")
  const [qrDataUrl, setQrDataUrl] = useState("")
  const [qrType, setQrType] = useState("text")

  // 识别二维码相关状态
  const [uploadedImage, setUploadedImage] = useState("")
  const [recognizedText, setRecognizedText] = useState("")
  const [isRecognizing, setIsRecognizing] = useState(false)
  const [qrCodeInfo, setQrCodeInfo] = useState<any>(null)

  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // 使用 qrcode.js 库生成真正的二维码
  const generateQR = async () => {
    if (!qrText.trim()) {
      setError("请输入要生成二维码的内容")
      return
    }

    try {
      const canvas = canvasRef.current
      if (!canvas) return

      // 使用 qrcode.js 库生成二维码
      const options = {
        width: qrSize[0],
        margin: 2,
        color: {
          dark: qrColor,
          light: bgColor,
        },
        errorCorrectionLevel: "M" as const,
      }

      await QRCode.toCanvas(canvas, qrText, options)

      const dataUrl = canvas.toDataURL("image/png")
      setQrDataUrl(dataUrl)
      setError("")

      toast({
        title: "生成成功",
        description: "二维码已成功生成",
      })
    } catch (err) {
      setError("二维码生成失败：" + (err instanceof Error ? err.message : "未知错误"))
    }
  }

  // 处理图片上传
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
      setRecognizedText("")
      setQrCodeInfo(null)
      setError("")
    }
    reader.readAsDataURL(file)
  }

  // 使用 jsQR 库进行真实的二维码识别
  const recognizeQR = async () => {
    if (!uploadedImage) {
      setError("请先上传包含二维码的图片")
      return
    }

    setIsRecognizing(true)
    setError("")

    try {
      // 创建图片对象
      const img = new Image()
      img.crossOrigin = "anonymous"

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error("图片加载失败"))
        img.src = uploadedImage
      })

      // 创建 canvas 进行图像处理
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) throw new Error("无法获取 Canvas 上下文")

      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      // 获取图像数据
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

      // 使用 jsQR 库识别二维码
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      })

      if (code) {
        setRecognizedText(code.data)
        setQrCodeInfo({
          data: code.data,
          location: code.location,
          version: code.version,
          errorCorrectionLevel: code.errorCorrectionLevel,
          dataMask: code.dataMask,
          chunks: code.chunks,
        })

        toast({
          title: "识别成功",
          description: "已成功识别二维码内容",
        })
      } else {
        // 尝试反色处理
        const invertedImageData = invertImageData(imageData)
        const invertedCode = jsQR(invertedImageData.data, invertedImageData.width, invertedImageData.height, {
          inversionAttempts: "attemptBoth",
        })

        if (invertedCode) {
          setRecognizedText(invertedCode.data)
          setQrCodeInfo({
            data: invertedCode.data,
            location: invertedCode.location,
            version: invertedCode.version,
            errorCorrectionLevel: invertedCode.errorCorrectionLevel,
            dataMask: invertedCode.dataMask,
            chunks: invertedCode.chunks,
          })

          toast({
            title: "识别成功",
            description: "已成功识别二维码内容（反色处理）",
          })
        } else {
          throw new Error("未能识别出二维码内容")
        }
      }
    } catch (err) {
      setError("二维码识别失败：" + (err instanceof Error ? err.message : "请确保图片清晰且包含有效的二维码"))
    } finally {
      setIsRecognizing(false)
    }
  }

  // 反色处理图像数据
  const invertImageData = (imageData: ImageData): ImageData => {
    const data = new Uint8ClampedArray(imageData.data)
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255 - data[i] // R
      data[i + 1] = 255 - data[i + 1] // G
      data[i + 2] = 255 - data[i + 2] // B
      // Alpha 通道保持不变
    }
    return new ImageData(data, imageData.width, imageData.height)
  }

  const downloadQR = () => {
    if (!qrDataUrl) return

    const link = document.createElement("a")
    link.href = qrDataUrl
    link.download = "qrcode.png"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: "复制成功",
        description: "内容已复制到剪贴板",
      })
    } catch (err) {
      toast({
        title: "复制失败",
        description: "请手动选择并复制文本",
        variant: "destructive",
      })
    }
  }

  const setPresetContent = (type: string) => {
    setQrType(type)
    switch (type) {
      case "url":
        setQrText("https://example.com")
        break
      case "email":
        setQrText("mailto:example@email.com")
        break
      case "phone":
        setQrText("tel:+86-138-0013-8000")
        break
      case "sms":
        setQrText("sms:+86-138-0013-8000")
        break
      case "wifi":
        setQrText("WIFI:T:WPA;S:NetworkName;P:Password;;")
        break
      case "vcard":
        setQrText(
          "BEGIN:VCARD\nVERSION:3.0\nFN:张三\nORG:公司名称\nTEL:+86-138-0013-8000\nEMAIL:zhangsan@example.com\nEND:VCARD",
        )
        break
      default:
        setQrText("")
    }
  }

  const clearAll = () => {
    setQrText("")
    setQrDataUrl("")
    setUploadedImage("")
    setRecognizedText("")
    setQrCodeInfo(null)
    setError("")
    setQrType("text")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const getContentType = (text: string) => {
    if (text.startsWith("http://") || text.startsWith("https://")) return "网址链接"
    if (text.startsWith("mailto:")) return "电子邮件"
    if (text.startsWith("tel:")) return "电话号码"
    if (text.startsWith("sms:")) return "短信"
    if (text.startsWith("WIFI:")) return "WiFi信息"
    if (text.startsWith("BEGIN:VCARD")) return "联系人名片"
    if (text.startsWith("geo:")) return "地理位置"
    if (text.startsWith("market://") || text.startsWith("https://play.google.com")) return "应用下载"
    return "纯文本"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100">
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
              <h1 className="text-2xl font-bold text-gray-900">二维码工具</h1>
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
            <p className="text-gray-600">生成二维码和识别二维码内容</p>
          </div>

          <Tabs defaultValue="generate" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="generate" className="flex items-center gap-2">
                <QrCode className="w-4 h-4" />
                生成二维码
              </TabsTrigger>
              <TabsTrigger value="recognize" className="flex items-center gap-2">
                <Scan className="w-4 h-4" />
                识别二维码
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generate">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* 内容输入 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <QrCode className="w-5 h-5" />
                      二维码内容
                    </CardTitle>
                    <CardDescription>输入要生成二维码的内容</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="qr-type">内容类型</Label>
                      <Select value={qrType} onValueChange={setPresetContent}>
                        <SelectTrigger>
                          <SelectValue placeholder="选择内容类型" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">纯文本</SelectItem>
                          <SelectItem value="url">网址链接</SelectItem>
                          <SelectItem value="email">电子邮件</SelectItem>
                          <SelectItem value="phone">电话号码</SelectItem>
                          <SelectItem value="sms">短信</SelectItem>
                          <SelectItem value="wifi">WiFi信息</SelectItem>
                          <SelectItem value="vcard">联系人名片</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="qr-content">内容</Label>
                      <Textarea
                        id="qr-content"
                        placeholder="输入要生成二维码的内容..."
                        value={qrText}
                        onChange={(e) => setQrText(e.target.value)}
                        className="min-h-[120px] font-mono text-sm"
                      />
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="qr-size">二维码大小: {qrSize[0]}px</Label>
                        <Slider
                          id="qr-size"
                          min={100}
                          max={500}
                          step={10}
                          value={qrSize}
                          onValueChange={setQrSize}
                          className="mt-2"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="qr-color">前景色</Label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              id="qr-color"
                              type="color"
                              value={qrColor}
                              onChange={(e) => setQrColor(e.target.value)}
                              className="w-12 h-10 p-1 cursor-pointer"
                            />
                            <Input
                              type="text"
                              value={qrColor}
                              onChange={(e) => setQrColor(e.target.value)}
                              className="font-mono text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="bg-color">背景色</Label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              id="bg-color"
                              type="color"
                              value={bgColor}
                              onChange={(e) => setBgColor(e.target.value)}
                              className="w-12 h-10 p-1 cursor-pointer"
                            />
                            <Input
                              type="text"
                              value={bgColor}
                              onChange={(e) => setBgColor(e.target.value)}
                              className="font-mono text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={generateQR} className="flex-1">
                        生成二维码
                      </Button>
                      <Button onClick={clearAll} variant="outline">
                        清空
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* 二维码预览 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Smartphone className="w-5 h-5" />
                      二维码预览
                    </CardTitle>
                    <CardDescription>生成的二维码图片</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {qrDataUrl ? (
                      <div className="space-y-4">
                        <div className="border rounded-lg p-4 bg-gray-50 flex items-center justify-center">
                          <img
                            src={qrDataUrl || "/placeholder.svg"}
                            alt="生成的二维码"
                            className="max-w-full h-auto rounded"
                          />
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>
                            尺寸: {qrSize[0]} × {qrSize[0]} 像素
                          </p>
                          <p>内容长度: {qrText.length} 字符</p>
                        </div>
                        <Button onClick={downloadQR} className="w-full bg-transparent" variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          下载二维码
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500 min-h-[300px] flex items-center justify-center">
                        <div>
                          <QrCode className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                          <p>生成的二维码将在这里显示</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* 快捷模板 */}
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>快捷模板</CardTitle>
                  <CardDescription>点击使用常用的二维码模板</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Button
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent"
                      onClick={() => setPresetContent("url")}
                    >
                      <QrCode className="w-6 h-6" />
                      <div className="text-center">
                        <div className="font-semibold">网址链接</div>
                        <div className="text-xs text-gray-500">生成网站链接二维码</div>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent"
                      onClick={() => setPresetContent("email")}
                    >
                      <Mail className="w-6 h-6" />
                      <div className="text-center">
                        <div className="font-semibold">电子邮件</div>
                        <div className="text-xs text-gray-500">生成邮件地址二维码</div>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent"
                      onClick={() => setPresetContent("wifi")}
                    >
                      <Wifi className="w-6 h-6" />
                      <div className="text-center">
                        <div className="font-semibold">WiFi信息</div>
                        <div className="text-xs text-gray-500">生成WiFi连接二维码</div>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent"
                      onClick={() => setPresetContent("vcard")}
                    >
                      <User className="w-6 h-6" />
                      <div className="text-center">
                        <div className="font-semibold">联系人名片</div>
                        <div className="text-xs text-gray-500">生成联系人信息二维码</div>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent"
                      onClick={() => setPresetContent("phone")}
                    >
                      <Smartphone className="w-6 h-6" />
                      <div className="text-center">
                        <div className="font-semibold">电话号码</div>
                        <div className="text-xs text-gray-500">生成电话拨号二维码</div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recognize">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* 图片上传 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="w-5 h-5" />
                      上传二维码图片
                    </CardTitle>
                    <CardDescription>选择包含二维码的图片文件进行识别</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="qr-image-upload">选择图片文件</Label>
                      <Input
                        id="qr-image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        ref={fileInputRef}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-gray-500 mt-1">支持 JPG、PNG、GIF、WebP 等格式</p>
                    </div>

                    {uploadedImage && (
                      <div className="space-y-4">
                        <div className="border rounded-lg p-4 bg-gray-50">
                          <img
                            src={uploadedImage || "/placeholder.svg"}
                            alt="上传的二维码图片"
                            className="max-w-full max-h-[300px] object-contain mx-auto rounded"
                          />
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>✅ 图片已上传，点击下方按钮开始识别</p>
                        </div>
                        <Button onClick={recognizeQR} disabled={isRecognizing} className="w-full">
                          {isRecognizing ? (
                            <>
                              <Scan className="w-4 h-4 mr-2 animate-spin" />
                              识别中...
                            </>
                          ) : (
                            <>
                              <Scan className="w-4 h-4 mr-2" />
                              开始识别二维码
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {!uploadedImage && (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500 min-h-[200px] flex items-center justify-center">
                        <div>
                          <FileImage className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                          <p className="font-medium">上传包含二维码的图片</p>
                          <p className="text-sm mt-1">支持 JPG、PNG、GIF、WebP 等格式</p>
                          <p className="text-xs mt-2 text-gray-400">建议上传清晰、完整的二维码图片以获得最佳识别效果</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 识别结果 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      识别结果
                    </CardTitle>
                    <CardDescription>二维码中包含的内容信息</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {recognizedText ? (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="recognized-content">识别到的内容</Label>
                          <Textarea
                            id="recognized-content"
                            value={recognizedText}
                            readOnly
                            className="min-h-[200px] font-mono text-sm bg-gray-50"
                          />
                        </div>

                        {/* 二维码详细信息 */}
                        {qrCodeInfo && (
                          <div className="text-sm text-gray-600 space-y-2 p-3 bg-gray-50 rounded-lg">
                            <h4 className="font-semibold text-gray-800">二维码信息</h4>
                            <div className="grid grid-cols-2 gap-2">
                              <p>📝 内容长度: {recognizedText.length} 字符</p>
                              <p>🏷️ 内容类型: {getContentType(recognizedText)}</p>
                              <p>📊 版本: {qrCodeInfo.version}</p>
                              <p>🛡️ 纠错级别: {qrCodeInfo.errorCorrectionLevel}</p>
                            </div>
                            {qrCodeInfo.location && <p>📍 位置: 已检测到二维码边界</p>}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button onClick={() => copyToClipboard(recognizedText)} className="flex-1" variant="outline">
                            {copied ? (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                已复制
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4 mr-2" />
                                复制内容
                              </>
                            )}
                          </Button>
                          {(recognizedText.startsWith("http://") || recognizedText.startsWith("https://")) && (
                            <Button onClick={() => window.open(recognizedText, "_blank")} variant="outline">
                              打开链接
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500 min-h-[300px] flex items-center justify-center">
                        <div>
                          <Scan className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                          <p className="font-medium">识别结果将在这里显示</p>
                          <p className="text-sm mt-1">上传图片后点击识别按钮开始识别</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* 使用提示 */}
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>识别提示</CardTitle>
                  <CardDescription>为了获得最佳识别效果，请注意以下事项</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <Camera className="w-4 h-4" />
                        图片要求
                      </h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• 图片清晰，二维码完整无遮挡</li>
                        <li>• 二维码与背景对比度高</li>
                        <li>• 避免模糊、倾斜或严重变形</li>
                        <li>• 建议图片分辨率不低于 200x200</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <FileImage className="w-4 h-4" />
                        支持格式
                      </h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• JPG / JPEG 格式</li>
                        <li>• PNG 格式（推荐）</li>
                        <li>• GIF 格式</li>
                        <li>• WebP 格式</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        技术特性
                      </h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• 使用 jsQR 专业识别库</li>
                        <li>• 支持反色图像处理</li>
                        <li>• 自动检测二维码边界</li>
                        <li>• 显示详细的二维码信息</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {error && (
            <Alert className="mt-6" variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>
    </div>
  )
}
