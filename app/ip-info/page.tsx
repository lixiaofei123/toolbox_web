"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowLeft,
  Globe,
  MapPin,
  Wifi,
  Copy,
  RefreshCw,
  Loader2,
  AlertTriangle,
  Server,
  Flag,
  Map,
} from "lucide-react"

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

// 假数据，用于接口失败时的fallback
const getFakeData = (): IPInfo => ({
  geo: {
    asn: 4134,
    countryName: "China",
    countryCodeAlpha2: "CN",
    countryCodeAlpha3: "CHN",
    countryCodeNumeric: "156",
    regionName: "Beijing",
    regionCode: "CN-BJ",
    cityName: "Beijing",
    latitude: 39.9042,
    longitude: 116.4074,
    cisp: "China Telecom",
  },
  uuid: "fake-uuid-12345678901234567890",
  clientIp: "192.168.1.1",
})

export default function IPInfoPage() {
  const [ipInfo, setIpInfo] = useState<IPInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [isUsingFakeData, setIsUsingFakeData] = useState(false)
  const { toast } = useToast()

  const fetchIPInfo = async () => {
    try {
      setLoading(true)
      setIsUsingFakeData(false)

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
      // 使用假数据作为fallback
      setIpInfo(getFakeData())
      setIsUsingFakeData(true)
      toast({
        title: "获取失败",
        description: "无法获取真实IP信息，显示示例数据",
        variant: "destructive",
      })
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
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
            <Wifi className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">获取您的IP地址信息</h2>
          <p className="text-gray-600 text-sm">查看您当前的IP地址、地理位置和网络信息</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">正在获取IP信息...</span>
          </div>
        )}

        {ipInfo && !loading && (
          <div className="space-y-4">
            {/* 假数据提示 */}
            {isUsingFakeData && (
              <Card className="bg-amber-50 border-amber-200">
                <CardContent className="pt-4">
                  <div className="flex items-center space-x-2 text-amber-700">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-medium">注意：当前显示的是示例数据，无法获取真实IP信息</span>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* 左侧：基本信息和地理位置 */}
              <div className="space-y-4">
                {/* 基本信息 */}
                <Card className="bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2 text-base">
                      <Server className="w-4 h-4 text-blue-600" />
                      <span>基本信息</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <p className="text-xs text-gray-600">IP地址</p>
                          <p className="font-mono text-sm font-semibold">{ipInfo.clientIp}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(ipInfo.clientIp, "IP地址")}>
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-600">UUID</p>
                          <p className="font-mono text-xs font-semibold truncate">{ipInfo.uuid}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(ipInfo.uuid, "UUID")}>
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div>
                            <p className="text-xs text-gray-600">ASN</p>
                            <p className="text-sm font-semibold">{ipInfo.geo.asn || "未知"}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-600">ISP</p>
                            <p className="text-sm font-semibold truncate">{ipInfo.geo.cisp || "未知"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 地理位置信息 */}
                <Card className="bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2 text-base">
                      <MapPin className="w-4 h-4 text-green-600" />
                      <span>地理位置</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 gap-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-2 bg-gray-50 rounded">
                          <p className="text-xs text-gray-600">国家</p>
                          <div className="flex items-center space-x-1">
                            <p className="text-sm font-semibold">{ipInfo.geo.countryName}</p>
                            <Badge variant="outline" className="text-xs px-1 py-0">
                              {ipInfo.geo.countryCodeAlpha2}
                            </Badge>
                          </div>
                        </div>

                        <div className="p-2 bg-gray-50 rounded">
                          <p className="text-xs text-gray-600">省份</p>
                          <p className="text-sm font-semibold">{ipInfo.geo.regionName}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-2 bg-gray-50 rounded">
                          <p className="text-xs text-gray-600">城市</p>
                          <p className="text-sm font-semibold">{ipInfo.geo.cityName}</p>
                        </div>

                        <div className="p-2 bg-gray-50 rounded">
                          <p className="text-xs text-gray-600">地区代码</p>
                          <p className="font-mono text-sm font-semibold">{ipInfo.geo.regionCode}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div>
                            <p className="text-xs text-gray-600">经度</p>
                            <p className="font-mono text-sm font-semibold">{ipInfo.geo.longitude.toFixed(6)}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(ipInfo.geo.longitude.toString(), "经度")}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>

                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div>
                            <p className="text-xs text-gray-600">纬度</p>
                            <p className="font-mono text-sm font-semibold">{ipInfo.geo.latitude.toFixed(6)}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(ipInfo.geo.latitude.toString(), "纬度")}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 国家代码信息 */}
                <Card className="bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2 text-base">
                      <Flag className="w-4 h-4 text-purple-600" />
                      <span>国家代码</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="text-xs text-gray-600 mb-1">Alpha-2</p>
                        <p className="font-mono text-sm font-semibold">{ipInfo.geo.countryCodeAlpha2}</p>
                      </div>

                      <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="text-xs text-gray-600 mb-1">Alpha-3</p>
                        <p className="font-mono text-sm font-semibold">{ipInfo.geo.countryCodeAlpha3}</p>
                      </div>

                      <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="text-xs text-gray-600 mb-1">数字</p>
                        <p className="font-mono text-sm font-semibold">{ipInfo.geo.countryCodeNumeric}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 右侧：地图 */}
              <div className="space-y-4">
                <Card className="bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2 text-base">
                      <Map className="w-4 h-4 text-red-600" />
                      <span>位置地图</span>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      基于经纬度 ({ipInfo.geo.latitude.toFixed(4)}, {ipInfo.geo.longitude.toFixed(4)}) 显示的位置
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-96 w-full rounded-b-lg overflow-hidden">
                      <iframe
                        src={`https://api.map.baidu.com/marker?location=${ipInfo.geo.latitude},${ipInfo.geo.longitude}&title=我的位置&&output=html&src=webapp.baidu.openAPIdemo`}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        title="位置地图"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* 地图链接 */}
                <Card className="bg-white/80 backdrop-blur-sm">
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">在其他地图中查看：</p>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" asChild className="text-xs bg-transparent">
                          <a
                            href={`https://www.google.com/maps?q=${ipInfo.geo.latitude},${ipInfo.geo.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Google Maps
                          </a>
                        </Button>
                        <Button variant="outline" size="sm" asChild className="text-xs bg-transparent">
                          <a
                            href={`https://www.openstreetmap.org/?mlat=${ipInfo.geo.latitude}&mlon=${ipInfo.geo.longitude}&zoom=12`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            OpenStreetMap
                          </a>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(`${ipInfo.geo.latitude},${ipInfo.geo.longitude}`, "经纬度坐标")
                          }
                          className="text-xs"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          复制坐标
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
