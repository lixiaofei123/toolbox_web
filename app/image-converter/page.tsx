"use client"

import type React from "react"

import { useState, useRef } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, Download, ImageIcon, ArrowLeft, Home, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const imageFormats = [
  { value: "image/jpeg", label: "JPG", extension: "jpg" },
  { value: "image/png", label: "PNG", extension: "png" },
  { value: "image/webp", label: "WebP", extension: "webp" },
  { value: "image/gif", label: "GIF", extension: "gif" },
]

export default function ImageConverter() {
  const [originalImage, setOriginalImage] = useState<string>("")
  const [convertedImage, setConvertedImage] = useState<string>("")
  const [selectedFormat, setSelectedFormat] = useState<string>("image/jpeg")
  const [quality, setQuality] = useState<number[]>([90])
  const [isConverting, setIsConverting] = useState(false)
  const [error, setError] = useState("")
  const [originalFormat, setOriginalFormat] = useState("")
  const [originalSize, setOriginalSize] = useState("")
  const [convertedSize, setConvertedSize] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("请选择图片文件")
      return
    }

    setOriginalFormat(file.type)
    setOriginalSize((file.size / 1024).toFixed(2) + " KB")
    setError("")

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setOriginalImage(result)
      setConvertedImage("")
      setConvertedSize("")
    }
    reader.readAsDataURL(file)
  }

  const convertImage = async () => {
    if (!originalImage) {
      setError("请先上传图片")
      return
    }

    setIsConverting(true)
    setError("")

    try {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()

      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height

        if (ctx) {
          // 如果转换为JPG，设置白色背景
          if (selectedFormat === "image/jpeg") {
            ctx.fillStyle = "#FFFFFF"
            ctx.fillRect(0, 0, canvas.width, canvas.height)
          }

          ctx.drawImage(img, 0, 0)

          const qualityValue = selectedFormat === "image/png" ? 1 : quality[0] / 100
          const convertedDataUrl = canvas.toDataURL(selectedFormat, qualityValue)

          setConvertedImage(convertedDataUrl)

          // 计算转换后的文件大小
          const base64Length = convertedDataUrl.split(",")[1].length
          const sizeInBytes = (base64Length * 3) / 4
          setConvertedSize((sizeInBytes / 1024).toFixed(2) + " KB")

          toast({
            title: "转换成功",
            description: `图片已成功转换为 ${imageFormats.find((f) => f.value === selectedFormat)?.label} 格式`,
          })
        }
        setIsConverting(false)
      }

      img.onerror = () => {
        setError("图片加载失败")
        setIsConverting(false)
      }

      img.src = originalImage
    } catch (err) {
      setError("图片转换失败")
      setIsConverting(false)
    }
  }

  const downloadImage = () => {
    if (!convertedImage) return

    const format = imageFormats.find((f) => f.value === selectedFormat)
    const link = document.createElement("a")
    link.href = convertedImage
    link.download = `converted-image.${format?.extension || "jpg"}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const clearAll = () => {
    setOriginalImage("")
    setConvertedImage("")
    setError("")
    setOriginalFormat("")
    setOriginalSize("")
    setConvertedSize("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
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
              <h1 className="text-2xl font-bold text-gray-900">图片格式转换</h1>
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
            <p className="text-gray-600">支持JPG、PNG、WebP、GIF等格式之间的相互转换</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* 上传和设置 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  上传图片
                </CardTitle>
                <CardDescription>选择要转换的图片文件</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
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

                {originalImage && (
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <img
                        src={originalImage || "/placeholder.svg"}
                        alt="原始图片"
                        className="max-w-full max-h-[200px] object-contain mx-auto rounded"
                      />
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>原始格式: {imageFormats.find((f) => f.value === originalFormat)?.label || "未知"}</p>
                      <p>文件大小: {originalSize}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="format-select">目标格式</Label>
                    <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择目标格式" />
                      </SelectTrigger>
                      <SelectContent>
                        {imageFormats.map((format) => (
                          <SelectItem key={format.value} value={format.value}>
                            {format.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedFormat !== "image/png" && selectedFormat !== "image/gif" && (
                    <div>
                      <Label htmlFor="quality-slider">图片质量: {quality[0]}%</Label>
                      <Slider
                        id="quality-slider"
                        min={10}
                        max={100}
                        step={5}
                        value={quality}
                        onValueChange={setQuality}
                        className="mt-2"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button onClick={convertImage} disabled={!originalImage || isConverting} className="flex-1">
                    {isConverting ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        转换中...
                      </>
                    ) : (
                      "开始转换"
                    )}
                  </Button>
                  <Button variant="outline" onClick={clearAll}>
                    清空
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 转换结果 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  转换结果
                </CardTitle>
                <CardDescription>转换后的图片预览和下载</CardDescription>
              </CardHeader>
              <CardContent>
                {convertedImage ? (
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <img
                        src={convertedImage || "/placeholder.svg"}
                        alt="转换后的图片"
                        className="max-w-full max-h-[300px] object-contain mx-auto rounded"
                      />
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>转换格式: {imageFormats.find((f) => f.value === selectedFormat)?.label}</p>
                      <p>文件大小: {convertedSize}</p>
                      {selectedFormat !== "image/png" && selectedFormat !== "image/gif" && (
                        <p>图片质量: {quality[0]}%</p>
                      )}
                    </div>
                    <Button onClick={downloadImage} className="w-full bg-transparent" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      下载转换后的图片
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500 min-h-[300px] flex items-center justify-center">
                    <div>
                      <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p>转换后的图片将在这里显示</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

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
                  <h3 className="font-semibold mb-2">支持的格式</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• JPG/JPEG - 适合照片，支持质量调节</li>
                    <li>• PNG - 支持透明背景，无损压缩</li>
                    <li>• WebP - 现代格式，文件更小</li>
                    <li>• GIF - 支持动画（静态转换）</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">转换提示</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• PNG转JPG时会添加白色背景</li>
                    <li>• 质量设置仅对JPG/WebP有效</li>
                    <li>• 所有处理都在本地完成</li>
                    <li>• 支持大尺寸图片转换</li>
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
