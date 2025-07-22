"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, GitCompare, ArrowUpDown, Plus, Minus, Equal, Copy } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface DiffLine {
  type: "added" | "removed" | "unchanged"
  content: string
  lineNumber: {
    old?: number
    new?: number
  }
}

export default function TextDiffPage() {
  const [leftText, setLeftText] = useState("")
  const [rightText, setRightText] = useState("")
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false)
  const [ignoreCase, setIgnoreCase] = useState(false)

  const swapTexts = () => {
    const temp = leftText
    setLeftText(rightText)
    setRightText(temp)
    toast({
      title: "已交换",
      description: "左右文本内容已交换",
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "已复制",
      description: "内容已复制到剪贴板",
    })
  }

  // 简单的文本差异算法
  const diffLines = useMemo(() => {
    const processText = (text: string) => {
      let processed = text
      if (ignoreCase) {
        processed = processed.toLowerCase()
      }
      if (ignoreWhitespace) {
        processed = processed.replace(/\s+/g, " ").trim()
      }
      return processed.split("\n")
    }

    const leftLines = processText(leftText)
    const rightLines = processText(rightText)
    const originalLeftLines = leftText.split("\n")
    const originalRightLines = rightText.split("\n")

    const result: DiffLine[] = []
    let leftIndex = 0
    let rightIndex = 0

    while (leftIndex < leftLines.length || rightIndex < rightLines.length) {
      const leftLine = leftLines[leftIndex]
      const rightLine = rightLines[rightIndex]

      if (leftIndex >= leftLines.length) {
        // 只剩右侧行（新增）
        result.push({
          type: "added",
          content: originalRightLines[rightIndex],
          lineNumber: { new: rightIndex + 1 },
        })
        rightIndex++
      } else if (rightIndex >= rightLines.length) {
        // 只剩左侧行（删除）
        result.push({
          type: "removed",
          content: originalLeftLines[leftIndex],
          lineNumber: { old: leftIndex + 1 },
        })
        leftIndex++
      } else if (leftLine === rightLine) {
        // 相同行
        result.push({
          type: "unchanged",
          content: originalLeftLines[leftIndex],
          lineNumber: { old: leftIndex + 1, new: rightIndex + 1 },
        })
        leftIndex++
        rightIndex++
      } else {
        // 查找是否在后续行中有匹配
        let foundInRight = -1
        let foundInLeft = -1

        // 在右侧后续行中查找左侧当前行
        for (let i = rightIndex + 1; i < Math.min(rightLines.length, rightIndex + 5); i++) {
          if (leftLine === rightLines[i]) {
            foundInRight = i
            break
          }
        }

        // 在左侧后续行中查找右侧当前行
        for (let i = leftIndex + 1; i < Math.min(leftLines.length, leftIndex + 5); i++) {
          if (rightLine === leftLines[i]) {
            foundInLeft = i
            break
          }
        }

        if (foundInRight !== -1 && (foundInLeft === -1 || foundInRight - rightIndex <= foundInLeft - leftIndex)) {
          // 右侧有匹配，左侧行被删除，右侧中间行被添加
          result.push({
            type: "removed",
            content: originalLeftLines[leftIndex],
            lineNumber: { old: leftIndex + 1 },
          })
          leftIndex++
        } else if (foundInLeft !== -1) {
          // 左侧有匹配，右侧行被添加
          result.push({
            type: "added",
            content: originalRightLines[rightIndex],
            lineNumber: { new: rightIndex + 1 },
          })
          rightIndex++
        } else {
          // 都没有匹配，当作修改（删除+添加）
          result.push({
            type: "removed",
            content: originalLeftLines[leftIndex],
            lineNumber: { old: leftIndex + 1 },
          })
          result.push({
            type: "added",
            content: originalRightLines[rightIndex],
            lineNumber: { new: rightIndex + 1 },
          })
          leftIndex++
          rightIndex++
        }
      }
    }

    return result
  }, [leftText, rightText, ignoreWhitespace, ignoreCase])

  const stats = useMemo(() => {
    const added = diffLines.filter((line) => line.type === "added").length
    const removed = diffLines.filter((line) => line.type === "removed").length
    const unchanged = diffLines.filter((line) => line.type === "unchanged").length
    return { added, removed, unchanged }
  }, [diffLines])

  const getLineIcon = (type: string) => {
    switch (type) {
      case "added":
        return <Plus className="w-3 h-3 text-green-600" />
      case "removed":
        return <Minus className="w-3 h-3 text-red-600" />
      default:
        return <Equal className="w-3 h-3 text-gray-400" />
    }
  }

  const getLineClass = (type: string) => {
    switch (type) {
      case "added":
        return "bg-green-50 border-l-4 border-green-400"
      case "removed":
        return "bg-red-50 border-l-4 border-red-400"
      default:
        return "bg-white border-l-4 border-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回首页
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <GitCompare className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">文本差异对比</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* 输入区域 */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  原始文本
                  <Button size="sm" variant="ghost" onClick={() => copyToClipboard(leftText)} disabled={!leftText}>
                    <Copy className="w-3 h-3" />
                  </Button>
                </CardTitle>
                <CardDescription>输入要对比的原始文本</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={leftText}
                  onChange={(e) => setLeftText(e.target.value)}
                  placeholder="输入原始文本..."
                  className="min-h-[300px] font-mono text-sm"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  对比文本
                  <Button size="sm" variant="ghost" onClick={() => copyToClipboard(rightText)} disabled={!rightText}>
                    <Copy className="w-3 h-3" />
                  </Button>
                </CardTitle>
                <CardDescription>输入要对比的新文本</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={rightText}
                  onChange={(e) => setRightText(e.target.value)}
                  placeholder="输入对比文本..."
                  className="min-h-[300px] font-mono text-sm"
                />
              </CardContent>
            </Card>
          </div>

          {/* 控制选项 */}
          <Card>
            <CardHeader>
              <CardTitle>对比选项</CardTitle>
              <CardDescription>调整文本对比的设置</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ignoreWhitespace"
                    checked={ignoreWhitespace}
                    onCheckedChange={(checked) => setIgnoreWhitespace(checked as boolean)}
                  />
                  <Label htmlFor="ignoreWhitespace" className="text-sm">
                    忽略空白字符
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ignoreCase"
                    checked={ignoreCase}
                    onCheckedChange={(checked) => setIgnoreCase(checked as boolean)}
                  />
                  <Label htmlFor="ignoreCase" className="text-sm">
                    忽略大小写
                  </Label>
                </div>
                <Button variant="outline" size="sm" onClick={swapTexts} disabled={!leftText && !rightText}>
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  交换文本
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 统计信息 */}
          {(leftText || rightText) && (
            <Card>
              <CardHeader>
                <CardTitle>差异统计</CardTitle>
                <CardDescription>文本变更的统计信息</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Badge variant="default" className="bg-green-500">
                    <Plus className="w-3 h-3 mr-1" />
                    新增 {stats.added} 行
                  </Badge>
                  <Badge variant="destructive">
                    <Minus className="w-3 h-3 mr-1" />
                    删除 {stats.removed} 行
                  </Badge>
                  <Badge variant="secondary">
                    <Equal className="w-3 h-3 mr-1" />
                    未变更 {stats.unchanged} 行
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 差异结果 */}
          {(leftText || rightText) && (
            <Card>
              <CardHeader>
                <CardTitle>差异结果</CardTitle>
                <CardDescription>逐行显示文本差异，绿色表示新增，红色表示删除</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-1">
                    {diffLines.map((line, index) => (
                      <div key={index} className={`p-2 ${getLineClass(line.type)} font-mono text-sm`}>
                        <div className="flex items-start gap-2">
                          <div className="flex items-center gap-1 text-xs text-gray-500 min-w-[80px]">
                            {getLineIcon(line.type)}
                            <span>
                              {line.lineNumber.old && `${line.lineNumber.old}`}
                              {line.lineNumber.old && line.lineNumber.new && ","}
                              {line.lineNumber.new && `${line.lineNumber.new}`}
                            </span>
                          </div>
                          <div className="flex-1 whitespace-pre-wrap break-all">{line.content || "(空行)"}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {!leftText && !rightText && (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-gray-500">
                  <GitCompare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>请输入要对比的文本内容</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
