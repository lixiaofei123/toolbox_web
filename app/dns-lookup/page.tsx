"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, Search, Globe, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface DNSRecord {
  name: string
  type: number
  TTL: number
  data: string
}

interface DNSResponse {
  Status: number
  TC: boolean
  RD: boolean
  RA: boolean
  AD: boolean
  CD: boolean
  Question: Array<{
    name: string
    type: number
  }>
  Answer?: DNSRecord[]
  Authority?: DNSRecord[]
  Additional?: DNSRecord[]
}

interface QueryResult {
  type: string
  typeCode: number
  records: DNSRecord[]
  status: "success" | "error" | "no-records"
  error?: string
}

const DNS_TYPES = {
  A: 1,
  AAAA: 28,
  TXT: 16,
  CNAME: 5,
  MX: 15,
}

const TYPE_NAMES: { [key: number]: string } = {
  1: "A",
  28: "AAAA",
  16: "TXT",
  5: "CNAME",
  15: "MX",
}

export default function DNSLookupPage() {
  const [domain, setDomain] = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<QueryResult[]>([])
  const [queryTime, setQueryTime] = useState<number>(0)

  const queryDNS = async (domain: string, type: number): Promise<QueryResult> => {
    try {
      const response = await fetch(`https://dns.alidns.com/resolve?name=${encodeURIComponent(domain)}&type=${type}`, {
        method: "GET",
        headers: {
          Accept: "application/dns-json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data: DNSResponse = await response.json()

      return {
        type: TYPE_NAMES[type],
        typeCode: type,
        records: data.Answer || [],
        status: data.Status === 0 ? (data.Answer && data.Answer.length > 0 ? "success" : "no-records") : "error",
        error: data.Status !== 0 ? `DNS Status: ${data.Status}` : undefined,
      }
    } catch (error) {
      return {
        type: TYPE_NAMES[type],
        typeCode: type,
        records: [],
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  const handleQuery = async () => {
    if (!domain.trim()) return

    setLoading(true)
    setResults([])

    const startTime = Date.now()

    try {
      // 并行查询所有DNS记录类型
      const queries = Object.entries(DNS_TYPES).map(([typeName, typeCode]) => queryDNS(domain.trim(), typeCode))

      const queryResults = await Promise.all(queries)
      setResults(queryResults)

      const endTime = Date.now()
      setQueryTime(endTime - startTime)
    } catch (error) {
      console.error("Query failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const formatTTL = (ttl: number) => {
    if (ttl < 60) return `${ttl}s`
    if (ttl < 3600) return `${Math.floor(ttl / 60)}m ${ttl % 60}s`
    if (ttl < 86400) return `${Math.floor(ttl / 3600)}h ${Math.floor((ttl % 3600) / 60)}m`
    return `${Math.floor(ttl / 86400)}d ${Math.floor((ttl % 86400) / 3600)}h`
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />
      case "no-records":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800"
      case "error":
        return "bg-red-100 text-red-800"
      case "no-records":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <a href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">工具</span>
                </div>
                <span className="font-semibold text-gray-900">在线工具箱</span>
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                返回首页
              </a>
            </div>
          </div>
        </div>
      </nav>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-cyan-100">
                <Globe className="w-8 h-8 text-cyan-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">DNS 查询工具</h1>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              使用阿里云 DNS over HTTPS 服务查询域名解析记录，支持 A、AAAA、TXT、CNAME、MX 记录类型
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                域名查询
              </CardTitle>
              <CardDescription>输入要查询的域名，系统将自动查询所有支持的记录类型</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Input
                  placeholder="请输入域名，例如：example.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleQuery()}
                  className="flex-1"
                />
                <Button onClick={handleQuery} disabled={loading || !domain.trim()} className="px-8">
                  {loading ? "查询中..." : "查询"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {results.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-900">查询结果</h2>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  查询耗时: {queryTime}ms
                </div>
              </div>

              <div className="grid gap-6">
                {results.map((result) => (
                  <Card key={result.type} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="font-mono">
                            {result.type}
                          </Badge>
                          {getStatusIcon(result.status)}
                          <span className="text-sm text-gray-600">
                            {result.status === "success"
                              ? `${result.records.length} 条记录`
                              : result.status === "no-records"
                                ? "无记录"
                                : "查询失败"}
                          </span>
                        </div>
                        <Badge className={getStatusColor(result.status)}>
                          {result.status === "success" ? "成功" : result.status === "no-records" ? "无记录" : "失败"}
                        </Badge>
                      </div>
                    </CardHeader>

                    {result.status === "error" && result.error && (
                      <CardContent className="pt-0">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-red-700 text-sm">{result.error}</p>
                        </div>
                      </CardContent>
                    )}

                    {result.status === "success" && result.records.length > 0 && (
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          {result.records.map((record, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-sm font-medium text-gray-700">{record.name}</span>
                                    <Badge variant="secondary" className="text-xs">
                                      TTL: {formatTTL(record.TTL)}
                                    </Badge>
                                  </div>
                                  <div className="font-mono text-sm bg-white rounded border p-2 break-all">
                                    {record.data}
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(record.data)}
                                  className="flex-shrink-0"
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-lg">支持的记录类型</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">A</Badge>
                  <span className="text-sm text-gray-600">IPv4 地址记录</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">AAAA</Badge>
                  <span className="text-sm text-gray-600">IPv6 地址记录</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">TXT</Badge>
                  <span className="text-sm text-gray-600">文本记录</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">CNAME</Badge>
                  <span className="text-sm text-gray-600">别名记录</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">MX</Badge>
                  <span className="text-sm text-gray-600">邮件交换记录</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
