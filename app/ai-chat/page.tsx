"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Send, Bot, User, Settings, Info, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism"
import remarkGfm from "remark-gfm"

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: number
  isThinking?: boolean
}

interface Model {
  id: string
  object: string
  created: number
  owned_by: string
}

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [basePath, setBasePath] = useState("")
  const [models, setModels] = useState<Model[]>([])
  const [selectedModel, setSelectedModel] = useState("")
  const [showSettings, setShowSettings] = useState(false)
  const [showApiInfo, setShowApiInfo] = useState(false)
  const [copied, setCopied] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  // 用于每条消息的思考折叠状态
  const [collapsedThink, setCollapsedThink] = useState<{ [msgId: string]: { [segIdx: number]: boolean } }>({})

  // 初始化basePath和获取模型列表
  useEffect(() => {
    const initializeBasePath = async () => {
      const currentDomain = window.location.origin

      // 先尝试当前域名
      try {
        const response = await fetch(`${currentDomain}/v1/models`)
        if (response.ok && response.status === 200) {
          const data = await response.json()
          if (data.data && Array.isArray(data.data)) {
            setBasePath(currentDomain)
            setModels(data.data)
            if (data.data.length > 0) {
              setSelectedModel(data.data[0].id)
            }
            return
          }
        }
      } catch (error) {
        console.log("Current domain failed, trying fallback")
      }

      // 使用备用域名
      const fallbackDomain = "https://tool.lixf.ink"
      setBasePath(fallbackDomain)
      await fetchModels(fallbackDomain)
    }

    initializeBasePath()
  }, [])

  // 移除对 basePath 的监听，避免输入时频繁请求
  // useEffect(() => {
  //   if (basePath) {
  //     fetchModels(basePath)
  //   }
  // }, [basePath])

  // 获取模型列表
  const fetchModels = async (baseUrl: string) => {
    try {
      const response = await fetch(`${baseUrl}/v1/models`)
      if (response.ok && response.status === 200) {
        const data = await response.json()
        if (data.data && Array.isArray(data.data)) {
          setModels(data.data)
          if (data.data.length > 0) {
            setSelectedModel(data.data[0].id)
          }
        }
      } else {
        console.error(`Failed to fetch models: HTTP ${response.status}`)
        setModels([])
        setSelectedModel("")
      }
    } catch (error) {
      console.error("Failed to fetch models:", error)
      setModels([])
      setSelectedModel("")
    }
  }

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const parseMessageContent = (content: string) => {
    const thinkMatch = content.match(/<(?:think|Thinking)>([\s\S]*?)<\/(?:think|Thinking)>/i)
    const answerMatch = content.match(/<(?:answer|Answer)>([\s\S]*?)<\/(?:answer|Answer)>/i)

    let thinkContent = ""
    let answerContent = ""

    if (thinkMatch) {
      thinkContent = thinkMatch[1].trim()
    }

    if (answerMatch) {
      answerContent = answerMatch[1].trim()
    } else {
      // 如果没有 answer 标签，则将除了 think 部分的内容作为答案
      answerContent = content.replace(/<(?:think|Thinking)>[\s\S]*?<\/(?:think|Thinking)>/i, "").trim()
    }

    return { thinkContent, answerContent }
  }

  const extractAnswerContent = (content: string) => {
    const { answerContent } = parseMessageContent(content)
    return answerContent || content
  }

  const isStreamingIncomplete = (content: string) => {
    // 检查是否有未闭合的标签
    const openThinking = (content.match(/<(?:think|Thinking)>/gi) || []).length
    const closeThinking = (content.match(/<\/(?:think|Thinking)>/gi) || []).length
    const openAnswer = (content.match(/<(?:answer|Answer)>/gi) || []).length
    const closeAnswer = (content.match(/<\/(?:answer|Answer)>/gi) || []).length

    return openThinking > closeThinking || openAnswer > closeAnswer
  }

  // 发送消息
  const sendMessage = async () => {
    if (!input.trim() || isLoading || !selectedModel) return

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    const recentMessages = [...messages, userMessage].slice(-10).map((msg) => ({
      role: msg.role,
      content: msg.role === "assistant" ? extractAnswerContent(msg.content) : msg.content,
    }))

    try {
      abortControllerRef.current = new AbortController()

      const response = await fetch(`${basePath}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: recentMessages,
          stream: true,
          max_tokens: 2000,
          temperature: 0.7,
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error("No reader available")
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: "",
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim()
            if (data === "[DONE]") continue

            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content
              if (content) {
                assistantMessage.content += content

                // 检测是否包含思考过程
                if (assistantMessage.content.includes("<Thinking>")) {
                  assistantMessage.isThinking = true
                }

                setMessages((prev) => {
                  const newMessages = [...prev]
                  newMessages[newMessages.length - 1] = { ...assistantMessage }
                  return newMessages
                })
              }
            } catch (e) {
              console.error("Error parsing SSE data:", e)
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.log("Request aborted")
      } else {
        console.error("Error sending message:", error)
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "抱歉，发生了错误。请检查网络连接或稍后重试。",
            timestamp: Date.now(),
          },
        ])
      }
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      if (e.ctrlKey || e.shiftKey) {
        e.preventDefault()
        const target = e.target as HTMLTextAreaElement
        const start = target.selectionStart
        const end = target.selectionEnd
        const newValue = input.substring(0, start) + "\n" + input.substring(end)
        setInput(newValue)

        // 设置光标位置到换行符后面
        setTimeout(() => {
          target.selectionStart = target.selectionEnd = start + 1
        }, 0)
      } else {
        // 单独 Enter 发送消息
        e.preventDefault()
        sendMessage()
      }
    }
  }

  // 清空对话
  const clearMessages = () => {
    setMessages([])
  }

  // 复制API信息
  const copyApiInfo = () => {
    const apiInfo = `模型列表接口: ${basePath}/v1/models
聊天接口: ${basePath}/v1/chat/completions

请求示例:
curl -X POST "${basePath}/v1/chat/completions" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${selectedModel}",
    "messages": [{"role": "user", "content": "Hello"}],
    "stream": true
  }'`

    navigator.clipboard.writeText(apiInfo)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // 新增：分段解析消息内容，支持流式渲染
  const splitMessageByTag = (content: string) => {
    // 支持 <think>、<Thinking>、<answer>、<Answer>，不区分大小写
    const tagRegex = /<(think|answer|Thinking|Answer)>|<\/(think|answer|Thinking|Answer)>/gi
    let result: { type: "think" | "answer"; text: string }[] = []
    let lastIndex = 0
    let currentType: "think" | "answer" | null = null
    let match: RegExpExecArray | null

    while ((match = tagRegex.exec(content)) !== null) {
      const tag = match[1] || match[2]
      const tagStart = match.index
      // 取标签前的内容
      if (tagStart > lastIndex) {
        const text = content.slice(lastIndex, tagStart)
        if (currentType && text.trim() !== "") {
          result.push({ type: currentType, text })
        }
      }
      // 处理标签
      if (match[0][1] === "/") {
        // 闭合标签，结束当前类型
        currentType = null
      } else {
        // 起始标签，切换类型
        currentType = tag.toLowerCase().startsWith("think") ? "think" : "answer"
      }
      lastIndex = tagRegex.lastIndex
    }
    // 剩余内容
    if (lastIndex < content.length) {
      const text = content.slice(lastIndex)
      if (currentType && text.trim() !== "") {
        result.push({ type: currentType, text })
      }
    }
    return result
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* 导航栏 */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">返回首页</span>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowApiInfo(!showApiInfo)}>
                <Info className="w-4 h-4 mr-1" />
                API
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)}>
                <Settings className="w-4 h-4 mr-1" />
                设置
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* API 信息面板 */}
        {showApiInfo && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                API 接口信息
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyApiInfo}
                  className="flex items-center gap-1 bg-transparent"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "已复制" : "复制"}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <Info className="w-4 h-4" />
                <AlertDescription>注意：此功能需要部署到 EdgeOne Pages 上才能正常访问 API 接口。</AlertDescription>
              </Alert>
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-sm text-gray-700 mb-1">当前 Base Path:</p>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">{basePath}</code>
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-700 mb-1">模型列表接口:</p>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">{basePath}/v1/models</code>
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-700 mb-1">聊天接口:</p>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">{basePath}/v1/chat/completions</code>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 设置面板 */}
        {showSettings && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>聊天设置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">API Base Path</label>
                <Input
                  value={basePath}
                  onChange={(e) => setBasePath(e.target.value)}
                  onBlur={(e) => {
                    if (e.target.value) {
                      fetchModels(e.target.value)
                    }
                  }}
                  placeholder="https://api.example.com"
                />
              </div>
              <Button onClick={clearMessages} variant="outline" className="w-full bg-transparent">
                清空对话历史
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 聊天界面 */}
        <Card className="shadow-lg border-0">
          <CardContent className="p-0">
            {/* 聊天消息区域 */}
            <div className="h-[600px] overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 mt-20">
                  <Bot className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>开始与 AI 对话吧！</p>
                  <p className="text-sm mt-1">当前模型: {selectedModel || "未选择"}</p>
                </div>
              )}

              {messages.map((message, messageIdx) => (
                <div key={messageIdx} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-lg ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div>
                        {(() => {
                          // 新渲染逻辑：分段渲染思考和回答
                          const segments = splitMessageByTag(message.content)
                          if (segments.length === 0) {
                            return (
                              <div className="prose prose-sm max-w-none text-gray-800">
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  components={{
                                    code({ node, inline, className, children, ...props }) {
                                      const match = /language-(\w+)/.exec(className || "")
                                      return !inline && match ? (
                                        <SyntaxHighlighter
                                          style={tomorrow}
                                          language={match[1]}
                                          PreTag="div"
                                          className="rounded-md"
                                          {...props}
                                        >
                                          {String(children).replace(/\n$/, "")}
                                        </SyntaxHighlighter>
                                      ) : (
                                        <code className="bg-gray-100 px-1 py-0.5 rounded text-sm" {...props}>
                                          {children}
                                        </code>
                                      )
                                    },
                                    table({ children }) {
                                      return (
                                        <div className="overflow-x-auto">
                                          <table className="min-w-full border-collapse border border-gray-300">{children}</table>
                                        </div>
                                      )
                                    },
                                    th({ children }) {
                                      return (
                                        <th className="border border-gray-300 bg-gray-50 px-4 py-2 text-left font-semibold">{children}</th>
                                      )
                                    },
                                    td({ children }) {
                                      return <td className="border border-gray-300 px-4 py-2">{children}</td>
                                    },
                                  }}
                                >
                                  {message.content}
                                </ReactMarkdown>
                              </div>
                            )
                          }
                          return (
                            <>
                              {segments.map((seg, idx) =>
                                seg.type === "think" ? (
                                  (() => {
                                    // 判断是否为最后一个think段，且后面有answer段，才自动折叠
                                    const isLastThink = segments.slice(idx + 1).find(s => s.type === "think") === undefined && segments.slice(idx + 1).find(s => s.type === "answer") !== undefined
                                    // 用消息索引+段索引做key
                                    const msgKey = String(messageIdx)
                                    const collapsed = collapsedThink[msgKey]?.[idx] ?? (isLastThink ? true : false)
                                    return (
                                      <div
                                        key={idx}
                                        className="mb-3 p-3 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg"
                                      >
                                        <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => setCollapsedThink(prev => ({
                                          ...prev,
                                          [msgKey]: {
                                            ...prev[msgKey],
                                            [idx]: !collapsed
                                          }
                                        }))}>
                                          <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
                                          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">思考过程</span>
                                          <span className="text-xs text-amber-600 underline ml-2 align-middle">{collapsed ? "点击展开" : "点击收起"}</span>
                                        </div>
                                        {!collapsed && (
                                          <div className="text-sm text-amber-700 whitespace-pre-wrap font-mono leading-relaxed">
                                            {seg.text}
                                          </div>
                                        )}
                                      </div>
                                    )
                                  })()
                                ) : (
                                  <div key={idx} className="mt-3">
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                      <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">回答</span>
                                    </div>
                                    <div className="prose prose-sm max-w-none text-gray-800">
                                      <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                          code({ node, inline, className, children, ...props }) {
                                            const match = /language-(\w+)/.exec(className || "")
                                            return !inline && match ? (
                                              <SyntaxHighlighter
                                                style={tomorrow}
                                                language={match[1]}
                                                PreTag="div"
                                                className="rounded-md"
                                                {...props}
                                              >
                                                {String(children).replace(/\n$/, "")}
                                              </SyntaxHighlighter>
                                            ) : (
                                              <code className="bg-gray-100 px-1 py-0.5 rounded text-sm" {...props}>
                                                {children}
                                              </code>
                                            )
                                          },
                                          table({ children }) {
                                            return (
                                              <div className="overflow-x-auto">
                                                <table className="min-w-full border-collapse border border-gray-300">{children}</table>
                                              </div>
                                            )
                                          },
                                          th({ children }) {
                                            return (
                                              <th className="border border-gray-300 bg-gray-50 px-4 py-2 text-left font-semibold">{children}</th>
                                            )
                                          },
                                          td({ children }) {
                                            return <td className="border border-gray-300 px-4 py-2">{children}</td>
                                          },
                                        }}
                                      >
                                        {seg.text}
                                      </ReactMarkdown>
                                    </div>
                                  </div>
                                )
                              )}
                            </>
                          )
                        })()}
                      </div>
                    )}
                    {message.role !== "assistant" && (
                      <div className="prose prose-sm max-w-none text-white">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            code({ node, inline, className, children, ...props }) {
                              const match = /language-(\w+)/.exec(className || "")
                              return !inline && match ? (
                                <SyntaxHighlighter
                                  style={tomorrow}
                                  language={match[1]}
                                  PreTag="div"
                                  className="rounded-md"
                                  {...props}
                                >
                                  {String(children).replace(/\n$/, "")}
                                </SyntaxHighlighter>
                              ) : (
                                <code className="bg-white/20 px-1 py-0.5 rounded text-sm" {...props}>
                                  {children}
                                </code>
                              )
                            },
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>

                  {message.role === "user" && (
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gray-100 px-4 py-2 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-gray-200 p-4">
              <div className="relative">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="输入您的消息... (Enter发送，Ctrl+Enter或Shift+Enter换行)"
                  disabled={isLoading || !selectedModel}
                  className="w-full min-h-[80px] max-h-[120px] resize-none pr-32"
                  rows={3}
                />
                <div className="absolute bottom-2 right-2 flex gap-2">
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="w-32 h-8 text-xs">
                      <SelectValue placeholder="选择模型" />
                    </SelectTrigger>
                    <SelectContent>
                      {models.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={sendMessage}
                    disabled={isLoading || !input.trim() || !selectedModel}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 h-8 px-3"
                    size="sm"
                  >
                    <Send className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              {!selectedModel && <p className="text-sm text-red-500 mt-2">请先选择一个模型</p>}
            </div>
          </CardContent>
        </Card>
      </div>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c7d2fe;
          border-radius: 4px;
          transition: background 0.2s;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: #818cf8;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #c7d2fe #f1f5f9;
        }
      `}</style>
    </div>
  )
}
