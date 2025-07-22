"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, Clock, ArrowLeft, Home, CheckCircle, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function TimestampConverter() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [timestamp, setTimestamp] = useState("")
  const [dateTime, setDateTime] = useState("")
  const [unit, setUnit] = useState("seconds")
  const [timezone, setTimezone] = useState("local")
  const [convertedDateTime, setConvertedDateTime] = useState("")
  const [convertedTimestamp, setConvertedTimestamp] = useState("")
  const [error, setError] = useState("")
  const [copied, setCopied] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const getCurrentTimestamp = () => {
    const now = new Date()
    let ts = now.getTime()

    if (unit === "seconds") {
      ts = Math.floor(ts / 1000)
    }

    setTimestamp(ts.toString())
  }

  const getCurrentDateTime = () => {
    const now = new Date()
    const formatted = now.toISOString().slice(0, 19)
    setDateTime(formatted)
  }

  const convertTimestampToDateTime = () => {
    if (!timestamp.trim()) {
      setError("请输入时间戳")
      return
    }

    try {
      let ts = Number.parseInt(timestamp)

      if (isNaN(ts)) {
        setError("请输入有效的数字时间戳")
        return
      }

      // 如果是秒级时间戳，转换为毫秒
      if (unit === "seconds") {
        ts = ts * 1000
      }

      const date = new Date(ts)

      if (isNaN(date.getTime())) {
        setError("无效的时间戳")
        return
      }

      let formatted = ""
      if (timezone === "utc") {
        formatted = date.toISOString().replace("T", " ").slice(0, 19) + " UTC"
      } else {
        formatted = date.toLocaleString("zh-CN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      }

      setConvertedDateTime(formatted)
      setError("")

      toast({
        title: "转换成功",
        description: "时间戳已转换为日期时间",
      })
    } catch (err) {
      setError("时间戳转换失败")
    }
  }

  const convertDateTimeToTimestamp = () => {
    if (!dateTime.trim()) {
      setError("请输入日期时间")
      return
    }

    try {
      const date = new Date(dateTime)

      if (isNaN(date.getTime())) {
        setError("请输入有效的日期时间格式")
        return
      }

      let ts = date.getTime()

      if (unit === "seconds") {
        ts = Math.floor(ts / 1000)
      }

      setConvertedTimestamp(ts.toString())
      setError("")

      toast({
        title: "转换成功",
        description: "日期时间已转换为时间戳",
      })
    } catch (err) {
      setError("日期时间转换失败")
    }
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

  const clearAll = () => {
    setTimestamp("")
    setDateTime("")
    setConvertedDateTime("")
    setConvertedTimestamp("")
    setError("")
    setCopied("")
  }

  const formatCurrentTime = (date: Date) => {
    return {
      local: date.toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }),
      utc: date.toISOString().replace("T", " ").slice(0, 19) + " UTC",
      timestamp: Math.floor(date.getTime() / 1000),
      timestampMs: date.getTime(),
    }
  }

  const currentTimeInfo = formatCurrentTime(currentTime)

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100">
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
              <h1 className="text-2xl font-bold text-gray-900">时间戳转换</h1>
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
            <p className="text-gray-600">时间戳与日期时间互转工具</p>
          </div>

          {/* 当前时间显示 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                当前时间
              </CardTitle>
              <CardDescription>实时显示当前时间和时间戳</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <Label className="text-sm text-gray-600">本地时间</Label>
                  <p className="font-mono text-lg">{currentTimeInfo.local}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <Label className="text-sm text-gray-600">UTC时间</Label>
                  <p className="font-mono text-lg">{currentTimeInfo.utc}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <Label className="text-sm text-gray-600">时间戳(秒)</Label>
                  <p className="font-mono text-lg">{currentTimeInfo.timestamp}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <Label className="text-sm text-gray-600">时间戳(毫秒)</Label>
                  <p className="font-mono text-lg">{currentTimeInfo.timestampMs}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* 时间戳转日期时间 */}
            <Card>
              <CardHeader>
                <CardTitle>时间戳 → 日期时间</CardTitle>
                <CardDescription>将时间戳转换为可读的日期时间</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="timestamp-unit">时间戳单位</Label>
                    <Select value={unit} onValueChange={setUnit}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="seconds">秒 (10位)</SelectItem>
                        <SelectItem value="milliseconds">毫秒 (13位)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="timezone">时区</Label>
                    <Select value={timezone} onValueChange={setTimezone}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="local">本地时区</SelectItem>
                        <SelectItem value="utc">UTC时区</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="timestamp-input">时间戳</Label>
                  <Input
                    id="timestamp-input"
                    type="text"
                    placeholder="输入时间戳..."
                    value={timestamp}
                    onChange={(e) => setTimestamp(e.target.value)}
                    className="font-mono"
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={convertTimestampToDateTime} className="flex-1">
                    转换
                  </Button>
                  <Button onClick={getCurrentTimestamp} variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    当前
                  </Button>
                </div>

                {convertedDateTime && (
                  <div className="space-y-2">
                    <Label>转换结果</Label>
                    <div className="flex gap-2">
                      <Input value={convertedDateTime} readOnly className="font-mono" />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(convertedDateTime, "日期时间")}
                      >
                        {copied === "日期时间" ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 日期时间转时间戳 */}
            <Card>
              <CardHeader>
                <CardTitle>日期时间 → 时间戳</CardTitle>
                <CardDescription>将日期时间转换为时间戳</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="datetime-input">日期时间</Label>
                  <Input
                    id="datetime-input"
                    type="datetime-local"
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">也可以输入格式如: 2024-01-01 12:00:00</p>
                </div>

                <div className="flex gap-2">
                  <Button onClick={convertDateTimeToTimestamp} className="flex-1">
                    转换
                  </Button>
                  <Button onClick={getCurrentDateTime} variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    当前
                  </Button>
                </div>

                {convertedTimestamp && (
                  <div className="space-y-2">
                    <Label>转换结果</Label>
                    <div className="flex gap-2">
                      <Input value={convertedTimestamp} readOnly className="font-mono" />
                      <Button size="sm" variant="outline" onClick={() => copyToClipboard(convertedTimestamp, "时间戳")}>
                        {copied === "时间戳" ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
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

          {/* 快捷操作 */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>快捷操作</CardTitle>
              <CardDescription>常用的时间戳快捷操作</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent"
                  onClick={() => {
                    const ts = Math.floor(Date.now() / 1000)
                    setTimestamp(ts.toString())
                    setUnit("seconds")
                  }}
                >
                  <Clock className="w-6 h-6" />
                  <div className="text-center">
                    <div className="font-semibold">当前秒级</div>
                    <div className="text-xs text-gray-500">获取当前秒级时间戳</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent"
                  onClick={() => {
                    const ts = Date.now()
                    setTimestamp(ts.toString())
                    setUnit("milliseconds")
                  }}
                >
                  <Clock className="w-6 h-6" />
                  <div className="text-center">
                    <div className="font-semibold">当前毫秒级</div>
                    <div className="text-xs text-gray-500">获取当前毫秒级时间戳</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent"
                  onClick={() => {
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    const ts = Math.floor(today.getTime() / 1000)
                    setTimestamp(ts.toString())
                    setUnit("seconds")
                  }}
                >
                  <Clock className="w-6 h-6" />
                  <div className="text-center">
                    <div className="font-semibold">今日开始</div>
                    <div className="text-xs text-gray-500">今天00:00:00的时间戳</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent"
                  onClick={clearAll}
                >
                  <RefreshCw className="w-6 h-6" />
                  <div className="text-center">
                    <div className="font-semibold">清空所有</div>
                    <div className="text-xs text-gray-500">清空所有输入和结果</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 使用说明 */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>使用说明</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">时间戳格式</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 秒级时间戳：10位数字 (如: 1640995200)</li>
                    <li>• 毫秒级时间戳：13位数字 (如: 1640995200000)</li>
                    <li>• Unix时间戳从1970年1月1日开始计算</li>
                    <li>• 支持正负时间戳</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">日期时间格式</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 标准格式：2024-01-01 12:00:00</li>
                    <li>• ISO格式：2024-01-01T12:00:00</li>
                    <li>• 支持本地时区和UTC时区</li>
                    <li>• 自动处理时区转换</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
