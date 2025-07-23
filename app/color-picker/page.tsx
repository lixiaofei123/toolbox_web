"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Copy, Palette, Upload, Eye } from "lucide-react"

interface ColorInfo {
  hex: string
  rgb: { r: number; g: number; b: number }
  hsl: { h: number; s: number; l: number }
  hsv: { h: number; s: number; v: number }
}

export default function ColorPickerPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [colorInfo, setColorInfo] = useState<ColorInfo | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isImageLoaded, setIsImageLoaded] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const magnifierRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // RGB转HSL
  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255
    g /= 255
    b /= 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0
    let s = 0
    const l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0)
          break
        case g:
          h = (b - r) / d + 2
          break
        case b:
          h = (r - g) / d + 4
          break
      }
      h /= 6
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    }
  }

  // RGB转HSV
  const rgbToHsv = (r: number, g: number, b: number) => {
    r /= 255
    g /= 255
    b /= 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0
    const v = max
    const s = max === 0 ? 0 : (max - min) / max

    if (max !== min) {
      const d = max - min
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0)
          break
        case g:
          h = (b - r) / d + 2
          break
        case b:
          h = (r - g) / d + 4
          break
      }
      h /= 6
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      v: Math.round(v * 100),
    }
  }

  // 处理图片上传
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "文件类型错误",
          description: "请选择图片文件",
          variant: "destructive",
        })
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setSelectedImage(result)
        setIsImageLoaded(false)
        setColorInfo(null)
      }
      reader.readAsDataURL(file)
    }
  }

  // 绘制图片到Canvas
  const drawImageToCanvas = useCallback(() => {
    if (!selectedImage || !canvasRef.current || !imageRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    const img = imageRef.current

    if (!ctx) return

    // 计算缩放比例，限制最大尺寸
    const maxWidth = 600
    const maxHeight = 500
    let { width, height } = img

    if (width > maxWidth) {
      height = (height * maxWidth) / width
      width = maxWidth
    }
    if (height > maxHeight) {
      width = (width * maxHeight) / height
      height = maxHeight
    }

    canvas.width = width
    canvas.height = height

    // 清空画布并绘制图片
    ctx.clearRect(0, 0, width, height)
    ctx.drawImage(img, 0, 0, width, height)

    setIsImageLoaded(true)
  }, [selectedImage])

  // 图片加载完成
  const handleImageLoad = () => {
    drawImageToCanvas()
  }

  // 生成放大镜
  const generateMagnifier = useCallback(
    (x: number, y: number) => {
      if (!canvasRef.current || !magnifierRef.current || !isImageLoaded) return

      const canvas = canvasRef.current
      const magnifierCanvas = magnifierRef.current
      const ctx = canvas.getContext("2d")
      const magnifierCtx = magnifierCanvas.getContext("2d")

      if (!ctx || !magnifierCtx) return

      // 设置放大镜尺寸
      const magnifierSize = 150
      magnifierCanvas.width = magnifierSize
      magnifierCanvas.height = magnifierSize

      // 获取源区域（10x10像素）
      const sourceSize = 10
      const sourceX = Math.max(0, Math.min(x - sourceSize / 2, canvas.width - sourceSize))
      const sourceY = Math.max(0, Math.min(y - sourceSize / 2, canvas.height - sourceSize))

      try {
        const imageData = ctx.getImageData(sourceX, sourceY, sourceSize, sourceSize)

        // 清空放大镜画布
        magnifierCtx.clearRect(0, 0, magnifierSize, magnifierSize)

        // 绘制放大的像素
        const pixelSize = magnifierSize / sourceSize // 15像素每个源像素

        for (let i = 0; i < sourceSize; i++) {
          for (let j = 0; j < sourceSize; j++) {
            const pixelIndex = (i * sourceSize + j) * 4
            const r = imageData.data[pixelIndex]
            const g = imageData.data[pixelIndex + 1]
            const b = imageData.data[pixelIndex + 2]
            const a = imageData.data[pixelIndex + 3]

            magnifierCtx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a / 255})`
            magnifierCtx.fillRect(j * pixelSize, i * pixelSize, pixelSize, pixelSize)
          }
        }

        // 绘制十字准星
        magnifierCtx.strokeStyle = "red"
        magnifierCtx.lineWidth = 1

        // 计算中心方块的位置和大小
        const blockSize = 15 // 一个像素在放大镜中的大小
        const blockX = Math.floor(magnifierSize / 2 / blockSize) * blockSize
        const blockY = Math.floor(magnifierSize / 2 / blockSize) * blockSize
        const blockCenterX = blockX + blockSize / 2
        const blockCenterY = blockY + blockSize / 2

        // 绘制十字线（以方块中心为交叉点）
        magnifierCtx.beginPath()
        // 水平线 - 左侧
        magnifierCtx.moveTo(0, blockCenterY)
        magnifierCtx.lineTo(blockX, blockCenterY)
        // 水平线 - 右侧
        magnifierCtx.moveTo(blockX + blockSize, blockCenterY)
        magnifierCtx.lineTo(magnifierSize, blockCenterY)
        // 垂直线 - 上侧
        magnifierCtx.moveTo(blockCenterX, 0)
        magnifierCtx.lineTo(blockCenterX, blockY)
        // 垂直线 - 下侧
        magnifierCtx.moveTo(blockCenterX, blockY + blockSize)
        magnifierCtx.lineTo(blockCenterX, magnifierSize)
        magnifierCtx.stroke()

        // 绘制中心方块边框
        magnifierCtx.strokeStyle = "red"
        magnifierCtx.lineWidth = 2
        magnifierCtx.strokeRect(blockX, blockY, blockSize, blockSize)
      } catch (error) {
        console.error("Error generating magnifier:", error)
      }
    },
    [isImageLoaded],
  )

  // 获取像素颜色
  const getPixelColor = useCallback(
    (x: number, y: number) => {
      if (!canvasRef.current || !isImageLoaded) return

      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      try {
        const imageData = ctx.getImageData(x, y, 1, 1)
        const [r, g, b] = imageData.data

        const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
        const hsl = rgbToHsl(r, g, b)
        const hsv = rgbToHsv(r, g, b)

        setColorInfo({
          hex,
          rgb: { r, g, b },
          hsl,
          hsv,
        })
      } catch (error) {
        console.error("Error getting pixel color:", error)
      }
    },
    [isImageLoaded],
  )

  // 处理鼠标移动
  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !isImageLoaded) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = Math.floor(event.clientX - rect.left)
    const y = Math.floor(event.clientY - rect.top)

    setMousePosition({ x, y })
    generateMagnifier(x, y)
  }

  // 处理点击取色
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !isImageLoaded) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = Math.floor(event.clientX - rect.left)
    const y = Math.floor(event.clientY - rect.top)

    getPixelColor(x, y)
  }

  // 复制颜色值
  const copyColor = (value: string, type: string) => {
    navigator.clipboard.writeText(value).then(() => {
      toast({
        title: "复制成功",
        description: `${type}颜色值已复制到剪贴板`,
      })
    })
  }

  // 清空选择
  const clearSelection = () => {
    setSelectedImage(null)
    setColorInfo(null)
    setIsImageLoaded(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回首页
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                颜色取色器
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* 图片上传 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              上传图片
            </CardTitle>
            <CardDescription>选择图片文件，然后点击图片上的任意位置来获取颜色信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input type="file" accept="image/*" onChange={handleImageUpload} ref={fileInputRef} className="flex-1" />
              {selectedImage && (
                <Button variant="outline" onClick={clearSelection}>
                  清空
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {selectedImage && (
          <>
            {/* 图片显示和取色区域 */}
            <div className="space-y-4">
              <div className="flex gap-4">
                {/* 主图片区域 */}
                <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                  <canvas
                    ref={canvasRef}
                    onMouseMove={handleMouseMove}
                    onClick={handleCanvasClick}
                    className="cursor-crosshair block"
                    style={{ maxWidth: "600px", maxHeight: "500px" }}
                  />
                  <img
                    ref={imageRef}
                    src={selectedImage || "/placeholder.svg"}
                    alt="Selected"
                    onLoad={handleImageLoad}
                    className="hidden"
                  />
                </div>

                {/* 放大镜区域 */}
                {isImageLoaded && (
                  <div className="flex flex-col gap-4">
                    <div
                      className="border-2 border-gray-200 rounded-lg bg-white shadow-sm p-2"
                      style={{ width: "170px" }}
                    >
                      <div className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        放大镜 (10×10)
                      </div>
                      <canvas
                        ref={magnifierRef}
                        className="border border-gray-300 rounded"
                        style={{ width: "150px", height: "150px" }}
                      />
                    </div>

                    {/* 鼠标位置信息 */}
                    <div
                      className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm"
                      style={{ width: "170px" }}
                    >
                      <div className="text-sm font-medium text-gray-700 mb-2">位置信息</div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>X: {mousePosition.x}px</div>
                        <div>Y: {mousePosition.y}px</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 颜色信息显示 */}
            {colorInfo && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    颜色信息
                  </CardTitle>
                  <CardDescription>点击颜色值可复制到剪贴板</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* 颜色预览 */}
                    <div className="space-y-2">
                      <Label>颜色预览</Label>
                      <div
                        className="w-full h-10 rounded-lg border-2 border-gray-200 shadow-inner"
                        style={{ backgroundColor: colorInfo.hex }}
                      />
                    </div>

                    {/* HEX */}
                    <div className="space-y-2">
                      <Label>HEX</Label>
                      <div className="flex gap-2">
                        <Input value={colorInfo.hex} readOnly className="font-mono bg-gray-50" />
                        <Button size="sm" onClick={() => copyColor(colorInfo.hex, "HEX")}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* RGB */}
                    <div className="space-y-2">
                      <Label>RGB</Label>
                      <div className="flex gap-2">
                        <Input
                          value={`rgb(${colorInfo.rgb.r}, ${colorInfo.rgb.g}, ${colorInfo.rgb.b})`}
                          readOnly
                          className="font-mono bg-gray-50"
                        />
                        <Button
                          size="sm"
                          onClick={() =>
                            copyColor(`rgb(${colorInfo.rgb.r}, ${colorInfo.rgb.g}, ${colorInfo.rgb.b})`, "RGB")
                          }
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* HSL */}
                    <div className="space-y-2">
                      <Label>HSL</Label>
                      <div className="flex gap-2">
                        <Input
                          value={`hsl(${colorInfo.hsl.h}, ${colorInfo.hsl.s}%, ${colorInfo.hsl.l}%)`}
                          readOnly
                          className="font-mono bg-gray-50"
                        />
                        <Button
                          size="sm"
                          onClick={() =>
                            copyColor(`hsl(${colorInfo.hsl.h}, ${colorInfo.hsl.s}%, ${colorInfo.hsl.l}%)`, "HSL")
                          }
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* 详细信息 */}
                  <div className="mt-6 grid md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="font-medium text-gray-700 mb-2">RGB 分量</div>
                      <div className="space-y-1 text-gray-600">
                        <div>红色 (R): {colorInfo.rgb.r}</div>
                        <div>绿色 (G): {colorInfo.rgb.g}</div>
                        <div>蓝色 (B): {colorInfo.rgb.b}</div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="font-medium text-gray-700 mb-2">HSL 分量</div>
                      <div className="space-y-1 text-gray-600">
                        <div>色相 (H): {colorInfo.hsl.h}°</div>
                        <div>饱和度 (S): {colorInfo.hsl.s}%</div>
                        <div>亮度 (L): {colorInfo.hsl.l}%</div>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="font-medium text-gray-700 mb-2">HSV 分量</div>
                      <div className="space-y-1 text-gray-600">
                        <div>色相 (H): {colorInfo.hsv.h}°</div>
                        <div>饱和度 (S): {colorInfo.hsv.s}%</div>
                        <div>明度 (V): {colorInfo.hsv.v}%</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* 使用说明 */}
        <Card>
          <CardHeader>
            <CardTitle>使用说明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-600">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-800">操作步骤：</h4>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>点击"选择文件"上传图片</li>
                  <li>移动鼠标查看放大镜效果</li>
                  <li>点击图片上的任意位置取色</li>
                  <li>点击颜色值旁的复制按钮</li>
                </ol>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-gray-800">功能特点：</h4>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>10×10像素区域放大显示</li>
                  <li>精确的十字准星定位</li>
                  <li>支持多种颜色格式</li>
                  <li>一键复制颜色值</li>
                  <li>实时鼠标位置显示</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
