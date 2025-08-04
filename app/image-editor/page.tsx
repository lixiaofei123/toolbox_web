"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, Download, Crop, ArrowLeft, Home, RotateCcw, Square } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const aspectRatios = [
  { label: "自由比例", value: "free" },
  { label: "1:1 (正方形)", value: "1:1" },
  { label: "4:3", value: "4:3" },
  { label: "3:4", value: "3:4" },
  { label: "16:9", value: "16:9" },
  { label: "9:16", value: "9:16" },
  { label: "3:2", value: "3:2" },
  { label: "2:3", value: "2:3" },
]

interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

type ResizeHandle = "nw" | "ne" | "sw" | "se" | "n" | "s" | "e" | "w" | "move" | null

export default function ImageEditor() {
  const [originalImage, setOriginalImage] = useState<string>("")
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 0, height: 0 })
  const [selectedRatio, setSelectedRatio] = useState<string>("free")
  const [customWidth, setCustomWidth] = useState<string>("")
  const [customHeight, setCustomHeight] = useState<string>("")
  const [isDragging, setIsDragging] = useState(false)
  const [dragHandle, setDragHandle] = useState<ResizeHandle>(null)
  const [dragStart, setDragStart] = useState({
    mouseX: 0,
    mouseY: 0,
    cropX: 0,
    cropY: 0,
    cropWidth: 0,
    cropHeight: 0,
  })
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 })
  const [imageOffset, setImageOffset] = useState({ x: 0, y: 0 })
  const [error, setError] = useState("")
  const [hasEditedImage, setHasEditedImage] = useState(false) // 标记是否有编辑后的图片
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // 计算图片显示尺寸的函数
  const calculateDisplaySize = (imgWidth: number, imgHeight: number) => {
    const maxWidth = 600
    const maxHeight = 400
    let displayWidth = imgWidth
    let displayHeight = imgHeight

    // 按比例缩放，保持宽高比
    const widthRatio = maxWidth / imgWidth
    const heightRatio = maxHeight / imgHeight
    const ratio = Math.min(widthRatio, heightRatio, 1) // 不放大，只缩小

    displayWidth = imgWidth * ratio
    displayHeight = imgHeight * ratio

    return { width: displayWidth, height: displayHeight }
  }

  // 重置裁剪区域的函数
  const resetCropAreaForImage = (imgWidth: number, imgHeight: number) => {
    const defaultWidth = imgWidth * 0.8
    const defaultHeight = imgHeight * 0.8
    setCropArea({
      x: (imgWidth - defaultWidth) / 2,
      y: (imgHeight - defaultHeight) / 2,
      width: defaultWidth,
      height: defaultHeight,
    })
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("请选择图片文件")
      return
    }

    setError("")
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setOriginalImage(result)
      setHasEditedImage(false)

      // 加载图片获取尺寸
      const img = new Image()
      img.onload = () => {
        setImageSize({ width: img.width, height: img.height })

        // 计算显示尺寸
        const displaySize = calculateDisplaySize(img.width, img.height)
        setDisplaySize(displaySize)

        // 重置裁剪区域
        resetCropAreaForImage(img.width, img.height)
      }
      img.src = result
    }
    reader.readAsDataURL(file)
  }

  const calculateAspectRatio = useCallback((ratio: string, currentArea: CropArea) => {
    if (ratio === "free") return currentArea

    const ratios: { [key: string]: number } = {
      "1:1": 1,
      "4:3": 4 / 3,
      "3:4": 3 / 4,
      "16:9": 16 / 9,
      "9:16": 9 / 16,
      "3:2": 3 / 2,
      "2:3": 2 / 3,
    }

    const targetRatio = ratios[ratio]
    if (!targetRatio) return currentArea

    const currentRatio = currentArea.width / currentArea.height

    if (currentRatio > targetRatio) {
      // 当前太宽，调整宽度
      const newWidth = currentArea.height * targetRatio
      return {
        ...currentArea,
        width: newWidth,
        x: currentArea.x + (currentArea.width - newWidth) / 2,
      }
    } else {
      // 当前太高，调整高度
      const newHeight = currentArea.width / targetRatio
      return {
        ...currentArea,
        height: newHeight,
        y: currentArea.y + (currentArea.height - newHeight) / 2,
      }
    }
  }, [])

  const handleRatioChange = (ratio: string) => {
    setSelectedRatio(ratio)
    if (originalImage) {
      const newArea = calculateAspectRatio(ratio, cropArea)
      setCropArea(newArea)
    }
  }

  // 修复后的鼠标位置计算函数
  const getMousePosition = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !imageRef.current) return { x: 0, y: 0 }

    const imageRect = imageRef.current.getBoundingClientRect()

    // 计算鼠标相对于图片的位置
    const mouseX = e.clientX - imageRect.left
    const mouseY = e.clientY - imageRect.top

    // 计算缩放比例
    const scaleX = imageSize.width / imageRect.width
    const scaleY = imageSize.height / imageRect.height

    // 转换为原始图片坐标
    return {
      x: mouseX * scaleX,
      y: mouseY * scaleY,
    }
  }

  const constrainCropArea = (area: CropArea): CropArea => {
    return {
      x: Math.max(0, Math.min(area.x, imageSize.width - area.width)),
      y: Math.max(0, Math.min(area.y, imageSize.height - area.y)),
      width: Math.max(10, Math.min(area.width, imageSize.width - area.x)),
      height: Math.max(10, Math.min(area.height, imageSize.height - area.y)),
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, handle: ResizeHandle) => {
    e.preventDefault()
    e.stopPropagation()

    const mousePos = getMousePosition(e)
    setIsDragging(true)
    setDragHandle(handle)
    setDragStart({
      mouseX: mousePos.x,
      mouseY: mousePos.y,
      cropX: cropArea.x,
      cropY: cropArea.y,
      cropWidth: cropArea.width,
      cropHeight: cropArea.height,
    })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !dragHandle) return

    const mousePos = getMousePosition(e)
    const deltaX = mousePos.x - dragStart.mouseX
    const deltaY = mousePos.y - dragStart.mouseY

    let newArea = { ...cropArea }

    switch (dragHandle) {
      case "move":
        newArea.x = dragStart.cropX + deltaX
        newArea.y = dragStart.cropY + deltaY
        break
      case "nw":
        newArea.x = dragStart.cropX + deltaX
        newArea.y = dragStart.cropY + deltaY
        newArea.width = dragStart.cropWidth - deltaX
        newArea.height = dragStart.cropHeight - deltaY
        break
      case "ne":
        newArea.y = dragStart.cropY + deltaY
        newArea.width = dragStart.cropWidth + deltaX
        newArea.height = dragStart.cropHeight - deltaY
        break
      case "sw":
        newArea.x = dragStart.cropX + deltaX
        newArea.width = dragStart.cropWidth - deltaX
        newArea.height = dragStart.cropHeight + deltaY
        break
      case "se":
        newArea.width = dragStart.cropWidth + deltaX
        newArea.height = dragStart.cropHeight + deltaY
        break
      case "n":
        newArea.y = dragStart.cropY + deltaY
        newArea.height = dragStart.cropHeight - deltaY
        break
      case "s":
        newArea.height = dragStart.cropHeight + deltaY
        break
      case "w":
        newArea.x = dragStart.cropX + deltaX
        newArea.width = dragStart.cropWidth - deltaX
        break
      case "e":
        newArea.width = dragStart.cropWidth + deltaX
        break
    }

    // 应用宽高比约束
    if (selectedRatio !== "free" && dragHandle !== "move") {
      newArea = calculateAspectRatio(selectedRatio, newArea)
    }

    // 约束到图片边界
    newArea = constrainCropArea(newArea)
    setCropArea(newArea)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setDragHandle(null)
  }

  // 修复后的剪裁功能
  const cropImage = () => {
    if (!originalImage || !canvasRef.current) {
      setError("请先上传图片")
      return
    }

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      // 设置画布尺寸为裁剪区域的实际尺寸
      canvas.width = Math.round(cropArea.width)
      canvas.height = Math.round(cropArea.height)

      if (ctx) {
        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // 绘制裁剪后的图片
        ctx.drawImage(
          img,
          Math.round(cropArea.x),
          Math.round(cropArea.y),
          Math.round(cropArea.width),
          Math.round(cropArea.height),
          0,
          0,
          canvas.width,
          canvas.height,
        )

        const croppedDataUrl = canvas.toDataURL("image/png", 1.0)

        // 直接替换原图
        setOriginalImage(croppedDataUrl)
        setHasEditedImage(true)

        // 更新图片尺寸信息
        const newWidth = canvas.width
        const newHeight = canvas.height
        setImageSize({ width: newWidth, height: newHeight })

        // 重新计算显示尺寸
        const displaySize = calculateDisplaySize(newWidth, newHeight)
        setDisplaySize(displaySize)

        // 重置裁剪区域
        resetCropAreaForImage(newWidth, newHeight)
        setSelectedRatio("free")

        toast({
          title: "剪裁成功",
          description: `图片已剪裁为 ${newWidth}×${newHeight}`,
        })
      }
    }

    img.src = originalImage
  }

  // 修复后的尺寸调整功能
  const resizeImage = () => {
    if (!originalImage || !canvasRef.current || !customWidth || !customHeight) {
      setError("请输入有效的宽度和高度")
      return
    }

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    const img = new Image()
    const newWidth = Number.parseInt(customWidth)
    const newHeight = Number.parseInt(customHeight)

    if (newWidth <= 0 || newHeight <= 0) {
      setError("宽度和高度必须大于0")
      return
    }

    if (newWidth > 5000 || newHeight > 5000) {
      setError("宽度和高度不能超过5000像素")
      return
    }

    img.onload = () => {
      // 设置画布尺寸
      canvas.width = newWidth
      canvas.height = newHeight

      if (ctx) {
        // 清空画布
        ctx.clearRect(0, 0, newWidth, newHeight)

        // 使用高质量的图片缩放
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = "high"

        // 绘制调整后的图片
        ctx.drawImage(img, 0, 0, newWidth, newHeight)

        const resizedDataUrl = canvas.toDataURL("image/png", 1.0)

        // 直接替换原图
        setOriginalImage(resizedDataUrl)
        setHasEditedImage(true)
        setImageSize({ width: newWidth, height: newHeight })

        // 重新计算显示尺寸
        const displaySize = calculateDisplaySize(newWidth, newHeight)
        setDisplaySize(displaySize)

        // 重置裁剪区域
        resetCropAreaForImage(newWidth, newHeight)
        setSelectedRatio("free")
        setError("")

        // 清空输入框
        setCustomWidth("")
        setCustomHeight("")

        toast({
          title: "调整成功",
          description: `图片尺寸已调整为 ${newWidth}×${newHeight}`,
        })
      }
    }

    img.onerror = () => {
      setError("图片加载失败")
    }

    img.src = originalImage
  }

  const downloadImage = () => {
    if (!originalImage || !hasEditedImage) return

    const link = document.createElement("a")
    link.href = originalImage
    link.download = `edited-image-${imageSize.width}x${imageSize.height}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "下载成功",
      description: `图片已下载：${imageSize.width}×${imageSize.height}`,
    })
  }

  const resetCrop = () => {
    if (imageSize.width && imageSize.height) {
      resetCropAreaForImage(imageSize.width, imageSize.height)
      setSelectedRatio("free")
    }
  }

  const clearAll = () => {
    setOriginalImage("")
    setCropArea({ x: 0, y: 0, width: 0, height: 0 })
    setSelectedRatio("free")
    setCustomWidth("")
    setCustomHeight("")
    setError("")
    setImageSize({ width: 0, height: 0 })
    setDisplaySize({ width: 0, height: 0 })
    setHasEditedImage(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // 计算裁剪框在显示图片上的位置和大小
  const getCropBoxStyle = () => {
    if (!imageRef.current || cropArea.width === 0 || cropArea.height === 0) {
      return { display: "none" }
    }

    const imageRect = imageRef.current.getBoundingClientRect()
    const containerRect = containerRef.current?.getBoundingClientRect()

    if (!containerRect) return { display: "none" }

    // 计算缩放比例
    const scaleX = imageRect.width / imageSize.width
    const scaleY = imageRect.height / imageSize.height

    // 计算裁剪框在显示图片上的位置和大小
    const displayCropX = cropArea.x * scaleX
    const displayCropY = cropArea.y * scaleY
    const displayCropWidth = cropArea.width * scaleX
    const displayCropHeight = cropArea.height * scaleY

    // 计算相对于容器的位置
    const left = imageRect.left - containerRect.left + displayCropX
    const top = imageRect.top - containerRect.top + displayCropY

    return {
      position: "absolute" as const,
      left: `${left}px`,
      top: `${top}px`,
      width: `${displayCropWidth}px`,
      height: `${displayCropHeight}px`,
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
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
              <h1 className="text-2xl font-bold text-gray-900">图片剪裁编辑</h1>
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
            <p className="text-gray-600">拖拽调整裁剪框，支持移动和调整大小，编辑后直接替换到编辑区域</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* 上传和设置 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  上传图片
                </CardTitle>
                <CardDescription>选择要编辑的图片文件</CardDescription>
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

                {originalImage && (
                  <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                    <p>
                      <strong>当前尺寸:</strong> {imageSize.width} × {imageSize.height}
                    </p>
                    <p>
                      <strong>显示尺寸:</strong> {Math.round(displaySize.width)} × {Math.round(displaySize.height)}
                    </p>
                  </div>
                )}

                <div>
                  <Label htmlFor="ratio-select">裁剪比例</Label>
                  <Select value={selectedRatio} onValueChange={handleRatioChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择裁剪比例" />
                    </SelectTrigger>
                    <SelectContent>
                      {aspectRatios.map((ratio) => (
                        <SelectItem key={ratio.value} value={ratio.value}>
                          {ratio.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>自定义尺寸调整</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="custom-width" className="text-xs">
                        宽度 (px)
                      </Label>
                      <Input
                        id="custom-width"
                        type="number"
                        placeholder="如: 800"
                        value={customWidth}
                        onChange={(e) => setCustomWidth(e.target.value)}
                        min="1"
                        max="5000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="custom-height" className="text-xs">
                        高度 (px)
                      </Label>
                      <Input
                        id="custom-height"
                        type="number"
                        placeholder="如: 600"
                        value={customHeight}
                        onChange={(e) => setCustomHeight(e.target.value)}
                        min="1"
                        max="5000"
                      />
                    </div>
                  </div>
                  {originalImage && (
                    <div className="text-xs text-gray-500">
                      当前尺寸: {imageSize.width} × {imageSize.height}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button onClick={cropImage} disabled={!originalImage} className="flex-1">
                    <Crop className="w-4 h-4 mr-2" />
                    剪裁
                  </Button>
                  <Button
                    onClick={resizeImage}
                    disabled={!originalImage || !customWidth || !customHeight}
                    variant="outline"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    调整尺寸
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={resetCrop}
                    disabled={!originalImage}
                    variant="outline"
                    className="flex-1 bg-transparent"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    重置
                  </Button>
                  <Button onClick={clearAll} variant="outline">
                    清空
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 图片编辑区域 */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crop className="w-5 h-5" />
                  图片编辑
                </CardTitle>
                <CardDescription>拖拽裁剪框调整位置和大小</CardDescription>
              </CardHeader>
              <CardContent>
                {originalImage ? (
                  <div className="space-y-4">
                    <div
                      ref={containerRef}
                      className="relative border rounded-lg overflow-hidden bg-gray-50 flex justify-center items-center"
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      style={{ minHeight: "400px" }}
                    >
                      <img
                        ref={imageRef}
                        src={originalImage || "/placeholder.svg"}
                        alt="编辑中的图片"
                        className="max-w-full max-h-full object-contain"
                        style={{
                          maxWidth: "600px",
                          maxHeight: "400px",
                          width: `${displaySize.width}px`,
                          height: `${displaySize.height}px`,
                        }}
                        draggable={false}
                      />

                      {/* 裁剪框覆盖层 */}
                      {cropArea.width > 0 && cropArea.height > 0 && (
                        <div
                          className="border-2 border-blue-500 bg-blue-500/10 pointer-events-none"
                          style={getCropBoxStyle()}
                        >
                          {/* 移动手柄 */}
                          <div
                            className="absolute inset-0 cursor-move pointer-events-auto"
                            onMouseDown={(e) => handleMouseDown(e, "move")}
                          />

                          {/* 角落调整手柄 */}
                          <div
                            className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 border border-white cursor-nw-resize pointer-events-auto"
                            onMouseDown={(e) => handleMouseDown(e, "nw")}
                          />
                          <div
                            className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border border-white cursor-ne-resize pointer-events-auto"
                            onMouseDown={(e) => handleMouseDown(e, "ne")}
                          />
                          <div
                            className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 border border-white cursor-sw-resize pointer-events-auto"
                            onMouseDown={(e) => handleMouseDown(e, "sw")}
                          />
                          <div
                            className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border border-white cursor-se-resize pointer-events-auto"
                            onMouseDown={(e) => handleMouseDown(e, "se")}
                          />

                          {/* 边缘调整手柄 */}
                          <div
                            className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-500 border border-white cursor-n-resize pointer-events-auto"
                            onMouseDown={(e) => handleMouseDown(e, "n")}
                          />
                          <div
                            className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-500 border border-white cursor-s-resize pointer-events-auto"
                            onMouseDown={(e) => handleMouseDown(e, "s")}
                          />
                          <div
                            className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 border border-white cursor-w-resize pointer-events-auto"
                            onMouseDown={(e) => handleMouseDown(e, "w")}
                          />
                          <div
                            className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 border border-white cursor-e-resize pointer-events-auto"
                            onMouseDown={(e) => handleMouseDown(e, "e")}
                          />
                        </div>
                      )}

                      {/* 右下角下载按钮 */}
                      {hasEditedImage && (
                        <Button onClick={downloadImage} size="sm" className="absolute bottom-4 right-4 shadow-lg">
                          <Download className="w-4 h-4 mr-2" />
                          下载
                        </Button>
                      )}
                    </div>
                    {cropArea.width > 0 && cropArea.height > 0 && (
                      <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                        <p>
                          <strong>裁剪区域:</strong> {Math.round(cropArea.width)} × {Math.round(cropArea.height)}
                        </p>
                        <p>
                          <strong>位置:</strong> ({Math.round(cropArea.x)}, {Math.round(cropArea.y)})
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500 min-h-[400px] flex items-center justify-center">
                    <div>
                      <Crop className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p>上传图片开始编辑</p>
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

          <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>
    </div>
  )
}
