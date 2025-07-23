"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, Search, Replace, Copy, RotateCcw, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function TextSearchReplacePage() {
  const [text, setText] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [replaceTerm, setReplaceTerm] = useState("")
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [useRegex, setUseRegex] = useState(false)
  const [activeTab, setActiveTab] = useState("search")
  const [showPreview, setShowPreview] = useState(false)

  // 搜索结果
  const searchResults = useMemo(() => {
    if (!text || !searchTerm) return { count: 0, highlightedText: text }

    try {
      let regex: RegExp
      if (useRegex) {
        const flags = caseSensitive ? "g" : "gi"
        regex = new RegExp(searchTerm, flags)
      } else {
        const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        const flags = caseSensitive ? "g" : "gi"
        regex = new RegExp(escapedTerm, flags)
      }

      const matches = text.match(regex)
      const count = matches ? matches.length : 0

      // 高亮显示匹配的文本
      const highlightedText = text.replace(
        regex,
        (match) => `<mark class="bg-yellow-200 text-yellow-900 px-1 rounded">${match}</mark>`,
      )

      return { count, highlightedText }
    } catch (error) {
      return { count: 0, highlightedText: text, error: "正则表达式语法错误" }
    }
  }, [text, searchTerm, caseSensitive, useRegex])

  // 替换预览
  const replacePreview = useMemo(() => {
    if (!text || !searchTerm) return text

    try {
      let regex: RegExp
      if (useRegex) {
        const flags = caseSensitive ? "g" : "gi"
        regex = new RegExp(searchTerm, flags)
      } else {
        const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        const flags = caseSensitive ? "g" : "gi"
        regex = new RegExp(escapedTerm, flags)
      }

      // 直接使用替换内容，不处理 \\n
      return text.replace(regex, replaceTerm)
    } catch (error) {
      return text
    }
  }, [text, searchTerm, replaceTerm, caseSensitive, useRegex])

  const handleReplace = () => {
    if (!searchTerm) {
      toast({
        title: "请输入搜索内容",
        variant: "destructive",
      })
      return
    }

    setText(replacePreview)
    toast({
      title: "替换完成",
      description: `已完成文本替换操作`,
    })
  }

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      toast({
        title: "复制成功",
        description: "内容已复制到剪贴板",
      })
    } catch (error) {
      toast({
        title: "复制失败",
        description: "请手动复制内容",
        variant: "destructive",
      })
    }
  }

  const handleReset = () => {
    setText("")
    setSearchTerm("")
    setReplaceTerm("")
    setCaseSensitive(false)
    setUseRegex(false)
    setShowPreview(false)
    toast({
      title: "已重置",
      description: "所有内容已清空",
    })
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+H 或 Cmd+H 执行替换
      if ((e.ctrlKey || e.metaKey) && e.key === "h") {
        e.preventDefault()
        if (searchTerm) {
          handleReplace()
        }
      }
      // Ctrl+F 或 Cmd+F 聚焦搜索框
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault()
        document.getElementById("search")?.focus()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [searchTerm]) // Removed handleReplace from dependencies

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
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <Search className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                文本搜索替换
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* 左侧：输入和控制 */}
          <div className="space-y-6">
            {/* 文本输入 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  文本输入
                </CardTitle>
                <CardDescription>在此输入要处理的文本内容</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="请输入要搜索和替换的文本内容..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                />
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>字符数: {text.length}</span>
                  <span>行数: {text.split("\n").length}</span>
                </div>
              </CardContent>
            </Card>

            {/* 搜索和替换控制 */}
            <Card>
              <CardHeader>
                <CardTitle>搜索和替换</CardTitle>
                <CardDescription>配置搜索条件和替换内容</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 搜索输入 */}
                <div className="space-y-2">
                  <Label htmlFor="search">搜索内容</Label>
                  <Input
                    id="search"
                    placeholder="输入要搜索的内容..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="font-mono"
                  />
                </div>

                {/* 替换输入 */}
                <div className="space-y-2">
                  <Label htmlFor="replace">替换内容</Label>
                  <Textarea
                    id="replace"
                    placeholder="输入替换后的内容... (可直接按回车输入换行)"
                    value={replaceTerm}
                    onChange={(e) => setReplaceTerm(e.target.value)}
                    className="font-mono min-h-[80px]"
                    rows={3}
                  />
                  <p className="text-xs text-gray-500">提示：可直接按回车键输入换行符</p>
                </div>

                <Separator />

                {/* 选项 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="case-sensitive" className="text-sm">
                      区分大小写
                    </Label>
                    <Switch id="case-sensitive" checked={caseSensitive} onCheckedChange={setCaseSensitive} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="use-regex" className="text-sm">
                      正则表达式
                    </Label>
                    <Switch id="use-regex" checked={useRegex} onCheckedChange={setUseRegex} />
                  </div>
                </div>

                <Separator />

                {/* 操作按钮 */}
                <div className="flex gap-2">
                  <Button onClick={handleReplace} disabled={!searchTerm} className="flex-1">
                    <Replace className="w-4 h-4 mr-2" />
                    执行替换 (Ctrl+H)
                  </Button>
                  <Button variant="outline" onClick={handleReset}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    重置
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：结果显示 */}
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="search" className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  搜索结果
                </TabsTrigger>
                <TabsTrigger value="replace" className="flex items-center gap-2">
                  <Replace className="w-4 h-4" />
                  替换预览
                </TabsTrigger>
              </TabsList>

              {/* 搜索结果 */}
              <TabsContent value="search">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Search className="w-5 h-5" />
                        搜索结果
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {searchResults.count > 0 && (
                          <Badge variant="secondary">找到 {searchResults.count} 个匹配</Badge>
                        )}
                        <Button variant="outline" size="sm" onClick={() => handleCopy(text)}>
                          <Copy className="w-4 h-4 mr-1" />
                          复制
                        </Button>
                      </div>
                    </div>
                    {searchResults.error && (
                      <div className="flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        {searchResults.error}
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px] w-full rounded border p-4">
                      {searchTerm ? (
                        <div
                          className="whitespace-pre-wrap font-mono text-sm leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: searchResults.highlightedText }}
                        />
                      ) : (
                        <div className="text-gray-500 text-center py-8">请输入搜索内容以查看结果</div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 替换预览 */}
              <TabsContent value="replace">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Replace className="w-5 h-5" />
                        替换预览
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
                          {showPreview ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                          {showPreview ? "隐藏" : "显示"}差异
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleCopy(replacePreview)}>
                          <Copy className="w-4 h-4 mr-1" />
                          复制
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px] w-full rounded border p-4">
                      {searchTerm ? (
                        <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed">{replacePreview}</div>
                      ) : (
                        <div className="text-gray-500 text-center py-8">请输入搜索内容以查看替换预览</div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* 使用说明 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  使用说明
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-600">
                <p>
                  • <strong>精确匹配</strong>：默认模式，完全匹配搜索内容
                </p>
                <p>
                  • <strong>忽略大小写</strong>：开启后不区分大小写进行搜索
                </p>
                <p>
                  • <strong>正则表达式</strong>：支持使用正则表达式进行高级搜索
                </p>
                <p>
                  • <strong>换行支持</strong>：可搜索 \n 并用实际换行符替换
                </p>
                <p>
                  • <strong>快捷键</strong>：Ctrl+F 聚焦搜索，Ctrl+H 执行替换
                </p>
                <p>
                  • <strong>实时预览</strong>：在替换预览中查看替换后的效果
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
