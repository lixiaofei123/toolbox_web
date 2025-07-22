"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Copy, Clock, Calendar, Info, Sparkles } from "lucide-react"

// 预设模板
const cronTemplates = [
  { name: "每分钟", cron: "* * * * *", desc: "每分钟执行一次" },
  { name: "每小时", cron: "0 * * * *", desc: "每小时的第0分钟执行" },
  { name: "每天午夜", cron: "0 0 * * *", desc: "每天凌晨0点执行" },
  { name: "每天上午9点", cron: "0 9 * * *", desc: "每天上午9点执行" },
  { name: "每周一上午9点", cron: "0 9 * * 1", desc: "每周一上午9点执行" },
  { name: "每月1号", cron: "0 0 1 * *", desc: "每月1号凌晨0点执行" },
  { name: "工作日上午9点", cron: "0 9 * * 1-5", desc: "周一到周五上午9点执行" },
  { name: "每15分钟", cron: "*/15 * * * *", desc: "每15分钟执行一次" },
  { name: "每30分钟", cron: "*/30 * * * *", desc: "每30分钟执行一次" },
  { name: "每6小时", cron: "0 */6 * * *", desc: "每6小时执行一次" },
]

export default function CronGeneratorPage() {
  const [minute, setMinute] = useState("*")
  const [hour, setHour] = useState("*")
  const [day, setDay] = useState("*")
  const [month, setMonth] = useState("*")
  const [weekday, setWeekday] = useState("*")
  const [cronExpression, setCronExpression] = useState("* * * * *")
  const [parseCron, setParseCron] = useState("")
  const [parseResult, setParseResult] = useState<any>(null)
  const [nextExecution, setNextExecution] = useState<string>("")
  const { toast } = useToast()

  // 生成cron表达式
  useEffect(() => {
    const expression = `${minute} ${hour} ${day} ${month} ${weekday}`
    setCronExpression(expression)
  }, [minute, hour, day, month, weekday])

  // 复制到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "复制成功",
        description: "已复制到剪贴板",
      })
    })
  }

  // 使用模板
  const useTemplate = (template: any) => {
    const parts = template.cron.split(" ")
    setMinute(parts[0] || "*")
    setHour(parts[1] || "*")
    setDay(parts[2] || "*")
    setMonth(parts[3] || "*")
    setWeekday(parts[4] || "*")

    toast({
      title: "模板已应用",
      description: template.desc,
    })
  }

  // 解析cron表达式
  const analyzeCron = () => {
    if (!parseCron.trim()) {
      toast({
        title: "请输入表达式",
        description: "请输入要分析的Cron表达式",
        variant: "destructive",
      })
      return
    }

    const parts = parseCron.trim().split(/\s+/)
    if (parts.length !== 5) {
      toast({
        title: "格式错误",
        description: "请输入标准的5段式Cron表达式",
        variant: "destructive",
      })
      return
    }

    const [min, hr, d, mon, wd] = parts
    const result = {
      minute: parseField(min, "分钟", 0, 59),
      hour: parseField(hr, "小时", 0, 23),
      day: parseField(d, "日", 1, 31),
      month: parseField(mon, "月", 1, 12),
      weekday: parseField(wd, "周", 0, 6, ["周日", "周一", "周二", "周三", "周四", "周五", "周六"]),
    }

    setParseResult(result)

    // 计算下次执行时间（简化版本）
    calculateNextExecution(parts)
  }

  // 解析字段
  const parseField = (field: string, name: string, min: number, max: number, labels?: string[]) => {
    if (field === "*") {
      return `任意${name}`
    }

    if (field.includes("/")) {
      const [range, step] = field.split("/")
      if (range === "*") {
        return `每${step}${name === "周" ? "天" : name === "日" ? "天" : name}`
      }
    }

    if (field.includes("-")) {
      const [start, end] = field.split("-")
      const startLabel = labels ? labels[Number.parseInt(start)] : start
      const endLabel = labels ? labels[Number.parseInt(end)] : end
      return `${startLabel}到${endLabel}`
    }

    if (field.includes(",")) {
      const values = field.split(",")
      const valueLabels = values.map((v) => (labels ? labels[Number.parseInt(v)] : v))
      return valueLabels.join("、")
    }

    if (labels && !isNaN(Number.parseInt(field))) {
      return labels[Number.parseInt(field)]
    }

    return field
  }

  // 计算下次执行时间（简化版本）
  const calculateNextExecution = (parts: string[]) => {
    const now = new Date()
    const next = new Date(now)

    // 这里是简化的计算，实际应该更复杂
    if (parts[0] !== "*") {
      next.setMinutes(Number.parseInt(parts[0]))
    }
    if (parts[1] !== "*") {
      next.setHours(Number.parseInt(parts[1]))
    }

    // 如果时间已过，加一天
    if (next <= now) {
      next.setDate(next.getDate() + 1)
    }

    setNextExecution(next.toLocaleString("zh-CN"))
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
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                Cron 表达式工具
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <Tabs defaultValue="generator" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generator">表达式生成器</TabsTrigger>
            <TabsTrigger value="analyzer">表达式分析器</TabsTrigger>
          </TabsList>

          <TabsContent value="generator" className="space-y-6">
            {/* 生成器 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Cron 表达式生成器
                </CardTitle>
                <CardDescription>通过可视化界面生成标准的Cron表达式</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 字段输入 */}
                <div className="grid grid-cols-5 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minute">分钟 (0-59)</Label>
                    <Input id="minute" value={minute} onChange={(e) => setMinute(e.target.value)} placeholder="*" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hour">小时 (0-23)</Label>
                    <Input id="hour" value={hour} onChange={(e) => setHour(e.target.value)} placeholder="*" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="day">日 (1-31)</Label>
                    <Input id="day" value={day} onChange={(e) => setDay(e.target.value)} placeholder="*" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="month">月 (1-12)</Label>
                    <Input id="month" value={month} onChange={(e) => setMonth(e.target.value)} placeholder="*" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weekday">周 (0-6)</Label>
                    <Input id="weekday" value={weekday} onChange={(e) => setWeekday(e.target.value)} placeholder="*" />
                  </div>
                </div>

                {/* 生成结果 */}
                <div className="space-y-2">
                  <Label>生成的Cron表达式</Label>
                  <div className="flex gap-2">
                    <Input value={cronExpression} readOnly className="font-mono bg-gray-50" />
                    <Button onClick={() => copyToClipboard(cronExpression)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* 说明 */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-2">特殊字符说明：</p>
                      <ul className="space-y-1">
                        <li>
                          <code>*</code> - 任意值
                        </li>
                        <li>
                          <code>,</code> - 列举多个值 (如: 1,3,5)
                        </li>
                        <li>
                          <code>-</code> - 范围 (如: 1-5)
                        </li>
                        <li>
                          <code>/</code> - 步长 (如: */15)
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 常用模板 */}
            <Card>
              <CardHeader>
                <CardTitle>常用模板</CardTitle>
                <CardDescription>点击使用预设的常用时间模板</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {cronTemplates.map((template, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-auto p-3 flex flex-col items-start bg-transparent"
                      onClick={() => useTemplate(template)}
                    >
                      <div className="font-medium">{template.name}</div>
                      <div className="text-xs text-gray-500 font-mono">{template.cron}</div>
                      <div className="text-xs text-gray-400">{template.desc}</div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analyzer" className="space-y-6">
            {/* 分析器 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Cron 表达式分析器
                </CardTitle>
                <CardDescription>解析现有的Cron表达式，显示执行时间规律</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="parseCron">输入Cron表达式</Label>
                  <div className="flex gap-2">
                    <Input
                      id="parseCron"
                      value={parseCron}
                      onChange={(e) => setParseCron(e.target.value)}
                      placeholder="例如: 0 9 * * 1-5"
                      className="font-mono"
                    />
                    <Button onClick={analyzeCron}>分析</Button>
                  </div>
                </div>

                {parseResult && (
                  <div className="space-y-4">
                    <Separator />
                    <div>
                      <h3 className="font-medium mb-3">解析结果</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">分钟：</span>
                            <Badge variant="outline">{parseResult.minute}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">小时：</span>
                            <Badge variant="outline">{parseResult.hour}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">日：</span>
                            <Badge variant="outline">{parseResult.day}</Badge>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">月：</span>
                            <Badge variant="outline">{parseResult.month}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">周：</span>
                            <Badge variant="outline">{parseResult.weekday}</Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    {nextExecution && (
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-green-600" />
                          <span className="font-medium text-green-800">预计下次执行时间：</span>
                          <span className="text-green-700">{nextExecution}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
