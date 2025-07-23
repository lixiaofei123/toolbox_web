"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import { Upload, Copy, RotateCcw, Palette, Eye, Home, Info } from "lucide-react"
import Link from "next/link"

interface ColorInfo {
  rgb: { r: number; g: number; b: number }
  hex: string
  hsl: { h: number; s: number; l: number }
}

export default function ColorPickerPage() {
  const [image, setImage] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<ColorInfo | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [showMagnifier, setShowMagnifier] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const magnifierCanvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 处理文件上传
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "文件格式错误",
          description: "请选择图片文件",
          variant: "destructive",
        })
        return
      }

      // 重置状态
      setImageLoaded(false)
      setSelectedColor(null)
      setShowMagnifier(false)

      const reader = new FileReader()
      reader.onload = (e) => {
        setImage(e.target?.result as string)
      }
      reader.onerror = () => {
        toast({
          title: "图片加载失败",
          description: "请尝试其他图片",
          variant: "destructive",
        })
      }
      reader.readAsDataURL(file)
    }
  }, [])

  // RGB转HSL
  const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
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

  // 获取像素颜色
  const getPixelColor = useCallback((x: number, y: number): ColorInfo | null => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return null

    try {
      const imageData = ctx.getImageData(x, y, 1, 1)
      const [r, g, b] = imageData.data

      const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
      const hsl = rgbToHsl(r, g, b)

      return {
        rgb: { r, g, b },
        hex,
        hsl,
      }
    } catch (error) {
      console.error("获取像素颜色失败:", error)
      return null
    }
  }, [])

  // 生成放大镜图像
  const generateMagnifier = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current
    const magnifierCanvas = magnifierCanvasRef.current
    const ctx = canvas?.getContext("2d")
    const magnifierCtx = magnifierCanvas?.getContext("2d")

    if (!canvas || !ctx || !magnifierCanvas || !magnifierCtx) return

    // 设置放大镜画布尺寸 - 调整为150x150
    magnifierCanvas.width = 150
    magnifierCanvas.height = 150

    // 获取10x10区域的图像数据
    const sourceSize = 10
    const targetSize = 150

    // 确保不超出图像边界
    const startX = Math.max(0, Math.min(x - sourceSize / 2, canvas.width - sourceSize))
    const startY = Math.max(0, Math.min(y - sourceSize / 2, canvas.height - sourceSize))

    try {
      const imageData = ctx.getImageData(startX, startY, sourceSize, sourceSize)

      // 清空放大镜画布
      magnifierCtx.clearRect(0, 0, targetSize, targetSize)

      // 创建临时画布来处理像素数据
      const tempCanvas = document.createElement("canvas")
      tempCanvas.width = sourceSize
      tempCanvas.height = sourceSize
      const tempCtx = tempCanvas.getContext("2d")!
      tempCtx.putImageData(imageData, 0, 0)

      // 关闭图像平滑以保持像素化效果
      magnifierCtx.imageSmoothingEnabled = false

      // 将10x10的图像放大到150x150
      magnifierCtx.drawImage(tempCanvas, 0, 0, sourceSize, sourceSize, 0, 0, targetSize, targetSize)

      // 绘制带中心方块的十字准星
      magnifierCtx.strokeStyle = "#ff0000"
      magnifierCtx.lineWidth = 1

      // 绘制十字线（避开中心方块区域）
      const centerX = targetSize / 2
      const centerY = targetSize / 2
      const pixelSize = 15 // 每个像素在放大镜中的大小 (150/10 = 15)
      const blockSize = pixelSize // 中心方块大小等于一个像素块大小

      // 确保方块对齐到像素网格
      const blockX = Math.floor(centerX / pixelSize) * pixelSize
      const blockY = Math.floor(centerY / pixelSize) * pixelSize

      // 计算方块的中心点
      const blockCenterX = blockX + blockSize / 2
      const blockCenterY = blockY + blockSize / 2

      magnifierCtx.beginPath()
      // 水平线 - 左侧（以方块中心为基准）
      magnifierCtx.moveTo(blockCenterX - blockSize / 2 - 20, blockCenterY)
      magnifierCtx.lineTo(blockCenterX - blockSize / 2, blockCenterY)
      // 水平线 - 右侧（以方块中心为基准）
      magnifierCtx.moveTo(blockCenterX + blockSize / 2, blockCenterY)
      magnifierCtx.lineTo(blockCenterX + blockSize / 2 + 20, blockCenterY)
      // 垂直线 - 上侧（以方块中心为基准）
      magnifierCtx.moveTo(blockCenterX, blockCenterY - blockSize / 2 - 20)
      magnifierCtx.lineTo(blockCenterX, blockCenterY - blockSize / 2)
      // 垂直线 - 下侧（以方块中心为基准）
      magnifierCtx.moveTo(blockCenterX, blockCenterY + blockSize / 2)
      magnifierCtx.lineTo(blockCenterX, blockCenterY + blockSize / 2 + 20)
      magnifierCtx.stroke()

      // 绘制中心方块边框（刚好套住一个像素块）
      magnifierCtx.strokeStyle = "#ff0000"
      magnifierCtx.lineWidth = 2
      magnifierCtx.strokeRect(blockX, blockY, blockSize, blockSize)

      // 绘制边框
      magnifierCtx.strokeStyle = "#333"
      magnifierCtx.lineWidth = 1
      magnifierCtx.strokeRect(0, 0, targetSize, targetSize)
    } catch (error) {
      console.error("生成放大镜失败:", error)
    }
  }, [])

  // 处理鼠标移动
  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas || !imageLoaded) return

      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height

      const x = Math.floor((event.clientX - rect.left) * scaleX)
      const y = Math.floor((event.clientY - rect.top) * scaleY)

      setMousePosition({ x, y })
      setShowMagnifier(true)
      generateMagnifier(x, y)
    },
    [generateMagnifier, imageLoaded],
  )

  // 处理鼠标离开
  const handleMouseLeave = useCallback(() => {
    setShowMagnifier(false)
  }, [])

  // 处理点击选择颜色
  const handleCanvasClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas || !imageLoaded) return

      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height

      const x = Math.floor((event.clientX - rect.left) * scaleX)
      const y = Math.floor((event.clientY - rect.top) * scaleY)

      const color = getPixelColor(x, y)
      if (color) {
        setSelectedColor(color)
        toast({
          title: "颜色已选择",
          description: `RGB(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`,
        })
      }
    },
    [getPixelColor, imageLoaded],
  )

  // 加载图片到画布
  useEffect(() => {
    if (image) {
      // 创建新的Image对象，确保完全加载
      const img = new Image()
      img.crossOrigin = "anonymous" // 处理可能的跨域问题
      img.src = image

      img.onload = () => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        // 计算合适的画布尺寸
        const maxWidth = 600 // 限制图片最大宽度
        const maxHeight = 500 // 限制图片最大高度

        let { width, height } = img

        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }

        // 设置画布尺寸
        canvas.width = width
        canvas.height = height

        // 清除画布并绘制图像
        ctx.clearRect(0, 0, width, height)
        ctx.drawImage(img, 0, 0, width, height)

        // 标记图片已加载
        setImageLoaded(true)
      }

      img.onerror = () => {
        toast({
          title: "图片加载失败",
          description: "请尝试其他图片",
          variant: "destructive",
        })
        setImage(null)
      }
    }
  }, [image])

  // 复制颜色值
  const copyToClipboard = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "已复制",
        description: `${label} 已复制到剪贴板`,
      })
    })
  }, [])

  // 重置
  const handleReset = useCallback(() => {
    setImage(null)
    setSelectedColor(null)
    setShowMagnifier(false)
    setImageLoaded(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <Home className="w-4 h-4 mr-2" />
                  返回首页
                </Button>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">颜色取色器</h1>
              </div>
            </div>
            <Badge variant="secondary">
              <Eye className="w-3 h-3 mr-1" />
              图片取色
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 gap-6">
          {/* 工具说明 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                使用说明
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 font-semibold text-xs">1</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">上传图片</div>
                    <div>选择要取色的图片文件</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 font-semibold text-xs">2</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">移动鼠标</div>
                    <div>在图片上移动查看放大镜</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-600 font-semibold text-xs">3</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">点击取色</div>
                    <div>点击确定选择该位置的颜色</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 主要内容区域 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>图片取色</CardTitle>
                <div className="flex gap-2">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    上传图片
                  </Button>
                  {image && (
                    <Button onClick={handleReset} variant="outline" size="sm">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      重置
                    </Button>
                  )}
                </div>
              </div>
              <CardDescription>支持 JPG、PNG、GIF、WebP 等格式，移动鼠标查看放大镜，点击选择颜色</CardDescription>
            </CardHeader>
            <CardContent>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />

              {!image ? (
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-400 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">点击上传图片或拖拽图片到此处</p>
                  <p className="text-sm text-gray-400">支持 JPG、PNG、GIF、WebP 格式</p>
                </div>
              ) : (
                <div className="flex gap-6" ref={containerRef}>
                  {/* 图片区域 */}
                  <div className="relative">
                    {!imageLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                        <div className="text-center">
                          <div className="w-8 h-8 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin mx-auto mb-2"></div>
                          <p className="text-sm text-gray-600">图片加载中...</p>
                        </div>
                      </div>
                    )}
                    <canvas
                      ref={canvasRef}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                      onClick={handleCanvasClick}
                      className="border rounded-lg cursor-crosshair"
                      style={{
                        display: imageLoaded ? "block" : "none",
                      }}
                    />
                    {showMagnifier && imageLoaded && (
                      <div className="absolute top-2 right-2 text-xs text-gray-500 bg-white px-2 py-1 rounded shadow">
                        位置: ({mousePosition.x}, {mousePosition.y})
                      </div>
                    )}
                  </div>

                  {/* 放大镜和颜色信息区域 - 直接放在图片右侧 */}
                  <div className="flex flex-col gap-4">
                    {/* 放大镜 */}
                    {showMagnifier && imageLoaded && (
                      <div className="border rounded-lg p-3 bg-white shadow-sm">
                        <div className="text-sm font-medium text-gray-700 mb-2">放大镜</div>
                        <canvas
                          ref={magnifierCanvasRef}
                          width={150}
                          height={150}
                          className="w-[150px] h-[150px] border rounded"
                        />
                        <div className="mt-2 text-xs text-gray-500 text-center space-y-1">
                          <div>10×10 → 150×150</div>
                          <div>
                            位置: ({mousePosition.x}, {mousePosition.y})
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 选中的颜色 */}
                    {selectedColor && (
                      <div className="border rounded-lg p-3 bg-white shadow-sm w-[156px]">
                        <div className="text-sm font-medium text-gray-700 mb-3">选中颜色</div>

                        {/* 色块 */}
                        <div
                          className="w-full h-16 rounded border-2 border-gray-200 mb-3"
                          style={{ backgroundColor: selectedColor.hex }}
                        />

                        {/* 颜色值 */}
                        <div className="space-y-2">
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-gray-700">HEX</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => copyToClipboard(selectedColor.hex, "HEX")}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                            <div className="text-xs font-mono bg-gray-100 p-1 rounded">{selectedColor.hex}</div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-gray-700">RGB</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() =>
                                  copyToClipboard(
                                    `rgb(${selectedColor.rgb.r}, ${selectedColor.rgb.g}, ${selectedColor.rgb.b})`,
                                    "RGB",
                                  )
                                }
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                            <div className="text-xs font-mono bg-gray-100 p-1 rounded">
                              {selectedColor.rgb.r}, {selectedColor.rgb.g}, {selectedColor.rgb.b}
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-gray-700">HSL</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() =>
                                  copyToClipboard(
                                    `hsl(${selectedColor.hsl.h}, ${selectedColor.hsl.s}%, ${selectedColor.hsl.l}%)`,
                                    "HSL",
                                  )
                                }
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                            <div className="text-xs font-mono bg-gray-100 p-1 rounded">
                              {selectedColor.hsl.h}°, {selectedColor.hsl.s}%, {selectedColor.hsl.l}%
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
