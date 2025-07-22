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
  const [croppedImage, setCroppedImage] = useState<string>("")
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 0, height: 0 })
  const [selectedRatio, setSelectedRatio] = useState<string>("free")
  const [customWidth, setCustomWidth] = useState<string>("")
  const [customHeight, setCustomHeight] = useState<string>("")
  const [isDragging, setIsDragging] = useState(false)
  const [dragHandle, setDragHandle] = useState<ResizeHandle>(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, cropX: 0, cropY: 0, cropWidth: 0, cropHeight: 0 })
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 })
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

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
      setCroppedImage("")

      // 加载图片获取尺寸
      const img = new Image()
      img.onload = () => {
        setImageSize({ width: img.width, height: img.height })

        // 计算显示尺寸
        const maxWidth = 600
        const maxHeight = 400
        let displayWidth = img.width
        let displayHeight = img.height

        if (displayWidth > maxWidth) {
          displayHeight = (displayHeight * maxWidth) / displayWidth
          displayWidth = maxWidth
        }

        if (displayHeight > maxHeight) {
          displayWidth = (displayWidth * maxHeight) / displayHeight
          displayHeight = maxHeight
        }

        setDisplaySize({ width: displayWidth, height: displayHeight })

        // 设置默认裁剪区域为中心的80%
        const defaultWidth = img.width * 0.8
        const defaultHeight = img.height * 0.8
        setCropArea({
          x: (img.width - defaultWidth) / 2,
          y: (img.height - defaultHeight) / 2,
          width: defaultWidth,
          height: defaultHeight,
        })
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

  const getMousePosition = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return { x: 0, y: 0 }

    const rect = imageRef.current.getBoundingClientRect()
    const scaleX = imageSize.width / rect.width
    const scaleY = imageSize.height / rect.height

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  const constrainCropArea = (area: CropArea): CropArea => {
    return {
      x: Math.max(0, Math.min(area.x, imageSize.width - area.width)),
      y: Math.max(0, Math.min(area.y, imageSize.height - area.height)),
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
      x: mousePos.x,
      y: mousePos.y,
      cropX: cropArea.x,
      cropY: cropArea.y,
      cropWidth: cropArea.width,
      cropHeight: cropArea.height,
    })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !dragHandle) return

    const mousePos = getMousePosition(e)
    const deltaX = mousePos.x - dragStart.x
    const deltaY = mousePos.y - dragStart.y

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

  const cropImage = () => {
    if (!originalImage || !canvasRef.current) {
      setError("请先上传图片")
      return
    }

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      canvas.width = cropArea.width
      canvas.height = cropArea.height

      if (ctx) {
        ctx.drawImage(
          img,
          cropArea.x,
          cropArea.y,
          cropArea.width,
          cropArea.height,
          0,
          0,
          cropArea.width,
          cropArea.height,
        )

        const croppedDataUrl = canvas.toDataURL("image/png")
        setCroppedImage(croppedDataUrl)

        toast({
          title: "剪裁成功",
          description: "图片已成功剪裁",
        })
      }
    }

    img.src = originalImage
  }

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

    img.onload = () => {
      canvas.width = newWidth
      canvas.height = newHeight

      if (ctx) {
        ctx.drawImage(img, 0, 0, newWidth, newHeight)
        const resizedDataUrl = canvas.toDataURL("image/png")
        setCroppedImage(resizedDataUrl)

        toast({
          title: "调整成功",
          description: `图片尺寸已调整为 ${newWidth}x${newHeight}`,
        })
      }
    }

    img.src = originalImage
  }

  const downloadImage = () => {
    if (!croppedImage) return

    const link = document.createElement("a")
    link.href = croppedImage
    link.download = "edited-image.png"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const resetCrop = () => {
    if (imageSize.width && imageSize.height) {
      const defaultWidth = imageSize.width * 0.8
      const defaultHeight = imageSize.height * 0.8
      setCropArea({
        x: (imageSize.width - defaultWidth) / 2,
        y: (imageSize.height - defaultHeight) / 2,
        width: defaultWidth,
        height: defaultHeight,
      })
    }
  }

  const clearAll = () => {
    setOriginalImage("")
    setCroppedImage("")
    setCropArea({ x: 0, y: 0, width: 0, height: 0 })
    setSelectedRatio("free")
    setCustomWidth("")
    setCustomHeight("")
    setError("")
    setImageSize({ width: 0, height: 0 })
    setDisplaySize({ width: 0, height: 0 })
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
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
            <p className="text-gray-600">拖拽调整裁剪框，支持移动和调整大小</p>
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
                  <div className="text-sm text-gray-600">
                    <p>
                      原始尺寸: {imageSize.width} × {imageSize.height}
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
                  <Label>自定义尺寸</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="custom-width" className="text-xs">
                        宽度
                      </Label>
                      <Input
                        id="custom-width"
                        type="number"
                        placeholder="宽度"
                        value={customWidth}
                        onChange={(e) => setCustomWidth(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="custom-height" className="text-xs">
                        高度
                      </Label>
                      <Input
                        id="custom-height"
                        type="number"
                        placeholder="高度"
                        value={customHeight}
                        onChange={(e) => setCustomHeight(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={cropImage} disabled={!originalImage} className="flex-1">
                    <Crop className="w-4 h-4 mr-2" />
                    剪裁
                  </Button>
                  <Button onClick={resizeImage} disabled={!originalImage} variant="outline">
                    <Square className="w-4 h-4 mr-2" />
                    调整
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
                      className="relative border rounded-lg overflow-hidden bg-gray-50 flex justify-center"
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                    >
                      <img
                        ref={imageRef}
                        src={originalImage || "/placeholder.svg"}
                        alt="编辑中的图片"
                        className="max-w-full h-auto"
                        style={{ maxWidth: "600px", maxHeight: "400px" }}
                        draggable={false}
                      />
                      {cropArea.width > 0 && cropArea.height > 0 && imageRef.current && (
                        <div
                          className="absolute border-2 border-blue-500 bg-blue-500/10"
                          style={{
                            left: `${(cropArea.x / imageSize.width) * 100}%`,
                            top: `${(cropArea.y / imageSize.height) * 100}%`,
                            width: `${(cropArea.width / imageSize.width) * 100}%`,
                            height: `${(cropArea.height / imageSize.height) * 100}%`,
                          }}
                        >
                          {/* 移动手柄 */}
                          <div
                            className="absolute inset-0 cursor-move"
                            onMouseDown={(e) => handleMouseDown(e, "move")}
                          />

                          {/* 角落调整手柄 */}
                          <div
                            className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 border border-white cursor-nw-resize"
                            onMouseDown={(e) => handleMouseDown(e, "nw")}
                          />
                          <div
                            className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border border-white cursor-ne-resize"
                            onMouseDown={(e) => handleMouseDown(e, "ne")}
                          />
                          <div
                            className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 border border-white cursor-sw-resize"
                            onMouseDown={(e) => handleMouseDown(e, "sw")}
                          />
                          <div
                            className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border border-white cursor-se-resize"
                            onMouseDown={(e) => handleMouseDown(e, "se")}
                          />

                          {/* 边缘调整手柄 */}
                          <div
                            className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-500 border border-white cursor-n-resize"
                            onMouseDown={(e) => handleMouseDown(e, "n")}
                          />
                          <div
                            className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-500 border border-white cursor-s-resize"
                            onMouseDown={(e) => handleMouseDown(e, "s")}
                          />
                          <div
                            className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 border border-white cursor-w-resize"
                            onMouseDown={(e) => handleMouseDown(e, "w")}
                          />
                          <div
                            className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 border border-white cursor-e-resize"
                            onMouseDown={(e) => handleMouseDown(e, "e")}
                          />
                        </div>
                      )}
                    </div>
                    {cropArea.width > 0 && cropArea.height > 0 && (
                      <div className="text-sm text-gray-600">
                        <p>
                          裁剪区域: {Math.round(cropArea.width)} × {Math.round(cropArea.height)}
                        </p>
                        <p>
                          位置: ({Math.round(cropArea.x)}, {Math.round(cropArea.y)})
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

            {/* 结果预览 */}
            {croppedImage && (
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    编辑结果
                  </CardTitle>
                  <CardDescription>编辑后的图片预览</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4 bg-gray-50 text-center">
                      <img
                        src={croppedImage || "/placeholder.svg"}
                        alt="编辑后的图片"
                        className="max-w-full max-h-[300px] object-contain mx-auto rounded"
                      />
                    </div>
                    <Button onClick={downloadImage} className="w-full bg-transparent" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      下载编辑后的图片
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
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
