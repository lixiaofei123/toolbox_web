"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeftRight, Copy, Trash2, Home } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import * as yaml from "js-yaml" // 引入 js-yaml 库

export default function JsonYamlConverter() {
  const [jsonInput, setJsonInput] = useState("")
  const [yamlInput, setYamlInput] = useState("")
  const [jsonError, setJsonError] = useState("")
  const [yamlError, setYamlError] = useState("")
  const { toast } = useToast()

  const convertJsonToYaml = () => {
    try {
      setJsonError("")
      if (!jsonInput.trim()) {
        setJsonError("请输入JSON内容")
        return
      }

      const parsed = JSON.parse(jsonInput)
      // 使用 js-yaml.dump 将 JavaScript 对象转换为 YAML 字符串
      const yamlOutput = yaml.dump(parsed, { indent: 2, noRefs: true }) // indent: 2 保持缩进，noRefs: true 避免生成锚点和别名
      setYamlInput(yamlOutput)

      toast({
        title: "转换成功",
        description: "JSON已成功转换为YAML",
      })
    } catch (error) {
      setJsonError(`JSON格式错误: ${error instanceof Error ? error.message : "未知错误"}`)
    }
  }

  const convertYamlToJson = () => {
    try {
      setYamlError("")
      if (!yamlInput.trim()) {
        setYamlError("请输入YAML内容")
        return
      }

      // 使用 js-yaml.load 将 YAML 字符串转换为 JavaScript 对象
      const parsed = yaml.load(yamlInput)
      const json = JSON.stringify(parsed, null, 2)
      setJsonInput(json)

      toast({
        title: "转换成功",
        description: "YAML已成功转换为JSON",
      })
    } catch (error) {
      setYamlError(`YAML解析错误: ${error instanceof Error ? error.message : "未知错误"}`)
    }
  }

  const copyJson = async () => {
    if (!jsonInput) return
    try {
      await navigator.clipboard.writeText(jsonInput)
      toast({
        title: "复制成功",
        description: "JSON内容已复制到剪贴板",
      })
    } catch (error) {
      toast({
        title: "复制失败",
        description: "无法复制到剪贴板",
        variant: "destructive",
      })
    }
  }

  const copyYaml = async () => {
    if (!yamlInput) return
    try {
      await navigator.clipboard.writeText(yamlInput)
      toast({
        title: "复制成功",
        description: "YAML内容已复制到剪贴板",
      })
    } catch (error) {
      toast({
        title: "复制失败",
        description: "无法复制到剪贴板",
        variant: "destructive",
      })
    }
  }

  const clearAll = () => {
    setJsonInput("")
    setYamlInput("")
    setJsonError("")
    setYamlError("")
  }

  const formatJson = () => {
    try {
      if (!jsonInput.trim()) return
      const parsed = JSON.parse(jsonInput)
      const formatted = JSON.stringify(parsed, null, 2)
      setJsonInput(formatted)
      setJsonError("")
      toast({
        title: "格式化成功",
        description: "JSON已格式化",
      })
    } catch (error) {
      setJsonError(`JSON格式错误: ${error instanceof Error ? error.message : "未知错误"}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <Home className="w-4 h-4 mr-2" />
                  返回首页
                </Button>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">JSON/YAML转换器</h1>
              </div>
            </div>
            <Badge variant="secondary">
              <ArrowLeftRight className="w-3 h-3 mr-1" />
              格式转换
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center mb-8">
          <p className="text-gray-600">支持JSON和YAML格式互相转换，自动检测语法错误</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* JSON输入区域 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>JSON</span>
                <div className="flex gap-2">
                  <Button onClick={formatJson} size="sm" variant="outline" disabled={!jsonInput}>
                    格式化
                  </Button>
                  <Button onClick={copyJson} size="sm" variant="outline" disabled={!jsonInput}>
                    <Copy className="w-4 h-4 mr-1" />
                    复制
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>输入或粘贴JSON内容</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder={`{
  "name": "示例项目",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.0.0",
    "typescript": "^4.9.0"
  },
  "scripts": ["build", "test", "deploy"],
  "config": {
    "port": 3000,
    "debug": true
  },
  "nestedArray": [
    {
      "id": 1,
      "value": "first"
    },
    {
      "id": 2,
      "value": "second"
    }
  ],
  "rootArrayExample": [
    "itemA",
    "itemB",
    {
      "keyC": "valueC"
    }
  ]
}`}
                value={jsonInput}
                onChange={(e) => {
                  setJsonInput(e.target.value)
                  setJsonError("")
                }}
                className="min-h-[400px] font-mono text-sm"
              />
              {jsonError && (
                <Alert variant="destructive">
                  <AlertDescription>{jsonError}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* YAML输入区域 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>YAML</span>
                <div className="flex gap-2">
                  <Button onClick={copyYaml} size="sm" variant="outline" disabled={!yamlInput}>
                    <Copy className="w-4 h-4 mr-1" />
                    复制
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>输入或粘贴YAML内容</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder={`name: "示例项目"
version: "1.0.0"
dependencies:
  react: "^18.0.0"
  typescript: "^4.9.0"
scripts:
  - build
  - test
  - deploy
config:
  port: 3000
  debug: true
nestedArray:
  - id: 1
    value: first
  - id: 2
    value: second
rootArrayExample:
  - itemA
  - itemB
  - keyC: valueC`}
                value={yamlInput}
                onChange={(e) => {
                  setYamlInput(e.target.value)
                  setYamlError("")
                }}
                className="min-h-[400px] font-mono text-sm"
              />
              {yamlError && (
                <Alert variant="destructive">
                  <AlertDescription>{yamlError}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-center gap-4 mt-6">
          <Button onClick={convertJsonToYaml} disabled={!jsonInput.trim()}>
            <ArrowLeftRight className="w-4 h-4 mr-2" />
            JSON → YAML
          </Button>
          <Button onClick={convertYamlToJson} disabled={!yamlInput.trim()}>
            <ArrowLeftRight className="w-4 h-4 mr-2" />
            YAML → JSON
          </Button>
          <Button onClick={clearAll} variant="outline">
            <Trash2 className="w-4 h-4 mr-2" />
            清空所有
          </Button>
        </div>
      </div>
    </div>
  )
}
