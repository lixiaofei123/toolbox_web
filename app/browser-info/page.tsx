"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Monitor, Smartphone, Cpu, Globe, Shield, Copy, RefreshCw, Eye, MapPin, Wifi, Home } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"

interface BrowserInfo {
  // 基本信息
  userAgent: string
  browser: {
    name: string
    version: string
    engine: string
  }
  os: {
    name: string
    version: string
    architecture: string
  }
  device: {
    type: string
    vendor: string
    model: string
  }

  // 屏幕信息
  screen: {
    width: number
    height: number
    availWidth: number
    availHeight: number
    colorDepth: number
    pixelDepth: number
    devicePixelRatio: number
  }

  // 网络信息
  network: {
    connection?: string
    effectiveType?: string
    downlink?: number
    rtt?: number
  }

  // 硬件信息
  hardware: {
    cpuCores: number
    memory?: number
    platform: string
    maxTouchPoints: number
  }

  // 浏览器功能
  features: {
    cookies: boolean
    localStorage: boolean
    sessionStorage: boolean
    indexedDB: boolean
    webGL: boolean
    canvas: boolean
    webRTC: boolean
    geolocation: boolean
    notifications: boolean
    serviceWorker: boolean
  }

  // 时区和语言
  locale: {
    language: string
    languages: string[]
    timezone: string
    timezoneOffset: number
  }

  // 浏览器指纹
  fingerprint: string
}

export default function BrowserInfoPage() {
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo | null>(null)
  const [loading, setLoading] = useState(true)

  // 解析User Agent
  const parseUserAgent = (ua: string) => {
    const browser = { name: "Unknown", version: "Unknown", engine: "Unknown" }
    const os = { name: "Unknown", version: "Unknown", architecture: "Unknown" }
    const device = { type: "Desktop", vendor: "Unknown", model: "Unknown" }

    // 浏览器检测
    if (ua.includes("Chrome") && !ua.includes("Edg")) {
      browser.name = "Chrome"
      browser.engine = "Blink"
      const match = ua.match(/Chrome\/([0-9.]+)/)
      if (match) browser.version = match[1]
    } else if (ua.includes("Firefox")) {
      browser.name = "Firefox"
      browser.engine = "Gecko"
      const match = ua.match(/Firefox\/([0-9.]+)/)
      if (match) browser.version = match[1]
    } else if (ua.includes("Safari") && !ua.includes("Chrome")) {
      browser.name = "Safari"
      browser.engine = "WebKit"
      const match = ua.match(/Version\/([0-9.]+)/)
      if (match) browser.version = match[1]
    } else if (ua.includes("Edg")) {
      browser.name = "Edge"
      browser.engine = "Blink"
      const match = ua.match(/Edg\/([0-9.]+)/)
      if (match) browser.version = match[1]
    }

    // 操作系统检测
    if (ua.includes("Windows NT")) {
      os.name = "Windows"
      const match = ua.match(/Windows NT ([0-9.]+)/)
      if (match) {
        const version = match[1]
        switch (version) {
          case "10.0":
            os.version = "10/11"
            break
          case "6.3":
            os.version = "8.1"
            break
          case "6.2":
            os.version = "8"
            break
          case "6.1":
            os.version = "7"
            break
          default:
            os.version = version
        }
      }
      os.architecture = ua.includes("WOW64") || ua.includes("Win64") ? "x64" : "x86"
    } else if (ua.includes("Mac OS X")) {
      os.name = "macOS"
      const match = ua.match(/Mac OS X ([0-9_]+)/)
      if (match) os.version = match[1].replace(/_/g, ".")
      os.architecture = "x64"
    } else if (ua.includes("Linux")) {
      os.name = "Linux"
      os.architecture = ua.includes("x86_64") ? "x64" : "x86"
    } else if (ua.includes("Android")) {
      os.name = "Android"
      const match = ua.match(/Android ([0-9.]+)/)
      if (match) os.version = match[1]
      device.type = "Mobile"
    } else if (ua.includes("iPhone") || ua.includes("iPad")) {
      os.name = "iOS"
      const match = ua.match(/OS ([0-9_]+)/)
      if (match) os.version = match[1].replace(/_/g, ".")
      device.type = ua.includes("iPad") ? "Tablet" : "Mobile"
      device.vendor = "Apple"
    }

    return { browser, os, device }
  }

  // 检测浏览器功能
  const detectFeatures = () => {
    return {
      cookies: navigator.cookieEnabled,
      localStorage: typeof Storage !== "undefined",
      sessionStorage: typeof Storage !== "undefined",
      indexedDB: "indexedDB" in window,
      webGL: (() => {
        try {
          const canvas = document.createElement("canvas")
          return !!(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
        } catch {
          return false
        }
      })(),
      canvas: (() => {
        try {
          const canvas = document.createElement("canvas")
          return !!(canvas.getContext && canvas.getContext("2d"))
        } catch {
          return false
        }
      })(),
      webRTC: "RTCPeerConnection" in window,
      geolocation: "geolocation" in navigator,
      notifications: "Notification" in window,
      serviceWorker: "serviceWorker" in navigator,
    }
  }

  // 生成浏览器指纹
  const generateFingerprint = async (info: Partial<BrowserInfo>) => {
    const components = [
      info.userAgent,
      info.screen?.width + "x" + info.screen?.height,
      info.screen?.colorDepth,
      info.locale?.timezone,
      info.locale?.language,
      info.hardware?.cpuCores,
      JSON.stringify(info.features),
      navigator.platform,
    ]

    // 添加Canvas指纹
    try {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.textBaseline = "top"
        ctx.font = "14px Arial"
        ctx.fillText("Browser fingerprint test 🔍", 2, 2)
        components.push(canvas.toDataURL())
      }
    } catch (e) {
      // Canvas可能被阻止
    }

    // 添加WebGL指纹
    try {
      const canvas = document.createElement("canvas")
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
      if (gl) {
        const debugInfo = gl.getExtension("WEBGL_debug_renderer_info")
        if (debugInfo) {
          components.push(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL))
          components.push(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL))
        }
      }
    } catch (e) {
      // WebGL可能被阻止
    }

    // 生成哈希
    const text = components.join("|")
    const encoder = new TextEncoder()
    const data = encoder.encode(text)
    const hashBuffer = await crypto.subtle.digest("SHA-256", data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  }

  // 获取浏览器信息
  const getBrowserInfo = async () => {
    setLoading(true)

    try {
      const ua = navigator.userAgent
      const { browser, os, device } = parseUserAgent(ua)

      // 网络信息
      const connection =
        (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
      const network = {
        connection: connection?.type || "Unknown",
        effectiveType: connection?.effectiveType || "Unknown",
        downlink: connection?.downlink,
        rtt: connection?.rtt,
      }

      // 硬件信息
      const hardware = {
        cpuCores: navigator.hardwareConcurrency || 1,
        memory: (navigator as any).deviceMemory,
        platform: navigator.platform,
        maxTouchPoints: navigator.maxTouchPoints || 0,
      }

      // 屏幕信息
      const screen = {
        width: window.screen.width,
        height: window.screen.height,
        availWidth: window.screen.availWidth,
        availHeight: window.screen.availHeight,
        colorDepth: window.screen.colorDepth,
        pixelDepth: window.screen.pixelDepth,
        devicePixelRatio: window.devicePixelRatio || 1,
      }

      // 语言和时区
      const locale = {
        language: navigator.language,
        languages: Array.from(navigator.languages),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timezoneOffset: new Date().getTimezoneOffset(),
      }

      const features = detectFeatures()

      const info: Partial<BrowserInfo> = {
        userAgent: ua,
        browser,
        os,
        device,
        screen,
        network,
        hardware,
        features,
        locale,
      }

      const fingerprint = await generateFingerprint(info)

      setBrowserInfo({
        ...info,
        fingerprint,
      } as BrowserInfo)
    } catch (error) {
      console.error("获取浏览器信息失败:", error)
      toast({
        title: "错误",
        description: "获取浏览器信息失败",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getBrowserInfo()
  }, [])

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast({
          title: "复制成功",
          description: `${label}已复制到剪贴板`,
        })
      })
      .catch(() => {
        toast({
          title: "复制失败",
          description: "无法复制到剪贴板",
          variant: "destructive",
        })
      })
  }

  const InfoRow = ({ label, value, copyable = false }: { label: string; value: string; copyable?: boolean }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
      <span className="text-sm text-gray-600 font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-mono bg-gray-50 px-2 py-1 rounded text-right max-w-xs truncate">{value}</span>
        {copyable && (
          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(value, label)} className="h-6 w-6 p-0">
            <Copy className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  )

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
                <Monitor className="w-5 h-5 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">浏览器信息检测</h1>
              </div>
            </div>
            <Badge variant="secondary">
              <Eye className="w-3 h-3 mr-1" />
              系统检测
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 gap-6">
          {loading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
                  <p className="text-gray-600">正在检测浏览器信息...</p>
                </div>
              </CardContent>
            </Card>
          ) : !browserInfo ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-600 mb-4">无法获取浏览器信息</p>
                <Button onClick={getBrowserInfo}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  重新检测
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>浏览器详细信息</CardTitle>
                  <Button onClick={getBrowserInfo} variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    重新检测
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="basic" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="basic">基本信息</TabsTrigger>
                    <TabsTrigger value="hardware">硬件信息</TabsTrigger>
                    <TabsTrigger value="features">浏览器功能</TabsTrigger>
                    <TabsTrigger value="network">网络信息</TabsTrigger>
                    <TabsTrigger value="fingerprint">浏览器指纹</TabsTrigger>
                  </TabsList>

                  {/* 基本信息 */}
                  <TabsContent value="basic" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <Globe className="w-5 h-5" />
                            浏览器信息
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <InfoRow
                            label="浏览器"
                            value={`${browserInfo.browser.name} ${browserInfo.browser.version}`}
                          />
                          <InfoRow label="内核" value={browserInfo.browser.engine} />
                          <InfoRow label="User Agent" value={browserInfo.userAgent} copyable />
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <Monitor className="w-5 h-5" />
                            操作系统
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <InfoRow label="系统" value={`${browserInfo.os.name} ${browserInfo.os.version}`} />
                          <InfoRow label="架构" value={browserInfo.os.architecture} />
                          <InfoRow label="平台" value={browserInfo.hardware.platform} />
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <Smartphone className="w-5 h-5" />
                            设备信息
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <InfoRow label="设备类型" value={browserInfo.device.type} />
                          <InfoRow label="厂商" value={browserInfo.device.vendor} />
                          <InfoRow label="触摸点" value={browserInfo.hardware.maxTouchPoints.toString()} />
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <MapPin className="w-5 h-5" />
                            语言和时区
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <InfoRow label="语言" value={browserInfo.locale.language} />
                          <InfoRow label="时区" value={browserInfo.locale.timezone} />
                          <InfoRow label="时区偏移" value={`${browserInfo.locale.timezoneOffset} 分钟`} />
                          <div className="pt-2">
                            <span className="text-sm text-gray-600 font-medium">支持语言</span>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {browserInfo.locale.languages.map((lang, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {lang}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  {/* 硬件信息 */}
                  <TabsContent value="hardware" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <Cpu className="w-5 h-5" />
                            处理器信息
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <InfoRow label="CPU 核心数" value={browserInfo.hardware.cpuCores.toString()} />
                          <InfoRow
                            label="内存"
                            value={browserInfo.hardware.memory ? `${browserInfo.hardware.memory} GB` : "未知"}
                          />
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <Monitor className="w-5 h-5" />
                            屏幕信息
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <InfoRow
                            label="屏幕分辨率"
                            value={`${browserInfo.screen.width} × ${browserInfo.screen.height}`}
                          />
                          <InfoRow
                            label="可用分辨率"
                            value={`${browserInfo.screen.availWidth} × ${browserInfo.screen.availHeight}`}
                          />
                          <InfoRow label="颜色深度" value={`${browserInfo.screen.colorDepth} 位`} />
                          <InfoRow label="像素深度" value={`${browserInfo.screen.pixelDepth} 位`} />
                          <InfoRow label="设备像素比" value={browserInfo.screen.devicePixelRatio.toString()} />
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  {/* 浏览器功能 */}
                  <TabsContent value="features" className="space-y-6">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Shield className="w-5 h-5" />
                          浏览器功能支持
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {Object.entries(browserInfo.features).map(([feature, supported]) => (
                            <div key={feature} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span className="text-sm font-medium capitalize">
                                {feature.replace(/([A-Z])/g, " $1").trim()}
                              </span>
                              <Badge variant={supported ? "default" : "secondary"}>
                                {supported ? "支持" : "不支持"}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* 网络信息 */}
                  <TabsContent value="network" className="space-y-6">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Wifi className="w-5 h-5" />
                          网络连接信息
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <InfoRow label="连接类型" value={browserInfo.network.connection || "未知"} />
                        <InfoRow label="有效连接类型" value={browserInfo.network.effectiveType || "未知"} />
                        <InfoRow
                          label="下行速度"
                          value={browserInfo.network.downlink ? `${browserInfo.network.downlink} Mbps` : "未知"}
                        />
                        <InfoRow
                          label="往返时间"
                          value={browserInfo.network.rtt ? `${browserInfo.network.rtt} ms` : "未知"}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* 浏览器指纹 */}
                  <TabsContent value="fingerprint" className="space-y-6">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Eye className="w-5 h-5" />
                          浏览器指纹
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-600">指纹哈希值</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(browserInfo.fingerprint, "浏览器指纹")}
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              复制
                            </Button>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-lg font-mono text-sm break-all border">
                            {browserInfo.fingerprint}
                          </div>
                        </div>

                        <Separator />

                        <div className="text-sm text-gray-600 space-y-3">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">什么是浏览器指纹？</h4>
                            <p>浏览器指纹是通过收集浏览器和设备的各种特征信息生成的唯一标识符，包括：</p>
                          </div>
                          <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>User Agent 字符串</li>
                            <li>屏幕分辨率和颜色深度</li>
                            <li>时区和语言设置</li>
                            <li>已安装的插件和字体</li>
                            <li>Canvas 和 WebGL 渲染特征</li>
                            <li>硬件信息（CPU核心数等）</li>
                          </ul>
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                            <p className="text-amber-800">
                              <strong>提示：</strong>不同的浏览器指纹算法可能生成不同的结果，此工具仅供参考和学习使用。
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
