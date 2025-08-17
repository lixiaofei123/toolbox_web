"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Copy, FileText, Upload, Hash, Shield, AlertTriangle, CheckCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import CryptoJS from "crypto-js"

type HashAlgorithm = "MD5" | "SHA1" | "SHA256" | "SHA384" | "SHA512"

interface AlgorithmInfo {
  name: string
  bits: number
  security: "Low" | "Medium" | "High"
  color: string
  description: string
  recommendation: string
}

const algorithms: Record<HashAlgorithm, AlgorithmInfo> = {
  MD5: {
    name: "MD5",
    bits: 128,
    security: "Low",
    color: "bg-red-100 text-red-700",
    description: "128位哈希算法，速度快但安全性较低",
    recommendation: "不推荐用于安全敏感场景，仅用于数据完整性检查",
  },
  SHA1: {
    name: "SHA-1",
    bits: 160,
    security: "Low",
    color: "bg-orange-100 text-orange-700",
    description: "160位哈希算法，已被发现安全漏洞",
    recommendation: "不推荐用于新项目，建议升级到SHA-256或更高版本",
  },
  SHA256: {
    name: "SHA-256",
    bits: 256,
    security: "High",
    color: "bg-green-100 text-green-700",
    description: "256位哈希算法，目前广泛使用的安全标准",
    recommendation: "推荐用于大多数安全场景，平衡了安全性和性能",
  },
  SHA384: {
    name: "SHA-384",
    bits: 384,
    security: "High",
    color: "bg-blue-100 text-blue-700",
    description: "384位哈希算法，提供更高的安全性",
    recommendation: "适用于高安全要求的场景",
  },
  SHA512: {
    name: "SHA-512",
    bits: 512,
    security: "High",
    color: "bg-purple-100 text-purple-700",
    description: "512位哈希算法，提供最高级别的安全性",
    recommendation: "适用于最高安全要求的场景，但计算开销较大",
  },
}

export default function HashGenerator() {
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>("SHA256")
  const [textInput, setTextInput] = useState("")
  const [textResult, setTextResult] = useState("")
  const [fileResult, setFileResult] = useState("")
  const [fileName, setFileName] = useState("")
  const [fileSize, setFileSize] = useState(0)
  const [fileData, setFileData] = useState<ArrayBuffer | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const calculateHash = (data: string | CryptoJS.lib.WordArray, algo: HashAlgorithm): string => {
    switch (algo) {
      case "MD5":
        return CryptoJS.MD5(data).toString()
      case "SHA1":
        return CryptoJS.SHA1(data).toString()
      case "SHA256":
        return CryptoJS.SHA256(data).toString()
      case "SHA384":
        return CryptoJS.SHA384(data).toString()
      case "SHA512":
        return CryptoJS.SHA512(data).toString()
      default:
        return ""
    }
  }

  // 当算法改变时，如果有文件数据，自动重新计算哈希值
  useEffect(() => {
    if (fileData && fileName) {
      setIsProcessing(true)
      setProgress(0)

      // 使用 setTimeout 来模拟异步处理，让进���条有时间显示
      setTimeout(() => {
        try {
          const wordArray = CryptoJS.lib.WordArray.create(fileData)
          const hash = calculateHash(wordArray, algorithm)
          setFileResult(hash)
          setProgress(100)
          toast.success(`已使用 ${algorithms[algorithm].name} 重新计算文件哈希值`)
        } catch (error) {
          toast.error("重新计算文件哈希值时出错")
          console.error(error)
        } finally {
          setIsProcessing(false)
        }
      }, 100)
    }
  }, [algorithm, fileData, fileName])

  // 当算法改变时，如果有文本输入，自动重新计算哈希值
  useEffect(() => {
    if (textInput.trim() && textResult) {
      try {
        const hash = calculateHash(textInput, algorithm)
        setTextResult(hash)
        toast.success(`已使用 ${algorithms[algorithm].name} 重新计算文本哈希值`)
      } catch (error) {
        toast.error("重新计算文本哈希值时出错")
        console.error(error)
      }
    }
  }, [algorithm, textInput, textResult])

  const handleTextHash = () => {
    if (!textInput.trim()) {
      toast.error("请输入要计算哈希值的文本")
      return
    }

    try {
      const hash = calculateHash(textInput, algorithm)
      setTextResult(hash)
      toast.success("哈希值计算完成")
    } catch (error) {
      toast.error("计算哈希值时出错")
      console.error(error)
    }
  }

  const handleFileHash = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setFileSize(file.size)
    setIsProcessing(true)
    setProgress(0)
    setFileResult("")
    setFileData(null)

    try {
      const reader = new FileReader()

      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100
          setProgress(percentComplete)
        }
      }

      reader.onload = (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer
          setFileData(arrayBuffer) // 保存文件数据
          const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer)
          const hash = calculateHash(wordArray, algorithm)
          setFileResult(hash)
          setProgress(100)
          toast.success("文件哈希值计算完成")
        } catch (error) {
          toast.error("计算文件哈希值时出错")
          console.error(error)
        } finally {
          setIsProcessing(false)
        }
      }

      reader.onerror = () => {
        toast.error("读取文件时出错")
        setIsProcessing(false)
      }

      reader.readAsArrayBuffer(file)
    } catch (error) {
      toast.error("处理文件时出错")
      console.error(error)
      setIsProcessing(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success("已复制到剪贴板")
    } catch (error) {
      toast.error("复制失败")
    }
  }

  const clearTextInput = () => {
    setTextInput("")
    setTextResult("")
  }

  const clearFileInput = () => {
    setFileName("")
    setFileSize(0)
    setFileData(null)
    setFileResult("")
    setProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const currentAlgorithm = algorithms[algorithm]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回首页
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <Hash className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                  哈希值生成工具
                </h1>
                <p className="text-sm text-gray-600">支持 MD5、SHA-1、SHA-256、SHA-384、SHA-512 多种算法</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Algorithm Selection */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              选择哈希算法
            </CardTitle>
            <CardDescription>选择适合您需求的哈希算法，切换算法时会自动重新计算已有数据的哈希值</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="algorithm" className="text-base font-medium">
                  算法类型
                </Label>
                <Select value={algorithm} onValueChange={(value: HashAlgorithm) => setAlgorithm(value)}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(algorithms).map(([key, algo]) => (
                      <SelectItem key={key} value={key} className="py-3">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-3">
                            <span className="font-medium">{algo.name}</span>
                            <Badge variant={algo.security === "High" ? "default" : "destructive"} className="text-xs">
                              {algo.bits} 位
                            </Badge>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Alert className={`${currentAlgorithm.color} border-2`}>
                <Shield className="h-5 w-5" />
                <AlertDescription className="space-y-2">
                  <div className="font-semibold text-base">{currentAlgorithm.name}</div>
                  <div className="text-sm">{currentAlgorithm.description}</div>
                  <div className="text-xs opacity-90">
                    <strong>适用场景：</strong>
                    {currentAlgorithm.recommendation}
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="text" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 h-12">
            <TabsTrigger value="text" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              文本哈希
            </TabsTrigger>
            <TabsTrigger value="file" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              文件哈希
            </TabsTrigger>
          </TabsList>

          {/* Text Hash Tab */}
          <TabsContent value="text">
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  文本哈希生成
                </CardTitle>
                <CardDescription>输入任意文本内容，生成对应的 {currentAlgorithm.name} 哈希值</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="text-input" className="text-base font-medium">
                      输入文本
                    </Label>
                    {textInput && (
                      <Button variant="outline" size="sm" onClick={clearTextInput}>
                        清空
                      </Button>
                    )}
                  </div>
                  <Textarea
                    id="text-input"
                    placeholder="请输入要计算哈希值的文本内容..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                  {textInput && (
                    <div className="text-sm text-gray-500">
                      字符数：{textInput.length} | 字节数：{new Blob([textInput]).size}
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleTextHash}
                  disabled={!textInput.trim()}
                  className="w-full h-12 text-base"
                  size="lg"
                >
                  <Hash className="w-5 h-5 mr-2" />
                  生成 {currentAlgorithm.name} 哈希值
                </Button>

                {textResult && (
                  <div className="space-y-3 p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium">哈希值结果</Label>
                      <Badge variant="outline" className="text-xs">
                        {currentAlgorithm.name} • {currentAlgorithm.bits} 位
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Input value={textResult} readOnly className="font-mono text-sm bg-white border-2" />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(textResult)}
                        className="shrink-0"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>长度：{textResult.length} 字符</div>
                      <div>
                        算法：{currentAlgorithm.name} ({currentAlgorithm.bits} 位)
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* File Hash Tab */}
          <TabsContent value="file">
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-blue-600" />
                  文件哈希生成
                </CardTitle>
                <CardDescription>选择文件，生成对应的 {currentAlgorithm.name} 哈希值用于文件完整性验证</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="file-input" className="text-base font-medium">
                      选择文件
                    </Label>
                    {fileName && (
                      <Button variant="outline" size="sm" onClick={clearFileInput}>
                        清空
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Input
                      id="file-input"
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileHash}
                      disabled={isProcessing}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 h-14"
                    />
                  </div>

                  {fileName && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-blue-900">{fileName}</span>
                        <span className="text-blue-600">({formatFileSize(fileSize)})</span>
                      </div>
                    </div>
                  )}
                </div>

                {isProcessing && (
                  <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-blue-900 flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        处理进度
                      </span>
                      <span className="text-blue-700">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="text-xs text-blue-600">正在计算 {currentAlgorithm.name} 哈希值...</div>
                  </div>
                )}

                {fileResult && !isProcessing && (
                  <div className="space-y-3 p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium">文件哈希值</Label>
                      <Badge variant="outline" className="text-xs">
                        {currentAlgorithm.name} • {currentAlgorithm.bits} 位
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Input value={fileResult} readOnly className="font-mono text-sm bg-white border-2" />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(fileResult)}
                        className="shrink-0"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>
                        文件：{fileName} ({formatFileSize(fileSize)})
                      </div>
                      <div>长度：{fileResult.length} 字符</div>
                      <div>
                        算法：{currentAlgorithm.name} ({currentAlgorithm.bits} 位)
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Security Guidelines */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              安全使用指南
            </CardTitle>
            <CardDescription>了解不同哈希算法的安全性和适用场景，选择合适的算法</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    推荐使用
                  </h4>
                  <div className="space-y-2 text-sm text-green-700">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs bg-green-100">
                        SHA-256
                      </Badge>
                      <span>目前最佳选择，广泛支持</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs bg-blue-100">
                        SHA-384
                      </Badge>
                      <span>高安全性应用推荐</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs bg-purple-100">
                        SHA-512
                      </Badge>
                      <span>最高安全性要求</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    谨慎使用
                  </h4>
                  <div className="space-y-2 text-sm text-red-700">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs bg-red-100">
                        MD5
                      </Badge>
                      <span>仅用于非安全场景的校验</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs bg-orange-100">
                        SHA-1
                      </Badge>
                      <span>已被破解，避免使用</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">常见用途</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
                <div>
                  <strong>文件完整性验证：</strong>确保文件在传输或存储过程中未被篡改
                </div>
                <div>
                  <strong>密码安全存储：</strong>将密码转换为哈希值存储，提高安全性
                </div>
                <div>
                  <strong>数字签名：</strong>用于验证数据的真实性和完整性
                </div>
                <div>
                  <strong>区块链技术：</strong>用于创建不可篡改的数据链
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
