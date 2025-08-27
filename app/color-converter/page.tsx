"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, Palette, ArrowLeft, Home, CheckCircle, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ColorValues {
  hex: string
  rgb: { r: number; g: number; b: number }
  hsl: { h: number; s: number; l: number }
  alpha: number
}

export default function ColorConverter() {
  const [colorValues, setColorValues] = useState<ColorValues>({
    hex: "#3b82f6",
    rgb: { r: 59, g: 130, b: 246 },
    hsl: { h: 217, s: 91, l: 60 },
    alpha: 1,
  })
  const [inputHex, setInputHex] = useState("#3b82f6")
  const [inputRgb, setInputRgb] = useState({ r: "59", g: "130", b: "246" })
  const [inputHsl, setInputHsl] = useState({ h: "217", s: "91", l: "60" })
  const [inputAlpha, setInputAlpha] = useState("1")
  const [error, setError] = useState("")
  const [copied, setCopied] = useState("")
  const { toast } = useToast()
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [colorHistory, setColorHistory] = useState<string[]>([])

  // 颜色转换函数
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: Number.parseInt(result[1], 16),
          g: Number.parseInt(result[2], 16),
          b: Number.parseInt(result[3], 16),
        }
      : null
  }

  const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
  }

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255
    g /= 255
    b /= 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0
    let s = 0
    const l = (max + min) / 2

    if (max === min) {
      h = s = 0 // achromatic
    } else {
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

  const hslToRgb = (h: number, s: number, l: number) => {
    h /= 360
    s /= 100
    l /= 100

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    let r, g, b

    if (s === 0) {
      r = g = b = l // achromatic
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q
      r = hue2rgb(p, q, h + 1 / 3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1 / 3)
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    }
  }

  const updateFromHex = (hex: string, alpha: number = colorValues.alpha) => {
    if (!/^#[0-9A-F]{6}$/i.test(hex)) {
      setError("请输入有效的HEX颜色值 (如: #FF0000)")
      return
    }

    const rgb = hexToRgb(hex)
    if (!rgb) {
      setError("无效的HEX颜色值")
      return
    }

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
    setColorValues({ hex, rgb, hsl, alpha })
    setInputRgb({ r: rgb.r.toString(), g: rgb.g.toString(), b: rgb.b.toString() })
    setInputHsl({ h: hsl.h.toString(), s: hsl.s.toString(), l: hsl.l.toString() })
    setInputAlpha(alpha.toString())
    setError("")

    setColorHistory((prev) => {
      const newHistory = [hex, ...prev.filter((c) => c !== hex)]
      return newHistory.slice(0, 12)
    })
  }

  const updateFromRgb = (r: number, g: number, b: number, alpha: number = colorValues.alpha) => {
    if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
      setError("RGB值必须在0-255之间")
      return
    }

    const hex = rgbToHex(r, g, b)
    const hsl = rgbToHsl(r, g, b)
    const rgb = { r, g, b }

    setColorValues({ hex, rgb, hsl, alpha })
    setInputHex(hex)
    setInputHsl({ h: hsl.h.toString(), s: hsl.s.toString(), l: hsl.l.toString() })
    setInputAlpha(alpha.toString())
    setError("")
  }

  const updateFromHsl = (h: number, s: number, l: number, alpha: number = colorValues.alpha) => {
    if (h < 0 || h > 360 || s < 0 || s > 100 || l < 0 || l > 100) {
      setError("HSL值范围: H(0-360), S(0-100), L(0-100)")
      return
    }

    const rgb = hslToRgb(h, s, l)
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b)
    const hsl = { h, s, l }

    setColorValues({ hex, rgb, hsl, alpha })
    setInputHex(hex)
    setInputRgb({ r: rgb.r.toString(), g: rgb.g.toString(), b: rgb.b.toString() })
    setInputAlpha(alpha.toString())
    setError("")
  }

  const updateAlpha = (alpha: number) => {
    if (alpha < 0 || alpha > 1) {
      setError("透明度值必须在0-1之间")
      return
    }

    setColorValues({ ...colorValues, alpha })
    setInputAlpha(alpha.toString())
    setError("")
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

  const generateRandomColor = () => {
    const randomHex =
      "#" +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0")
    updateFromHex(randomHex)
    setInputHex(randomHex)
  }

  const generateColorPalette = () => {
    const colors = []

    for (let h = 0; h < 360; h += 30) {
      for (let s = 50; s <= 100; s += 50) {
        for (let l = 30; l <= 70; l += 20) {
          const rgb = hslToRgb(h, s, l)
          const hex = rgbToHex(rgb.r, rgb.g, rgb.b)
          colors.push(hex)
        }
      }
    }

    for (let i = 0; i <= 255; i += 32) {
      colors.push(rgbToHex(i, i, i))
    }

    return colors.slice(0, 64)
  }

  const calculateContrast = (color1: string, color2: string) => {
    const getLuminance = (hex: string) => {
      const rgb = hexToRgb(hex)
      if (!rgb) return 0

      const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((c) => {
        c = c / 255
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      })

      return 0.2126 * r + 0.7152 * g + 0.0722 * b
    }

    const lum1 = getLuminance(color1)
    const lum2 = getLuminance(color2)
    const brightest = Math.max(lum1, lum2)
    const darkest = Math.min(lum1, lum2)

    return (brightest + 0.05) / (darkest + 0.05)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100">
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
              <h1 className="text-2xl font-bold text-gray-900">颜色转换</h1>
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
            <p className="text-gray-600">HEX、RGB、HSL、RGBA、HSLA颜色格式互转，支持透明度</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* 颜色预览 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  颜色预览
                </CardTitle>
                <CardDescription>当前选择的颜色</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="relative">
                  <div className="w-full h-32 rounded-lg border-2 border-gray-200 shadow-inner relative overflow-hidden">
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{
                        backgroundImage: `
                          linear-gradient(45deg, #ccc 25%, transparent 25%), 
                          linear-gradient(-45deg, #ccc 25%, transparent 25%), 
                          linear-gradient(45deg, transparent 75%, #ccc 75%), 
                          linear-gradient(-45deg, transparent 75%, #ccc 75%)
                        `,
                        backgroundSize: "20px 20px",
                        backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                      }}
                    />
                    <div
                      className="absolute inset-0 cursor-pointer hover:opacity-90 transition-opacity"
                      style={{
                        backgroundColor: `rgba(${colorValues.rgb.r}, ${colorValues.rgb.g}, ${colorValues.rgb.b}, ${colorValues.alpha})`,
                      }}
                      title="点击选择颜色"
                    />
                  </div>
                  <input
                    type="color"
                    value={colorValues.hex}
                    onChange={(e) => {
                      updateFromHex(e.target.value)
                      setInputHex(e.target.value)
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <Label className="text-sm font-medium">HEX</Label>
                      <p className="font-mono text-lg">{colorValues.hex.toUpperCase()}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(colorValues.hex.toUpperCase(), "HEX")}
                    >
                      {copied === "HEX" ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <Label className="text-sm font-medium">RGB</Label>
                      <p className="font-mono text-lg">
                        rgb({colorValues.rgb.r}, {colorValues.rgb.g}, {colorValues.rgb.b})
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        copyToClipboard(`rgb(${colorValues.rgb.r}, ${colorValues.rgb.g}, ${colorValues.rgb.b})`, "RGB")
                      }
                    >
                      {copied === "RGB" ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <Label className="text-sm font-medium">RGBA</Label>
                      <p className="font-mono text-lg">
                        rgba({colorValues.rgb.r}, {colorValues.rgb.g}, {colorValues.rgb.b}, {colorValues.alpha})
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        copyToClipboard(
                          `rgba(${colorValues.rgb.r}, ${colorValues.rgb.g}, ${colorValues.rgb.b}, ${colorValues.alpha})`,
                          "RGBA",
                        )
                      }
                    >
                      {copied === "RGBA" ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <Label className="text-sm font-medium">HSL</Label>
                      <p className="font-mono text-lg">
                        hsl({colorValues.hsl.h}, {colorValues.hsl.s}%, {colorValues.hsl.l}%)
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        copyToClipboard(
                          `hsl(${colorValues.hsl.h}, ${colorValues.hsl.s}%, ${colorValues.hsl.l}%)`,
                          "HSL",
                        )
                      }
                    >
                      {copied === "HSL" ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <Label className="text-sm font-medium">HSLA</Label>
                      <p className="font-mono text-lg">
                        hsla({colorValues.hsl.h}, {colorValues.hsl.s}%, {colorValues.hsl.l}%, {colorValues.alpha})
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        copyToClipboard(
                          `hsla(${colorValues.hsl.h}, ${colorValues.hsl.s}%, ${colorValues.hsl.l}%, ${colorValues.alpha})`,
                          "HSLA",
                        )
                      }
                    >
                      {copied === "HSLA" ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">颜色对比度检查</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded" style={{ backgroundColor: colorValues.hex, color: "#FFFFFF" }}>
                      <p className="text-sm font-medium">白色文字</p>
                      <p className="text-xs">对比度: {calculateContrast(colorValues.hex, "#FFFFFF").toFixed(2)}</p>
                    </div>
                    <div className="p-3 rounded" style={{ backgroundColor: colorValues.hex, color: "#000000" }}>
                      <p className="text-sm font-medium">黑色文字</p>
                      <p className="text-xs">对比度: {calculateContrast(colorValues.hex, "#000000").toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={generateRandomColor} className="flex-1 bg-transparent" variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    随机颜色
                  </Button>
                  <Button onClick={() => setShowColorPicker(!showColorPicker)} variant="outline">
                    <Palette className="w-4 h-4 mr-2" />
                    色盘
                  </Button>
                </div>

                {showColorPicker && (
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4 bg-white">
                      <Label className="text-sm font-medium mb-2 block">颜色选择器</Label>
                      <div className="space-y-3">
                        <input
                          type="color"
                          value={colorValues.hex}
                          onChange={(e) => {
                            updateFromHex(e.target.value)
                            setInputHex(e.target.value)
                          }}
                          className="w-full h-12 rounded border cursor-pointer"
                        />

                        <div className="grid grid-cols-8 gap-1">
                          {generateColorPalette().map((color, index) => (
                            <button
                              key={index}
                              className="w-8 h-8 rounded border-2 border-gray-200 hover:border-gray-400 transition-colors cursor-pointer"
                              style={{ backgroundColor: color }}
                              onClick={() => {
                                updateFromHex(color)
                                setInputHex(color)
                              }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 颜色输入 */}
            <Card>
              <CardHeader>
                <CardTitle>颜色输入</CardTitle>
                <CardDescription>输入任意格式的颜色值进行转换</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* HEX输入 */}
                <div className="space-y-2">
                  <Label htmlFor="hex-input">HEX 颜色值</Label>
                  <div className="flex gap-2">
                    <Input
                      id="hex-input"
                      type="text"
                      placeholder="#FF0000"
                      value={inputHex}
                      onChange={(e) => setInputHex(e.target.value)}
                      className="font-mono"
                    />
                    <Button onClick={() => updateFromHex(inputHex)}>转换</Button>
                  </div>
                </div>

                {/* 透明度控制 */}
                <div className="space-y-4">
                  <Label>透明度 (Alpha)</Label>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="alpha-slider" className="text-sm flex justify-between">
                        <span>透明度</span>
                        <span className="font-mono">{Math.round(colorValues.alpha * 100)}%</span>
                      </Label>
                      <div className="relative mt-2">
                        <div
                          className="h-4 rounded mb-2 border"
                          style={{
                            background: `linear-gradient(to right, 
                              rgba(${colorValues.rgb.r}, ${colorValues.rgb.g}, ${colorValues.rgb.b}, 0) 0%, 
                              rgba(${colorValues.rgb.r}, ${colorValues.rgb.g}, ${colorValues.rgb.b}, 1) 100%
                            ), 
                            linear-gradient(45deg, #ccc 25%, transparent 25%), 
                            linear-gradient(-45deg, #ccc 25%, transparent 25%), 
                            linear-gradient(45deg, transparent 75%, #ccc 75%), 
                            linear-gradient(-45deg, transparent 75%, #ccc 75%)`,
                            backgroundSize: "cover, 10px 10px, 10px 10px, 10px 10px, 10px 10px",
                            backgroundPosition: "0 0, 0 0, 0 5px, 5px -5px, -5px 0px",
                          }}
                        />
                        <Slider
                          id="alpha-slider"
                          min={0}
                          max={1}
                          step={0.01}
                          value={[colorValues.alpha]}
                          onValueChange={(value) => {
                            updateAlpha(value[0])
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        min="0"
                        max="1"
                        step="0.01"
                        value={inputAlpha}
                        onChange={(e) => setInputAlpha(e.target.value)}
                        placeholder="0.0 - 1.0"
                        className="font-mono"
                      />
                      <Button onClick={() => updateAlpha(Number.parseFloat(inputAlpha) || 0)}>设置</Button>
                    </div>
                  </div>
                </div>

                {/* RGB输入 */}
                <div className="space-y-2">
                  <Label>RGB 颜色值</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label htmlFor="rgb-r" className="text-xs">
                        R (0-255)
                      </Label>
                      <Input
                        id="rgb-r"
                        type="number"
                        min="0"
                        max="255"
                        value={inputRgb.r}
                        onChange={(e) => setInputRgb({ ...inputRgb, r: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="rgb-g" className="text-xs">
                        G (0-255)
                      </Label>
                      <Input
                        id="rgb-g"
                        type="number"
                        min="0"
                        max="255"
                        value={inputRgb.g}
                        onChange={(e) => setInputRgb({ ...inputRgb, g: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="rgb-b" className="text-xs">
                        B (0-255)
                      </Label>
                      <Input
                        id="rgb-b"
                        type="number"
                        min="0"
                        max="255"
                        value={inputRgb.b}
                        onChange={(e) => setInputRgb({ ...inputRgb, b: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button
                    onClick={() =>
                      updateFromRgb(
                        Number.parseInt(inputRgb.r) || 0,
                        Number.parseInt(inputRgb.g) || 0,
                        Number.parseInt(inputRgb.b) || 0,
                      )
                    }
                    className="w-full"
                  >
                    转换
                  </Button>
                </div>

                {/* HSL输入 */}
                <div className="space-y-4">
                  <Label>HSL 颜色值 (拖拽滑块调整)</Label>

                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="hsl-h" className="text-sm flex justify-between">
                        <span>色相 (H)</span>
                        <span className="font-mono">{inputHsl.h}°</span>
                      </Label>
                      <div className="relative mt-2">
                        <div
                          className="h-4 rounded mb-2"
                          style={{
                            background:
                              "linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)",
                          }}
                        />
                        <Slider
                          id="hsl-h"
                          min={0}
                          max={360}
                          step={1}
                          value={[Number.parseInt(inputHsl.h) || 0]}
                          onValueChange={(value) => {
                            const newHsl = { ...inputHsl, h: value[0].toString() }
                            setInputHsl(newHsl)
                            updateFromHsl(value[0], Number.parseInt(inputHsl.s) || 0, Number.parseInt(inputHsl.l) || 0)
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="hsl-s" className="text-sm flex justify-between">
                        <span>饱和度 (S)</span>
                        <span className="font-mono">{inputHsl.s}%</span>
                      </Label>
                      <div className="relative mt-2">
                        <div
                          className="h-4 rounded mb-2"
                          style={{
                            background: `linear-gradient(to right, hsl(${inputHsl.h}, 0%, ${inputHsl.l}%), hsl(${inputHsl.h}, 100%, ${inputHsl.l}%))`,
                          }}
                        />
                        <Slider
                          id="hsl-s"
                          min={0}
                          max={100}
                          step={1}
                          value={[Number.parseInt(inputHsl.s) || 0]}
                          onValueChange={(value) => {
                            const newHsl = { ...inputHsl, s: value[0].toString() }
                            setInputHsl(newHsl)
                            updateFromHsl(Number.parseInt(inputHsl.h) || 0, value[0], Number.parseInt(inputHsl.l) || 0)
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="hsl-l" className="text-sm flex justify-between">
                        <span>亮度 (L)</span>
                        <span className="font-mono">{inputHsl.l}%</span>
                      </Label>
                      <div className="relative mt-2">
                        <div
                          className="h-4 rounded mb-2"
                          style={{
                            background: `linear-gradient(to right, hsl(${inputHsl.h}, ${inputHsl.s}%, 0%), hsl(${inputHsl.h}, ${inputHsl.s}%, 50%), hsl(${inputHsl.h}, ${inputHsl.s}%, 100%))`,
                          }}
                        />
                        <Slider
                          id="hsl-l"
                          min={0}
                          max={100}
                          step={1}
                          value={[Number.parseInt(inputHsl.l) || 0]}
                          onValueChange={(value) => {
                            const newHsl = { ...inputHsl, l: value[0].toString() }
                            setInputHsl(newHsl)
                            updateFromHsl(Number.parseInt(inputHsl.h) || 0, Number.parseInt(inputHsl.s) || 0, value[0])
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {error && (
            <Alert className="mt-6" variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* 常用颜色 */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>常用颜色</CardTitle>
              <CardDescription>点击选择常用的颜色</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-8 md:grid-cols-12 gap-2">
                {[
                  "#FF0000",
                  "#00FF00",
                  "#0000FF",
                  "#FFFF00",
                  "#FF00FF",
                  "#00FFFF",
                  "#FFA500",
                  "#800080",
                  "#FFC0CB",
                  "#A52A2A",
                  "#808080",
                  "#000000",
                  "#FFFFFF",
                  "#F0F8FF",
                  "#FAEBD7",
                  "#7FFFD4",
                  "#F0FFFF",
                  "#F5F5DC",
                  "#FFE4C4",
                  "#000080",
                  "#FDF5E6",
                  "#FF6347",
                  "#40E0D0",
                  "#EE82EE",
                ].map((color) => (
                  <button
                    key={color}
                    className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-500 transition-colors"
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      updateFromHex(color)
                      setInputHex(color)
                    }}
                    title={color}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 颜色历史记录 */}
          {colorHistory.length > 0 && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>最近使用的颜色</CardTitle>
                <CardDescription>点击重新选择之前使用过的颜色</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
                  {colorHistory.map((color, index) => (
                    <button
                      key={`${color}-${index}`}
                      className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-500 transition-colors relative group"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        updateFromHex(color)
                        setInputHex(color)
                      }}
                      title={color}
                    >
                      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {color}
                      </span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
