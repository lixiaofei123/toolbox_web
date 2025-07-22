"use client"

import type React from "react"

import { useState, useRef } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Copy, Hash, Upload, FileText, Loader2 } from "lucide-react"

// MD5 实现
function md5(str: string): string {
  function rotateLeft(value: number, amount: number): number {
    return (value << amount) | (value >>> (32 - amount))
  }

  function addUnsigned(x: number, y: number): number {
    const x4 = x & 0x40000000
    const y4 = y & 0x40000000
    const x8 = x & 0x80000000
    const y8 = y & 0x80000000
    const result = (x & 0x3fffffff) + (y & 0x3fffffff)

    if (x4 & y4) {
      return result ^ 0x80000000 ^ x8 ^ y8
    }
    if (x4 | y4) {
      if (result & 0x40000000) {
        return result ^ 0xc0000000 ^ x8 ^ y8
      } else {
        return result ^ 0x40000000 ^ x8 ^ y8
      }
    } else {
      return result ^ x8 ^ y8
    }
  }

  function f(x: number, y: number, z: number): number {
    return (x & y) | (~x & z)
  }

  function g(x: number, y: number, z: number): number {
    return (x & z) | (y & ~z)
  }

  function h(x: number, y: number, z: number): number {
    return x ^ y ^ z
  }

  function i(x: number, y: number, z: number): number {
    return y ^ (x | ~z)
  }

  function ff(a: number, b: number, c: number, d: number, x: number, s: number, ac: number): number {
    a = addUnsigned(a, addUnsigned(addUnsigned(f(b, c, d), x), ac))
    return addUnsigned(rotateLeft(a, s), b)
  }

  function gg(a: number, b: number, c: number, d: number, x: number, s: number, ac: number): number {
    a = addUnsigned(a, addUnsigned(addUnsigned(g(b, c, d), x), ac))
    return addUnsigned(rotateLeft(a, s), b)
  }

  function hh(a: number, b: number, c: number, d: number, x: number, s: number, ac: number): number {
    a = addUnsigned(a, addUnsigned(addUnsigned(h(b, c, d), x), ac))
    return addUnsigned(rotateLeft(a, s), b)
  }

  function ii(a: number, b: number, c: number, d: number, x: number, s: number, ac: number): number {
    a = addUnsigned(a, addUnsigned(addUnsigned(i(b, c, d), x), ac))
    return addUnsigned(rotateLeft(a, s), b)
  }

  function convertToWordArray(str: string): number[] {
    const wordArray: number[] = []
    let i = 0

    for (i = 0; i < str.length * 8; i += 8) {
      wordArray[i >> 5] |= (str.charCodeAt(i / 8) & 0xff) << (i % 32)
    }

    return wordArray
  }

  function wordToHex(value: number): string {
    let result = ""
    for (let i = 0; i <= 3; i++) {
      const byte = (value >>> (i * 8)) & 0xff
      result += ("0" + byte.toString(16)).slice(-2)
    }
    return result
  }

  const x = convertToWordArray(str)
  let a = 0x67452301
  let b = 0xefcdab89
  let c = 0x98badcfe
  let d = 0x10325476

  const xl = str.length * 8
  x[xl >> 5] |= 0x80 << (xl % 32)
  x[(((xl + 64) >>> 9) << 4) + 14] = xl

  for (let i = 0; i < x.length; i += 16) {
    const olda = a
    const oldb = b
    const oldc = c
    const oldd = d

    a = ff(a, b, c, d, x[i], 7, 0xd76aa478)
    d = ff(d, a, b, c, x[i + 1], 12, 0xe8c7b756)
    c = ff(c, d, a, b, x[i + 2], 17, 0x242070db)
    b = ff(b, c, d, a, x[i + 3], 22, 0xc1bdceee)
    a = ff(a, b, c, d, x[i + 4], 7, 0xf57c0faf)
    d = ff(d, a, b, c, x[i + 5], 12, 0x4787c62a)
    c = ff(c, d, a, b, x[i + 6], 17, 0xa8304613)
    b = ff(b, c, d, a, x[i + 7], 22, 0xfd469501)
    a = ff(a, b, c, d, x[i + 8], 7, 0x698098d8)
    d = ff(d, a, b, c, x[i + 9], 12, 0x8b44f7af)
    c = ff(c, d, a, b, x[i + 10], 17, 0xffff5bb1)
    b = ff(b, c, d, a, x[i + 11], 22, 0x895cd7be)
    a = ff(a, b, c, d, x[i + 12], 7, 0x6b901122)
    d = ff(d, a, b, c, x[i + 13], 12, 0xfd987193)
    c = ff(c, d, a, b, x[i + 14], 17, 0xa679438e)
    b = ff(b, c, d, a, x[i + 15], 22, 0x49b40821)

    a = gg(a, b, c, d, x[i + 1], 5, 0xf61e2562)
    d = gg(d, a, b, c, x[i + 6], 9, 0xc040b340)
    c = gg(c, d, a, b, x[i + 11], 14, 0x265e5a51)
    b = gg(b, c, d, a, x[i], 20, 0xe9b6c7aa)
    a = gg(a, b, c, d, x[i + 5], 5, 0xd62f105d)
    d = gg(d, a, b, c, x[i + 10], 9, 0x2441453)
    c = gg(c, d, a, b, x[i + 15], 14, 0xd8a1e681)
    b = gg(b, c, d, a, x[i + 4], 20, 0xe7d3fbc8)
    a = gg(a, b, c, d, x[i + 9], 5, 0x21e1cde6)
    d = gg(d, a, b, c, x[i + 14], 9, 0xc33707d6)
    c = gg(c, d, a, b, x[i + 3], 14, 0xf4d50d87)
    b = gg(b, c, d, a, x[i + 8], 20, 0x455a14ed)
    a = gg(a, b, c, d, x[i + 13], 5, 0xa9e3e905)
    d = gg(d, a, b, c, x[i + 2], 9, 0xfcefa3f8)
    c = gg(c, d, a, b, x[i + 7], 14, 0x676f02d9)
    b = gg(b, c, d, a, x[i + 12], 20, 0x8d2a4c8a)

    a = hh(a, b, c, d, x[i + 5], 4, 0xfffa3942)
    d = hh(d, a, b, c, x[i + 8], 11, 0x8771f681)
    c = hh(c, d, a, b, x[i + 11], 16, 0x6d9d6122)
    b = hh(b, c, d, a, x[i + 14], 23, 0xfde5380c)
    a = hh(a, b, c, d, x[i + 1], 4, 0xa4beea44)
    d = hh(d, a, b, c, x[i + 4], 11, 0x4bdecfa9)
    c = hh(c, d, a, b, x[i + 7], 16, 0xf6bb4b60)
    b = hh(b, c, d, a, x[i + 10], 23, 0xbebfbc70)
    a = hh(a, b, c, d, x[i + 13], 4, 0x289b7ec6)
    d = hh(d, a, b, c, x[i], 11, 0xeaa127fa)
    c = hh(c, d, a, b, x[i + 3], 16, 0xd4ef3085)
    b = hh(b, c, d, a, x[i + 6], 23, 0x4881d05)
    a = hh(a, b, c, d, x[i + 9], 4, 0xd9d4d039)
    d = hh(d, a, b, c, x[i + 12], 11, 0xe6db99e5)
    c = hh(c, d, a, b, x[i + 15], 16, 0x1fa27cf8)
    b = hh(b, c, d, a, x[i + 2], 23, 0xc4ac5665)

    a = ii(a, b, c, d, x[i], 6, 0xf4292244)
    d = ii(d, a, b, c, x[i + 7], 10, 0x432aff97)
    c = ii(c, d, a, b, x[i + 14], 15, 0xab9423a7)
    b = ii(b, c, d, a, x[i + 5], 21, 0xfc93a039)
    a = ii(a, b, c, d, x[i + 12], 6, 0x655b59c3)
    d = ii(d, a, b, c, x[i + 3], 10, 0x8f0ccc92)
    c = ii(c, d, a, b, x[i + 10], 15, 0xffeff47d)
    b = ii(b, c, d, a, x[i + 1], 21, 0x85845dd1)
    a = ii(a, b, c, d, x[i + 8], 6, 0x6fa87e4f)
    d = ii(d, a, b, c, x[i + 15], 10, 0xfe2ce6e0)
    c = ii(c, d, a, b, x[i + 6], 15, 0xa3014314)
    b = ii(b, c, d, a, x[i + 13], 21, 0x4e0811a1)
    a = ii(a, b, c, d, x[i + 4], 6, 0xf7537e82)
    d = ii(d, a, b, c, x[i + 11], 10, 0xbd3af235)
    c = ii(c, d, a, b, x[i + 2], 15, 0x2ad7d2bb)
    b = ii(b, c, d, a, x[i + 9], 21, 0xeb86d391)

    a = addUnsigned(a, olda)
    b = addUnsigned(b, oldb)
    c = addUnsigned(c, oldc)
    d = addUnsigned(d, oldd)
  }

  return (wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)).toLowerCase()
}

export default function MD5GeneratorPage() {
  const [inputText, setInputText] = useState("")
  const [textResult, setTextResult] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileResult, setFileResult] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // 生成文本MD5
  const generateTextMD5 = () => {
    if (!inputText.trim()) {
      toast({
        title: "请输入文本",
        description: "请输入要生成MD5的文本内容",
        variant: "destructive",
      })
      return
    }

    const result = md5(inputText)
    setTextResult(result)

    toast({
      title: "生成成功",
      description: "MD5哈希值已生成",
    })
  }

  // 处理文件上传
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setFileResult("")
    }
  }

  // 生成文件MD5
  const generateFileMD5 = async () => {
    if (!selectedFile) {
      toast({
        title: "请选择文件",
        description: "请先选择要生成MD5的文件",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    setProgress(0)

    try {
      const reader = new FileReader()

      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100
          setProgress(percentComplete)
        }
      }

      reader.onload = (event) => {
        const arrayBuffer = event.target?.result as ArrayBuffer
        const uint8Array = new Uint8Array(arrayBuffer)

        // 将ArrayBuffer转换为字符串
        let binaryString = ""
        for (let i = 0; i < uint8Array.length; i++) {
          binaryString += String.fromCharCode(uint8Array[i])
        }

        const result = md5(binaryString)
        setFileResult(result)
        setProgress(100)

        toast({
          title: "生成成功",
          description: `文件 ${selectedFile.name} 的MD5哈希值已生成`,
        })

        setIsProcessing(false)
      }

      reader.onerror = () => {
        toast({
          title: "读取失败",
          description: "文件读取失败，请重试",
          variant: "destructive",
        })
        setIsProcessing(false)
      }

      reader.readAsArrayBuffer(selectedFile)
    } catch (error) {
      toast({
        title: "处理失败",
        description: "文件处理失败，请重试",
        variant: "destructive",
      })
      setIsProcessing(false)
    }
  }

  // 复制到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "复制成功",
        description: "MD5哈希值已复制到剪贴板",
      })
    })
  }

  // 清空文件
  const clearFile = () => {
    setSelectedFile(null)
    setFileResult("")
    setProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
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
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                <Hash className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                MD5 生成工具
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text">文本MD5</TabsTrigger>
            <TabsTrigger value="file">文件MD5</TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-6">
            {/* 文本MD5生成 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  文本MD5生成
                </CardTitle>
                <CardDescription>输入任意文本内容，生成对应的MD5哈希值</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="inputText">输入文本</Label>
                  <Textarea
                    id="inputText"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="请输入要生成MD5的文本内容..."
                    rows={4}
                  />
                </div>

                <Button onClick={generateTextMD5} className="w-full">
                  <Hash className="w-4 h-4 mr-2" />
                  生成MD5
                </Button>

                {textResult && (
                  <div className="space-y-2">
                    <Label>MD5哈希值</Label>
                    <div className="flex gap-2">
                      <Input value={textResult} readOnly className="font-mono bg-gray-50" />
                      <Button onClick={() => copyToClipboard(textResult)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="file" className="space-y-6">
            {/* 文件MD5生成 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  文件MD5生成
                </CardTitle>
                <CardDescription>上传文件，生成文件的MD5哈希值用于完整性验证</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fileInput">选择文件</Label>
                  <div className="flex gap-2">
                    <Input
                      id="fileInput"
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="flex-1"
                    />
                    {selectedFile && (
                      <Button variant="outline" onClick={clearFile}>
                        清空
                      </Button>
                    )}
                  </div>
                </div>

                {selectedFile && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">{selectedFile.name}</span>
                      <span className="text-xs text-gray-500">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                    </div>
                  </div>
                )}

                <Button onClick={generateFileMD5} disabled={!selectedFile || isProcessing} className="w-full">
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      处理中...
                    </>
                  ) : (
                    <>
                      <Hash className="w-4 h-4 mr-2" />
                      生成文件MD5
                    </>
                  )}
                </Button>

                {isProcessing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>处理进度</span>
                      <span>{progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                )}

                {fileResult && (
                  <div className="space-y-2">
                    <Label>文件MD5哈希值</Label>
                    <div className="flex gap-2">
                      <Input value={fileResult} readOnly className="font-mono bg-gray-50" />
                      <Button onClick={() => copyToClipboard(fileResult)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* MD5说明 */}
            <Card>
              <CardHeader>
                <CardTitle>关于MD5</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <p>
                  <strong>MD5</strong>（Message-Digest Algorithm 5）是一种广泛使用的密码散列函数，
                  可以产生出一个128位（16字节）的散列值，用于确保信息传输完整一致。
                </p>
                <div className="space-y-2">
                  <p>
                    <strong>主要用途：</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>文件完整性验证</li>
                    <li>数据一致性检查</li>
                    <li>密码存储（已不推荐）</li>
                    <li>数字签名</li>
                  </ul>
                </div>
                <p className="text-amber-600">
                  <strong>注意：</strong>MD5已被发现存在安全漏洞，不建议用于安全性要求高的场景。
                  对于安全应用，建议使用SHA-256等更安全的哈希算法。
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
