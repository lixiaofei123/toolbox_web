"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ArrowLeft,
  Copy,
  CheckCircle,
  XCircle,
  Search,
  AlertCircle,
  BookOpen,
  TestTube,
  Scan,
  Code,
  FileCode,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface MatchResult {
  match: string
  index: number
  groups: string[]
}

const commonRegexes = [
  { name: "邮箱地址", pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", description: "验证邮箱格式" },
  { name: "手机号码", pattern: "^1[3-9]\\d{9}$", description: "中国大陆手机号" },
  {
    name: "身份证号",
    pattern: "^[1-9]\\d{5}(18|19|20)\\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\\d{3}[0-9Xx]$",
    description: "18位身份证号码",
  },
  {
    name: "URL链接",
    pattern:
      "^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$",
    description: "HTTP/HTTPS链接",
  },
  {
    name: "IP地址",
    pattern: "^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$",
    description: "IPv4地址格式",
  },
  { name: "中文字符", pattern: "[\\u4e00-\\u9fa5]+", description: "匹配中文字符" },
  { name: "纯数字", pattern: "^\\d+$", description: "只包含数字" },
  { name: "字母数字", pattern: "^[a-zA-Z0-9]+$", description: "字母和数字组合" },
  {
    name: "密码强度",
    pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
    description: "至少8位，包含大小写字母、数字、特殊字符",
  },
  { name: "银行卡号", pattern: "^[1-9]\\d{15,18}$", description: "16-19位银行卡号" },
]

export default function RegexTesterPage() {
  const [pattern, setPattern] = useState("")
  const [testText, setTestText] = useState("")
  const [testMode, setTestMode] = useState<"match" | "search">("search")
  const [flags, setFlags] = useState({
    global: true,
    ignoreCase: false,
    multiline: false,
  })
  const [isValidRegex, setIsValidRegex] = useState(true)
  const [regexError, setRegexError] = useState("")
  const [matches, setMatches] = useState<MatchResult[]>([])
  const [isFullMatch, setIsFullMatch] = useState(false)

  const useCommonRegex = (regex: { name: string; pattern: string; description: string }) => {
    setPattern(regex.pattern)
    toast({
      title: "已应��",
      description: `已应用 ${regex.name} 正则表达式`,
    })
  }

  useEffect(() => {
    if (!pattern) {
      setIsValidRegex(true)
      setRegexError("")
      setMatches([])
      setIsFullMatch(false)
      return
    }

    try {
      const flagString = `${flags.global ? "g" : ""}${flags.ignoreCase ? "i" : ""}${flags.multiline ? "m" : ""}`
      const regex = new RegExp(pattern, flagString)
      setIsValidRegex(true)
      setRegexError("")

      if (testText) {
        if (testMode === "match") {
          // 匹配模式：验证整个文本是否符合正则表达式
          const fullMatchRegex = new RegExp(`^${pattern}$`, flagString.replace("g", ""))
          const isMatch = fullMatchRegex.test(testText)
          setIsFullMatch(isMatch)
          setMatches([])
        } else {
          // 检索模式：在文本中查找所有匹配的部分
          const results: MatchResult[] = []
          if (flags.global) {
            let match
            const globalRegex = new RegExp(pattern, flagString)
            while ((match = globalRegex.exec(testText)) !== null) {
              results.push({
                match: match[0],
                index: match.index,
                groups: match.slice(1),
              })
              // 防止无限循环
              if (match.index === globalRegex.lastIndex) {
                globalRegex.lastIndex++
              }
            }
          } else {
            const match = regex.exec(testText)
            if (match) {
              results.push({
                match: match[0],
                index: match.index,
                groups: match.slice(1),
              })
            }
          }
          setMatches(results)
          setIsFullMatch(false)
        }
      } else {
        setMatches([])
        setIsFullMatch(false)
      }
    } catch (error) {
      setIsValidRegex(false)
      setRegexError(error instanceof Error ? error.message : "正则表达式语法错误")
      setMatches([])
      setIsFullMatch(false)
    }
  }, [pattern, testText, flags, testMode])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "已复制",
      description: "内容已复制到剪贴板",
    })
  }

  const highlightMatches = (text: string) => {
    if (testMode === "match" || !matches.length || !isValidRegex) return text

    let result = text
    let offset = 0

    matches.forEach((match) => {
      const start = match.index + offset
      const end = start + match.match.length
      const highlighted = `<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">${match.match}</mark>`
      result = result.slice(0, start) + highlighted + result.slice(end)
      offset += highlighted.length - match.match.length
    })

    return result
  }

  // 生成JavaScript代码
  const generateJavaScriptCode = () => {
    if (!pattern) return ""

    const flagString = `${flags.global ? "g" : ""}${flags.ignoreCase ? "i" : ""}${flags.multiline ? "m" : ""}`
    const regexLiteral = `/${pattern}/${flagString}`
    const testTextVar = testText ? `"${testText.replace(/"/g, '\\"')}"` : '"your_text_here"'

    if (testMode === "match") {
      return `// 匹配测试 - 验证整个文本是否符合正则表达式
const regex = ${regexLiteral};
const text = ${testTextVar};

// 方法1: 使用 test() 方法
const isMatch = regex.test(text);
console.log('匹配结果:', isMatch);

// 方法2: 使用 match() 方法
const matchResult = text.match(/^${pattern}$/);
console.log('匹配详情:', matchResult);`
    } else {
      return `// 检索测试 - 在文本中查找所有匹配的部分
const regex = ${regexLiteral};
const text = ${testTextVar};

// 方法1: 使用 match() 方法${flags.global ? " (全局匹配)" : ""}
const matches = text.match(regex);
console.log('匹配结果:', matches);

// 方法2: 使用 exec() 方法获取详细信息
${
  flags.global
    ? `const allMatches = [];
let match;
while ((match = regex.exec(text)) !== null) {
  allMatches.push({
    match: match[0],
    index: match.index,
    groups: match.slice(1)
  });
}
console.log('详细匹配信息:', allMatches);`
    : `const match = regex.exec(text);
if (match) {
  console.log('匹配内容:', match[0]);
  console.log('匹配位置:', match.index);
  console.log('分组信息:', match.slice(1));
}`
}`
    }
  }

  // 生成Python代码
  const generatePythonCode = () => {
    if (!pattern) return ""

    const flagsArray = []
    if (flags.ignoreCase) flagsArray.push("re.IGNORECASE")
    if (flags.multiline) flagsArray.push("re.MULTILINE")
    const flagsStr = flagsArray.length > 0 ? `, ${flagsArray.join(" | ")}` : ""

    const testTextVar = testText ? `"${testText.replace(/"/g, '\\"')}"` : '"your_text_here"'

    if (testMode === "match") {
      return `# 匹配测试 - 验证整个文本是否符合正则表达式
import re

pattern = r"${pattern}"
text = ${testTextVar}

# 方法1: 使用 fullmatch() 方法 (推荐)
is_match = re.fullmatch(pattern, text${flagsStr}) is not None
print(f"匹配结果: {is_match}")

# 方法2: 使用 match() 方法
match_result = re.match(f"^{pattern}$", text${flagsStr})
if match_result:
    print(f"匹配成功: {match_result.group()}")
else:
    print("匹配失败")`
    } else {
      return `# 检索测试 - 在文本中查找所有匹配的部分
import re

pattern = r"${pattern}"
text = ${testTextVar}

# 方法1: 使用 findall() 方法${flags.global ? " (查找所有匹配)" : ""}
matches = re.findall(pattern, text${flagsStr})
print(f"匹配结果: {matches}")

# 方法2: 使用 finditer() 方法获取详细信息
for match in re.finditer(pattern, text${flagsStr}):
    print(f"匹配内容: {match.group()}")
    print(f"匹配位置: {match.start()}-{match.end()}")
    if match.groups():
        print(f"分组信息: {match.groups()}")
    print("---")

# 方法3: 使用 search() 方法 (只查找第一个匹配)
first_match = re.search(pattern, text${flagsStr})
if first_match:
    print(f"第一个匹配: {first_match.group()}")
    print(f"匹配位置: {first_match.start()}-{first_match.end()}")`
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
              <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
                <Search className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">正则表达式测试</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* 左侧：正则表达式输入和设置 */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  正则表达式
                </CardTitle>
                <CardDescription>输入要测试的正则表达式</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="pattern">正则表达式</Label>
                  <div className="flex mt-1">
                    <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
                      /
                    </span>
                    <Input
                      id="pattern"
                      value={pattern}
                      onChange={(e) => setPattern(e.target.value)}
                      placeholder="输入正则表达式..."
                      className={`rounded-none ${!isValidRegex ? "border-red-500" : ""}`}
                    />
                    <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-l-0 border-gray-300 rounded-r-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
                      /{`${flags.global ? "g" : ""}${flags.ignoreCase ? "i" : ""}${flags.multiline ? "m" : ""}`}
                    </span>
                  </div>
                  {!isValidRegex && (
                    <Alert className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-red-600">{regexError}</AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* 测试模式选择 */}
                <div>
                  <Label className="text-sm font-medium">测试模式</Label>
                  <Tabs
                    value={testMode}
                    onValueChange={(value) => setTestMode(value as "match" | "search")}
                    className="mt-2"
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="search" className="flex items-center gap-1">
                        <Scan className="w-3 h-3" />
                        检索测试
                      </TabsTrigger>
                      <TabsTrigger value="match" className="flex items-center gap-1">
                        <TestTube className="w-3 h-3" />
                        匹配测试
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <p className="text-xs text-gray-500 mt-1">
                    {testMode === "search" ? "在文本中查找所有匹配的部分" : "验证整个文本是否符合正则表达式"}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium">匹配标志</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="global"
                        checked={flags.global}
                        onCheckedChange={(checked) => setFlags((prev) => ({ ...prev, global: checked as boolean }))}
                        disabled={testMode === "match"}
                      />
                      <Label htmlFor="global" className="text-sm">
                        全局匹配 (g) {testMode === "match" && "(匹配模式下禁用)"}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="ignoreCase"
                        checked={flags.ignoreCase}
                        onCheckedChange={(checked) => setFlags((prev) => ({ ...prev, ignoreCase: checked as boolean }))}
                      />
                      <Label htmlFor="ignoreCase" className="text-sm">
                        忽略大小写 (i)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="multiline"
                        checked={flags.multiline}
                        onCheckedChange={(checked) => setFlags((prev) => ({ ...prev, multiline: checked as boolean }))}
                      />
                      <Label htmlFor="multiline" className="text-sm">
                        多行模式 (m)
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isValidRegex ? (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      语法正确
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="w-3 h-3 mr-1" />
                      语法错误
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 常用正则表达式 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  常用正则表达式
                </CardTitle>
                <CardDescription>点击使用常用的正则表达式</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2 pr-4">
                    {commonRegexes.map((regex, index) => (
                      <div
                        key={index}
                        className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => useCommonRegex(regex)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">{regex.name}</div>
                            <div className="text-xs text-gray-500 mt-1">{regex.description}</div>
                            <div className="text-xs text-gray-400 mt-1 font-mono break-all">{regex.pattern}</div>
                          </div>
                          <Button size="sm" variant="ghost" className="ml-2 flex-shrink-0">
                            使用
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：测试文本和结果 */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>测试文本</CardTitle>
                <CardDescription>输入要测试的文本内容</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  placeholder="输入要测试的文本..."
                  className="min-h-[200px] font-mono"
                />
              </CardContent>
            </Card>

            {/* 测试结果 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  测试结果
                  {testMode === "search" ? (
                    <Badge variant="secondary">{matches.length} 个匹配</Badge>
                  ) : (
                    <Badge
                      variant={isFullMatch ? "default" : "destructive"}
                      className={isFullMatch ? "bg-green-500" : ""}
                    >
                      {testText ? (isFullMatch ? "匹配成功" : "匹配失败") : "等待测试"}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {testMode === "search" ? "高亮显示匹配的内容" : "验证整个文本是否符合正则表达式"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {testText && isValidRegex && (
                  <div className="space-y-4">
                    {testMode === "match" ? (
                      <div
                        className={`p-4 rounded-lg border-2 ${isFullMatch ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {isFullMatch ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                          <span className={`font-medium ${isFullMatch ? "text-green-800" : "text-red-800"}`}>
                            {isFullMatch ? "整个文本匹配成功" : "整个文本不匹配"}
                          </span>
                        </div>
                        <div className="font-mono text-sm bg-white p-3 rounded border">{testText}</div>
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div
                          className="font-mono text-sm whitespace-pre-wrap"
                          dangerouslySetInnerHTML={{ __html: highlightMatches(testText) }}
                        />
                      </div>
                    )}

                    {testMode === "search" && matches.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="font-medium mb-3">匹配详情</h4>
                          <ScrollArea className="h-[300px]">
                            <div className="space-y-2 pr-4">
                              {matches.map((match, index) => (
                                <div key={index} className="p-3 bg-yellow-50 rounded-lg border">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">匹配 {index + 1}</span>
                                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(match.match)}>
                                      <Copy className="w-3 h-3" />
                                    </Button>
                                  </div>
                                  <div className="space-y-1 text-sm">
                                    <div>
                                      <strong>内容:</strong>{" "}
                                      <code className="bg-white px-1 rounded">{match.match}</code>
                                    </div>
                                    <div>
                                      <strong>位置:</strong> {match.index} - {match.index + match.match.length}
                                    </div>
                                    {match.groups.length > 0 && (
                                      <div>
                                        <strong>分组:</strong>{" "}
                                        {match.groups.map((group, i) => (
                                          <code key={i} className="bg-white px-1 rounded ml-1">
                                            {group || "(空)"}
                                          </code>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {!testText && <div className="text-center py-8 text-gray-500">请输入测试文本</div>}

                {testText && !isValidRegex && (
                  <div className="text-center py-8 text-red-500">请修正正则表达式语法错误</div>
                )}
              </CardContent>
            </Card>

            {/* 代码生成 */}
            {pattern && isValidRegex && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    代码生成
                  </CardTitle>
                  <CardDescription>生成对应的JavaScript和Python代码</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="javascript" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="javascript" className="flex items-center gap-1">
                        <FileCode className="w-3 h-3" />
                        JavaScript
                      </TabsTrigger>
                      <TabsTrigger value="python" className="flex items-center gap-1">
                        <FileCode className="w-3 h-3" />
                        Python
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="javascript" className="mt-4">
                      <div className="relative">
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                          <code>{generateJavaScriptCode()}</code>
                        </pre>
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute top-2 right-2 bg-transparent"
                          onClick={() => copyToClipboard(generateJavaScriptCode())}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </TabsContent>
                    <TabsContent value="python" className="mt-4">
                      <div className="relative">
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                          <code>{generatePythonCode()}</code>
                        </pre>
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute top-2 right-2 bg-transparent"
                          onClick={() => copyToClipboard(generatePythonCode())}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
