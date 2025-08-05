"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Globe, MapPin, Wifi, Copy, RefreshCw, Loader2, AlertCircle, Server, Flag } from "lucide-react"

interface GeoInfo {
  asn: number
  countryName: string
  countryCodeAlpha2: string
  countryCodeAlpha3: string
  countryCodeNumeric: string
  regionName: string
  regionCode: string
  cityName: string
  latitude: number
  longitude: number
  cisp: string
}

interface APIResponse {
  eo: {
    geo: GeoInfo
    uuid: string
    clientIp: string
  }
}

interface IPInfo {
  geo: GeoInfo
  uuid: string
  clientIp: string
}

export default function IPInfoPage() {
  const [ipInfo, setIpInfo] = useState<IPInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchIPInfo = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/geo")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: APIResponse = await response.json()

      // 验证数据结构
      if (!data.eo || !data.eo.geo) {
        throw new Error("Invalid response format")
      }

      setIpInfo(data.eo)
    } catch (err) {
      console.error("Failed to fetch IP info:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch IP information")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIPInfo()
  }, [])

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "复制成功",
        description: `${label} 已复制到剪贴板`,
      })
    } catch (err) {
      toast({
        title: "复制失败",
        description: "无法复制到剪贴板",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* 顶部导航栏 */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回首页
                </Button>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">IP信息查询</h1>
              </div>
            </div>
            <Button onClick={fetchIPInfo} disabled={loading} size="sm">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              刷新
            </Button>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Wifi className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">获取您的IP地址信息</h2>
          <p className="text-gray-600">查看您当前的IP地址、地理位置和网络信息</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">正在获取IP信息...</span>
          </div>
        )}

        {error && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">获取失败</span>
              </div>
              <p className="text-red-600 mt-2">{error}</p>
              <Button onClick={fetchIPInfo} className="mt-4 bg-transparent" variant="outline">
                重试
              </Button>
            </CardContent>
          </Card>
        )}

        {ipInfo && !loading && (
          <div className="space-y-6">
            {/* 基本信息 */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Server className="w-5 h-5 text-blue-600" />
                  <span>基本信息</span>
                </CardTitle>
                <CardDescription>您的IP地址和网络基本信息</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">IP地址</p>
                      <p className="font-mono text-lg font-semibold">{ipInfo.clientIp}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(ipInfo.clientIp, "IP地址")}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">UUID</p>
                      <p className="font-mono text-sm font-semibold truncate">{ipInfo.uuid}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(ipInfo.uuid, "UUID")}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">ASN</p>
                      <p className="font-semibold">{ipInfo.geo.asn || "未知"}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(ipInfo.geo.asn.toString(), "ASN")}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">ISP</p>
                      <p className="font-semibold">{ipInfo.geo.cisp || "未知"}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(ipInfo.geo.cisp || "未知", "ISP")}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 地理位置信息 */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <span>地理位置</span>
                </CardTitle>
                <CardDescription>根据IP地址解析的地理位置信息</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">国家</p>
                      <p className="font-semibold">{ipInfo.geo.countryName}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(ipInfo.geo.countryName, "国家")}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">省份/地区</p>
                      <p className="font-semibold">{ipInfo.geo.regionName}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(ipInfo.geo.regionName, "省份")}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">城市</p>
                      <p className="font-semibold">{ipInfo.geo.cityName}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(ipInfo.geo.cityName, "城市")}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">地区代码</p>
                      <p className="font-mono font-semibold">{ipInfo.geo.regionCode}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(ipInfo.geo.regionCode, "地区代码")}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">经度</p>
                      <p className="font-mono font-semibold">{ipInfo.geo.longitude.toFixed(6)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(ipInfo.geo.longitude.toString(), "经度")}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">纬度</p>
                      <p className="font-mono font-semibold">{ipInfo.geo.latitude.toFixed(6)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(ipInfo.geo.latitude.toString(), "纬度")}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 国家代码信息 */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Flag className="w-5 h-5 text-purple-600" />
                  <span>国家代码</span>
                </CardTitle>
                <CardDescription>国际标准国家代码信息</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Alpha-2 代码</p>
                      <p className="font-mono text-lg font-semibold">{ipInfo.geo.countryCodeAlpha2}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(ipInfo.geo.countryCodeAlpha2, "Alpha-2代码")}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Alpha-3 代码</p>
                      <p className="font-mono text-lg font-semibold">{ipInfo.geo.countryCodeAlpha3}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(ipInfo.geo.countryCodeAlpha3, "Alpha-3代码")}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">数字代码</p>
                      <p className="font-mono text-lg font-semibold">{ipInfo.geo.countryCodeNumeric}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(ipInfo.geo.countryCodeNumeric, "数字代码")}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
