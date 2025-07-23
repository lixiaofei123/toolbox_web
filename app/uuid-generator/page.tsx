"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Copy, Fingerprint, RefreshCw, Download, Trash2 } from "lucide-react"

// UUID v4 生成函数
function generateUUIDv4(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// UUID v1 生成函数（简化版）
function generateUUIDv1(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(16).substring(2, 15)
  const timestampHex = timestamp.toString(16).padStart(12, "0")

  return [
    timestampHex.substring(0, 8),
    timestampHex.substring(8, 12),
    "1" + timestampHex.substring(12, 15),
    "8" + random.substring(0, 3),
    random.substring(3, 15),
  ].join("-")
}

// 无连字符UUID生成
function generateUUIDWithoutHyphens(version: string): string {
  const uuid = version === "v4" ? generateUUIDv4() : generateUUIDv1()
  return uuid.replace(/-/g, "")
}

// ���写UUID生成
function generateUppercaseUUID(version: string): string {
  const uuid = version === "v4" ? generateUUIDv4() : generateUUIDv1()
  return uuid.toUpperCase()
}

export default function UUIDGeneratorPage() {
  const [count, setCount] = useState(1)
  const [version, setVersion] = useState("v4")
  const [format, setFormat] = useState("standard")
  const [uuids, setUuids] = useState<string[]>([])
  const { toast } = useToast()

  // 生成UUID
  const generateUUIDs = () => {
    if (count < 1 || count > 1000) {
      toast({
        title: "数量错误",
        description: "请输入1-1000之间的数量",
        variant: "destructive",
      })
      return
    }

    const newUUIDs: string[] = []

    for (let i = 0; i < count; i++) {
      let uuid: string

      switch (format) {
        case "no-hyphens":
          uuid = generateUUIDWithoutHyphens(version)
          break
        case "uppercase":
          uuid = generateUppercaseUUID(version)
          break
        case "uppercase-no-hyphens":
          uuid = generateUUIDWithoutHyphens(version).toUpperCase()
          break
        default:
          uuid = version === "v4" ? generateUUIDv4() : generateUUIDv1()
      }

      newUUIDs.push(uuid)
    }

    setUuids(newUUIDs)

    toast({
      title: "生成成功",
      description: `已生成 ${count} 个 UUID`,
    })
  }

  // 复制单个UUID
  const copyUUID = (uuid: string) => {
    navigator.clipboard.writeText(uuid).then(() => {
      toast({
        title: "复制成功",
        description: "UUID已复制到剪贴板",
      })
    })
  }

  // 复制所有UUID
  const copyAllUUIDs = () => {
    const text = uuids.join("\n")
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "复制成功",
        description: `已复制 ${uuids.length} 个UUID到剪贴板`,
      })
    })
  }

  // 下载为文件
  const downloadUUIDs = () => {
    const text = uuids.join("\n")
    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `uuids-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "下载成功",
      description: "UUID列表已下载",
    })
  }

  // 清空结果
  const clearUUIDs = () => {
    setUuids([])
    toast({
      title: "已清空",
      description: "UUID列表已清空",
    })
  }

  // 格式化显示名称
  const getFormatName = (format: string) => {
    switch (format) {
      case "standard":
        return "标准格式"
      case "no-hyphens":
        return "无连字符"
      case "uppercase":
        return "大写格式"
      case "uppercase-no-hyphens":
        return "大写无连字符"
      default:
        return "标准格式"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回首页
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg flex items-center justify-center">
                <Fingerprint className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                UUID 生成工具
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* 生成器配置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Fingerprint className="w-5 h-5" />
              UUID 生成器
            </CardTitle>
            <CardDescription>生成全球唯一标识符（Universally Unique Identifier）</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="count">生成数量</Label>
                <Input
                  id="count"
                  type="number"
                  min="1"
                  max="1000"
                  value={count}
                  onChange={(e) => setCount(Number.parseInt(e.target.value) || 1)}
                  placeholder="1-1000"
                />
              </div>

              <div className="space-y-2">
                <Label>UUID版本</Label>
                <Select value={version} onValueChange={setVersion}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="v4">UUID v4 (随机)</SelectItem>
                    <SelectItem value="v1">UUID v1 (时间戳)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>输出格式</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">标准格式</SelectItem>
                    <SelectItem value="no-hyphens">无连字符</SelectItem>
                    <SelectItem value="uppercase">大写格式</SelectItem>
                    <SelectItem value="uppercase-no-hyphens">大写无连字符</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={generateUUIDs} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              生成 UUID
            </Button>
          </CardContent>
        </Card>

        {/* 生成结果 */}
        {uuids.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>生成结果</CardTitle>
                  <CardDescription>
                    共生成 {uuids.length} 个 UUID ({version.toUpperCase()}, {getFormatName(format)})
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyAllUUIDs}>
                    <Copy className="w-4 h-4 mr-2" />
                    复制全部
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadUUIDs}>
                    <Download className="w-4 h-4 mr-2" />
                    下载
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearUUIDs}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    清空
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {uuids.map((uuid, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <Badge variant="outline" className="text-xs">
                      {index + 1}
                    </Badge>
                    <code className="flex-1 text-sm font-mono">{uuid}</code>
                    <Button variant="ghost" size="sm" onClick={() => copyUUID(uuid)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* UUID说明 */}
        <Card>
          <CardHeader>
            <CardTitle>关于UUID</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-gray-600">
            <div>
              <p className="mb-2">
                <strong>UUID</strong>（Universally Unique Identifier）是一种标准化的标识符，
                用于在分布式系统中唯一标识信息，无需中央协调机构。
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">UUID v1 (时间戳版本)</h4>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>基于时间戳和MAC地址</li>
                  <li>可以推断生成时间</li>
                  <li>在同一台机器上保证唯一性</li>
                  <li>可能泄露MAC地址信息</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">UUID v4 (随机版本)</h4>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>基于随机数或伪随机数</li>
                  <li>更好的隐私保护</li>
                  <li>广泛使用的版本</li>
                  <li>碰撞概率极低</li>
                </ul>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">常见用途</h4>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>数据库主键</li>
                <li>分布式系统中的唯一标识</li>
                <li>文件名和目录名</li>
                <li>API请求ID</li>
                <li>会话标识符</li>
                <li>事务ID</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-blue-800">
                <strong>格式说明：</strong>标准UUID格式为 8-4-4-4-12 的十六进制数字，
                总共36个字符（包含连字符）或32个字符（不含连字符）。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
