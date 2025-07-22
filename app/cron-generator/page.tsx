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
import { ArrowLeft, Copy, Clock, Calendar, Timer, Play, AlertCircle, CheckCircle, Info } from "lucide-react"

// Cron预设模板
const cronPresets = [
  { name: "每分钟", expression: "* * * * *", description: "每分钟执行一次" },
  { name: "每小时", expression: "0 * * * *", description: "每小时的第0分钟执行" },
  { name: "每天午夜", expression: "0 0 * * *", description: "每天凌晨0点执行" },
  { name: "每天上午9点", expression: "0 9 * * *", description: "每天上午9点执行" },
  { name: "每周一上午9点", expression: "0 9 * * 1", description: "每周一上午9点执行" },
  { name: "每月1号", expression: "0 0 1 * *", description: "每月1号凌晨执行" },
  { name: "工作日上午9点", expression: "0 9 * * 1-5", description: "周一到周五上午9点执行" },
  { name: "每15分钟", expression: "*/15 * * * *", description: "每15分钟执行一次" },
  { name: "每30分钟", expression: "*/30 * * * *", description: "每30分钟执行一次" },
  { name: "每季度", expression: "0 0 1 */3 *", description: "每季度第一天执行" },
]

// 解析Cron表达式
function parseCronExpression(expression: string) {
  const parts = expression.trim().split(/\s+/)

  if (parts.length !== 5) {
    throw new Error("Cron表达式必须包含5个部分：分 时 日 月 周")
  }

  const [minute, hour, day, month, weekday] = parts

  const parseField = (field: string, min: number, max: number, names?: string[]) => {
    if (field === "*") return "任意"
    if (field.includes("/")) {
      const [range, step] = field.split("/")
      return `每${step}${names ? names[0] : ""}`
    }
    if (field.includes("-")) {
      const [start, end] = field.split("-")
      return `${start}-${end}`
    }
    if (field.includes(",")) {
      return field.split(",").join(", ")
    }
    if (names && !isNaN(Number(field))) {
      const index = Number(field)
      return names[index] || field
    }
    return field
  }

  const monthNames = ["", "1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]
  const weekdayNames = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"]

  return {
    minute: parseField(minute, 0, 59),
    hour: parseField(hour, 0, 23),
    day: parseField(day, 1, 31),
    month: parseField(month, 1, 12, monthNames),
    weekday: parseField(weekday, 0, 6, weekdayNames),
  }
}

// 生成人类可读的描述
function generateDescription(parsed: any) {
  const { minute, hour, day, month, weekday } = parsed

  let description = "执行时间："

  if (month !== "任意") description += `${month} `
  if (day !== "任意") description += `${day}日 `
  if (weekday !== "任意") description += `${weekday} `
  if (hour !== "任意") description += `${hour}时 `
  if (minute !== "任意") description += `${minute}分`

  if (description === "执行时间：") {
    description = "每分钟执行"
  }

  return description
}

// 计算下次执行时间（简化版本）
function getNextExecution(expression: string) {
  try {
    const parts = expression.trim().split(/\s+/)
    if (parts.length !== 5) return null

    const now = new Date()
    const next = new Date(now)

    // 简化计算，仅处理基本情况
    const [minute, hour, day, month, weekday] = parts

    if (minute !== "*" && !minute.includes("/")) {
      next.setMinutes(Number.parseInt(minute))
    }
    if (hour !== "*" && !hour.includes("/")) {
      next.setHours(Number.parseInt(hour))
    }

    // 如果设置的时间已过，则推到下一天
    if (next <= now) {
      next.setDate(next.getDate() + 1)
    }

    return next.toLocaleString("zh-CN")
  } catch {
    return null
  }
}

export default function CronGeneratorPage() {
  const [toast, setToast] = useState<any>(null)

  // 生成器状态
  const [generatorMinute, setGeneratorMinute] = useState("*")
  const [generatorHour, setGeneratorHour] = useState("*")
  const [generatorDay, setGeneratorDay] = useState("*")
  const [generatorMonth, setGeneratorMonth] = useState("*")
  const [generatorWeekday, setGeneratorWeekday] = useState("*")
  const [generatedExpression, setGeneratedExpression] = useState("* * * * *")

  // 分析器状态
  const [inputExpression, setInputExpression] = useState("")
  const [parsedResult, setParsedResult] = useState<any>(null)
  const [parseError, setParseError] = useState("")
  const [description, setDescription] = useState("")
  const [nextExecution, setNextExecution] = useState("")

  // 更新生成的表达式
  useEffect(() => {
    const expression = `${generatorMinute} ${generatorHour} ${generatorDay} ${generatorMonth} ${generatorWeekday}`
    setGeneratedExpression(expression)
  }, [generatorMinute, generatorHour, generatorDay, generatorMonth, generatorWeekday])

  // 复制到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setToast({
        title: "复制成功",
        description: "Cron表达式已复制到剪贴板",
      })
    } catch (err) {
      setToast({
        title: "复制失败",
        description: "请手动复制表达式",
        variant: "destructive",
      })
    }
  }

  // 使用预设模板
  const usePreset = (expression: string) => {
    const parts = expression.split(" ")
    setGeneratorMinute(parts[0])
    setGeneratorHour(parts[1])
    setGeneratorDay(parts[2])
    setGeneratorMonth(parts[3])
    setGeneratorWeekday(parts[4])
  }

  // 分析表达式
  const analyzeExpression = () => {
    if (!inputExpression.trim()) {
      setParseError("请输入Cron表达式")
      return
    }

    try {
      const parsed = parseCronExpression(inputExpression)
      setParsedResult(parsed)
      setDescription(generateDescription(parsed))
      setNextExecution(getNextExecution(inputExpression) || "无法计算")
      setParseError("")
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "解析失败")
      setParsedResult(null)
      setDescription("")
      setNextExecution("")
    }
  }

  // 清空分析结果
  const clearAnalysis = () => {
    setInputExpression("")
    setParsedResult(null)
    setParseError("")
    setDescription("")
    setNextExecution("")
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
              <div className="w-8 h-8 bg-violet-500 rounded-lg flex items-center justify-center">
                <Timer className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Cron 表达式工具</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* 工具说明 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              Cron表达式格式说明
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">格式：分 时 日 月 周</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>• 分：0-59</div>
                  <div>• 时：0-23</div>
                  <div>• 日：1-31</div>
                  <div>• 月：1-12</div>
                  <div>• 周：0-6 (0=周日)</div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">特殊字符</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>• * : 任意值</div>
                  <div>• , : 列举多个值</div>
                  <div>• - : 范围</div>
                  <div>• / : 步长</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="generator" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generator">表达式生成器</TabsTrigger>
            <TabsTrigger value="analyzer">表达式分析器</TabsTrigger>
          </TabsList>

          {/* 生成器 */}
          <TabsContent value="generator" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* 生成器配置 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    时间配置
                  </CardTitle>
                  <CardDescription>选择执行时间参数生成Cron表达式</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="minute">分钟 (0-59)</Label>
                      <Input
                        id="minute"
                        value={generatorMinute}
                        onChange={(e) => setGeneratorMinute(e.target.value)}
                        placeholder="* 或 0-59"
                      />
                    </div>
                    <div>
                      <Label htmlFor="hour">小时 (0-23)</Label>
                      <Input
                        id="hour"
                        value={generatorHour}
                        onChange={(e) => setGeneratorHour(e.target.value)}
                        placeholder="* 或 0-23"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="day">日 (1-31)</Label>
                      <Input
                        id="day"
                        value={generatorDay}
                        onChange={(e) => setGeneratorDay(e.target.value)}
                        placeholder="* 或 1-31"
                      />
                    </div>
                    <div>
                      <Label htmlFor="month">月 (1-12)</Label>
                      <Input
                        id="month"
                        value={generatorMonth}
                        onChange={(e) => setGeneratorMonth(e.target.value)}
                        placeholder="* 或 1-12"
                      />
                    </div>
                    <div>
                      <Label htmlFor="weekday">周 (0-6)</Label>
                      <Input
                        id="weekday"
                        value={generatorWeekday}
                        onChange={(e) => setGeneratorWeekday(e.target.value)}
                        placeholder="* 或 0-6"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-base font-semibold">生成的表达式</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <code className="flex-1 p-3 bg-gray-100 rounded-lg font-mono text-lg">{generatedExpression}</code>
                      <Button size="sm" onClick={() => copyToClipboard(generatedExpression)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 预设模板 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    常用模板
                  </CardTitle>
                  <CardDescription>点击使用预设的Cron表达式模板</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {cronPresets.map((preset, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => usePreset(preset.expression)}
                      >
                        <div>
                          <div className="font-medium">{preset.name}</div>
                          <div className="text-sm text-gray-600">{preset.description}</div>
                        </div>
                        <Badge variant="secondary" className="font-mono">
                          {preset.expression}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 分析器 */}
          <TabsContent value="analyzer" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  表达式分析
                </CardTitle>
                <CardDescription>输入Cron表达式查看详细解析结果</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="expression">Cron表达式</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="expression"
                      value={inputExpression}
                      onChange={(e) => setInputExpression(e.target.value)}
                      placeholder="例如: 0 9 * * 1-5"
                      className="flex-1"
                    />
                    <Button onClick={analyzeExpression}>分析</Button>
                    <Button variant="outline" onClick={clearAnalysis}>
                      清空
                    </Button>
                  </div>
                </div>

                {parseError && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    <AlertCircle className="w-5 h-5" />
                    <span>{parseError}</span>
                  </div>
                )}

                {parsedResult && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
                      <CheckCircle className="w-5 h-5" />
                      <span>表达式解析成功</span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">字段解析</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">分钟:</span>
                            <span className="font-mono">{parsedResult.minute}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">小时:</span>
                            <span className="font-mono">{parsedResult.hour}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">日:</span>
                            <span className="font-mono">{parsedResult.day}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">月:</span>
                            <span className="font-mono">{parsedResult.month}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">周:</span>
                            <span className="font-mono">{parsedResult.weekday}</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">执行信息</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <div className="text-gray-600 mb-1">描述:</div>
                            <div className="font-medium">{description}</div>
                          </div>
                          <div>
                            <div className="text-gray-600 mb-1">下次执行:</div>
                            <div className="font-medium">{nextExecution}</div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
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
