"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Globe, MapPin, Wifi, Hash, RefreshCw, Copy, Home, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

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

interface IPInfoResponse {
  geo: GeoInfo
  uuid: string
  clientIp: string
}

export default function IPInfoPage() {
  const [ipInfo, setIpInfo] = useState<IPInfoResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchIPInfo = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/geo")
      if (!response.ok) {
        throw new Error("获取IP信息失败")
      }

      const data = await response.json()
      setIpInfo(data.geo ? data : null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取IP信息失败")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "复制成功",
        description: `${label} 已复制到剪贴板`,
      })
    })
  }

  useEffect(() => {
    fetchIPInfo()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* 顶部导航栏 */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <Home className="h-4 w-4" />
                <span className="font-medium">返回首页</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">IP信息查询</h1>
            </div>
            <div className="w-24"></div>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Globe className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">IP信息查询</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">获取您的公网IP地址和详细的地理位置信息</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* 控制面板 */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                获取IP信息
              </CardTitle>
              <CardDescription>点击刷新按钮获取最新的IP地址和地理位置信息</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={fetchIPInfo} disabled={loading} className="w-full sm:w-auto">
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    获取中...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    刷新IP信息
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* 错误显示 */}
          {error && (
            <Card className="border-red-200 bg-red-50/80 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="text-red-600 text-center">
                  <p className="font-medium">获取失败</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* IP信息显示 */}
          {ipInfo && (
            <div className="grid gap-6 md:grid-cols-2">
              {/* 基本IP信息 */}
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wifi className="h-5 w-5" />
                    基本信息
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">IP地址</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-mono">
                        {ipInfo.clientIp}
                      </Badge>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(ipInfo.clientIp, "IP地址")}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">UUID</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        {ipInfo.uuid.slice(0, 8)}...
                      </Badge>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(ipInfo.uuid, "UUID")}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">ASN</span>
                    <Badge variant="secondary">{ipInfo.geo.asn || "Unknown"}</Badge>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">ISP</span>
                    <Badge variant="secondary">{ipInfo.geo.cisp || "Unknown"}</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* 地理位置信息 */}
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    地理位置
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">国家</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{ipInfo.geo.countryName}</Badge>
                      <Badge variant="outline" className="text-xs">
                        {ipInfo.geo.countryCodeAlpha2}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">省份/地区</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{ipInfo.geo.regionName}</Badge>
                      <Badge variant="outline" className="text-xs">
                        {ipInfo.geo.regionCode}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">城市</span>
                    <Badge variant="secondary">{ipInfo.geo.cityName}</Badge>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">经纬度</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        {ipInfo.geo.latitude.toFixed(6)}, {ipInfo.geo.longitude.toFixed(6)}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(`${ipInfo.geo.latitude}, ${ipInfo.geo.longitude}`, "经纬度")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 国家代码信息 */}
              <Card className="md:col-span-2 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hash className="h-5 w-5" />
                    国家代码信息
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-500 mb-1">Alpha-2</p>
                      <Badge variant="secondary" className="text-lg px-3 py-1">
                        {ipInfo.geo.countryCodeAlpha2}
                      </Badge>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-500 mb-1">Alpha-3</p>
                      <Badge variant="secondary" className="text-lg px-3 py-1">
                        {ipInfo.geo.countryCodeAlpha3}
                      </Badge>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-500 mb-1">Numeric</p>
                      <Badge variant="secondary" className="text-lg px-3 py-1">
                        {ipInfo.geo.countryCodeNumeric}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 加载状态 */}
          {loading && !ipInfo && (
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
                  <p className="text-gray-600">正在获取IP信息...</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
