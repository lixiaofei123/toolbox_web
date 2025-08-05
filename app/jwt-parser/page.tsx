"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Copy,
  Key,
  ArrowLeft,
  Home,
  CheckCircle,
  AlertCircle,
  Shield,
  Clock,
  User,
  FileText,
  Lock,
  Unlock,
  RefreshCw,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface JWTHeader {
  alg: string
  typ: string
  [key: string]: any
}

interface JWTPayload {
  iss?: string
  sub?: string
  aud?: string | string[]
  exp?: number
  nbf?: number
  iat?: number
  jti?: string
  [key: string]: any
}

interface ParsedJWT {
  header: JWTHeader
  payload: JWTPayload
  signature: string
  raw: {
    header: string
    payload: string
    signature: string
  }
}

export default function JwtParser() {
  const [jwtToken, setJwtToken] = useState("")
  const [secretKey, setSecretKey] = useState("")
  const [algorithm, setAlgorithm] = useState("HS256")
  const [parsedJWT, setParsedJWT] = useState<ParsedJWT | null>(null)
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [editablePayload, setEditablePayload] = useState("")
  const { toast } = useToast()

  // Base64 URL 解码 - 修复填充逻辑
  const base64UrlDecode = (str: string): string => {
    // 替换 URL 安全字符
    str = str.replace(/-/g, "+").replace(/_/g, "/")

    // 正确的填充逻辑
    const padding = str.length % 4
    if (padding === 2) {
      str += "=="
    } else if (padding === 3) {
      str += "="
    }

    try {
      return decodeURIComponent(
        atob(str)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      )
    } catch (e) {
      throw new Error("Invalid base64 encoding")
    }
  }

  // Base64 URL 编码
  const base64UrlEncode = (str: string): string => {
    return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
  }

  // 解析 JWT
  const parseJWT = () => {
    if (!jwtToken.trim()) {
      setError("请输入JWT token")
      return
    }

    try {
      const parts = jwtToken.trim().split(".")
      if (parts.length !== 3) {
        setError("无效的JWT格式，JWT应该包含三个部分，用点号分隔")
        return
      }

      const [headerPart, payloadPart, signaturePart] = parts

      // 解码 header
      const headerJson = base64UrlDecode(headerPart)
      const header: JWTHeader = JSON.parse(headerJson)

      // 解码 payload
      const payloadJson = base64UrlDecode(payloadPart)
      const payload: JWTPayload = JSON.parse(payloadJson)

      const parsed: ParsedJWT = {
        header,
        payload,
        signature: signaturePart,
        raw: {
          header: headerPart,
          payload: payloadPart,
          signature: signaturePart,
        },
      }

      setParsedJWT(parsed)
      setEditablePayload(JSON.stringify(payload, null, 2))
      setError("")
      setIsValid(null) // 重置验证状态

      toast({
        title: "解析成功",
        description: "JWT token已成功解析",
      })
    } catch (err) {
      setError("JWT解析失败：" + (err instanceof Error ? err.message : "未知错误"))
      setParsedJWT(null)
      setEditablePayload("")
      setIsValid(null)
    }
  }

  // 验证 JWT 签名
  const verifyJWT = async () => {
    if (!parsedJWT) {
      setError("请先解析JWT token")
      return
    }

    if (!secretKey.trim()) {
      setError("请输入密钥")
      return
    }

    setIsVerifying(true)
    setError("")

    try {
      const { header, raw } = parsedJWT
      const alg = header.alg

      // 构建待签名的数据
      const data = `${raw.header}.${raw.payload}`

      let isValidSignature = false

      if (alg.startsWith("HS")) {
        // HMAC 算法
        const algorithm = alg === "HS256" ? "SHA-256" : alg === "HS384" ? "SHA-384" : "SHA-512"

        // 使用 Web Crypto API 进行 HMAC 验证
        const encoder = new TextEncoder()
        const keyData = encoder.encode(secretKey)
        const messageData = encoder.encode(data)

        const cryptoKey = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: algorithm }, false, [
          "sign",
        ])

        const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData)
        const signatureArray = new Uint8Array(signature)

        // 转换为 base64url
        const signatureBase64 = btoa(String.fromCharCode(...signatureArray))
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=/g, "")

        isValidSignature = signatureBase64 === raw.signature
      } else {
        // 其他算法暂不支持
        setError(`暂不支持 ${alg} 算法的验证`)
        setIsVerifying(false)
        return
      }

      setIsValid(isValidSignature)

      toast({
        title: isValidSignature ? "验证成功" : "验证失败",
        description: isValidSignature ? "JWT签名验证通过" : "JWT签名验证失败",
        variant: isValidSignature ? "default" : "destructive",
      })
    } catch (err) {
      setError("签名验证失败：" + (err instanceof Error ? err.message : "未知错误"))
      setIsValid(false)
    } finally {
      setIsVerifying(false)
    }
  }

  // 重新生成 JWT
  const regenerateJWT = async () => {
    if (!parsedJWT) {
      setError("请先解析JWT token")
      return
    }

    if (!secretKey.trim()) {
      setError("请输入密钥")
      return
    }

    if (!editablePayload.trim()) {
      setError("Payload不能为空")
      return
    }

    setIsGenerating(true)
    setError("")

    try {
      // 解析用户编辑的payload
      const newPayload = JSON.parse(editablePayload)

      // 使用原来的header，但确保算法一致
      const header = {
        ...parsedJWT.header,
        alg: algorithm,
      }

      // Base64URL编码
      const headerEncoded = base64UrlEncode(JSON.stringify(header))
      const payloadEncoded = base64UrlEncode(JSON.stringify(newPayload))

      // 构建待签名数据
      const data = `${headerEncoded}.${payloadEncoded}`

      // 生成签名
      let signature = ""
      if (algorithm.startsWith("HS")) {
        const hashAlgorithm = algorithm === "HS256" ? "SHA-256" : algorithm === "HS384" ? "SHA-384" : "SHA-512"

        const encoder = new TextEncoder()
        const keyData = encoder.encode(secretKey)
        const messageData = encoder.encode(data)

        const cryptoKey = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: hashAlgorithm }, false, [
          "sign",
        ])

        const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, messageData)
        const signatureArray = new Uint8Array(signatureBuffer)

        signature = btoa(String.fromCharCode(...signatureArray))
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=/g, "")
      }

      // 构建完整的JWT
      const newJWT = `${headerEncoded}.${payloadEncoded}.${signature}`

      // 更新JWT token输入框
      setJwtToken(newJWT)

      // 更新解析结果
      const updatedParsedJWT: ParsedJWT = {
        header,
        payload: newPayload,
        signature,
        raw: {
          header: headerEncoded,
          payload: payloadEncoded,
          signature,
        },
      }
      setParsedJWT(updatedParsedJWT)
      setIsValid(null) // 重置验证状态

      toast({
        title: "重新生成成功",
        description: "JWT token已重新生成并更新",
      })
    } catch (err) {
      setError("重新生成JWT失败：" + (err instanceof Error ? err.message : "未知错误"))
    } finally {
      setIsGenerating(false)
    }
  }

  // 复制到剪贴板
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(""), 2000)
      toast({
        title: "复制成功",
        description: `${type}已复制到剪贴板`,
      })
    } catch (err) {
      toast({
        title: "复制失败",
        description: "请手动选择并复制文本",
        variant: "destructive",
      })
    }
  }

  // 格式化时间戳
  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleString("zh-CN")
  }

  // 检查token是否过期
  const isTokenExpired = (exp?: number): boolean => {
    if (!exp) return false
    return Date.now() / 1000 > exp
  }

  // 清空所有数据
  const clearAll = () => {
    setJwtToken("")
    setSecretKey("")
    setParsedJWT(null)
    setIsValid(null)
    setError("")
    setCopied("")
    setEditablePayload("")
  }

  // 加载示例JWT - 使用真实有效的JWT
  const loadSampleJWT = () => {
    // 这是一个真实的JWT示例，使用密钥 "your-256-bit-secret"
    const sampleJWT =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3NDA3ODcyMDB9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
    setJwtToken(sampleJWT)
    setSecretKey("your-256-bit-secret")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回首页
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">JWT 解析器</h1>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm">
                <Home className="w-4 h-4 mr-2" />
                工具箱
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-gray-600">解析JWT token结构，验证签名有效性，支持修改Payload重新生成</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* JWT 输入 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  JWT Token 输入
                </CardTitle>
                <CardDescription>粘贴您的JWT token进行解析</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="jwt-input">JWT Token</Label>
                  <Textarea
                    id="jwt-input"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={jwtToken}
                    onChange={(e) => setJwtToken(e.target.value)}
                    className="min-h-[120px] font-mono text-sm"
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={parseJWT} className="flex-1">
                    <FileText className="w-4 h-4 mr-2" />
                    解析 JWT
                  </Button>
                  <Button onClick={loadSampleJWT} variant="outline">
                    示例
                  </Button>
                  <Button onClick={clearAll} variant="outline">
                    清空
                  </Button>
                </div>

                {/* 签名验证 */}
                {parsedJWT && (
                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <Label htmlFor="secret-key">密钥 (用于验证签名和重新生成)</Label>
                      <Input
                        id="secret-key"
                        type="password"
                        placeholder="输入用于签名的密钥..."
                        value={secretKey}
                        onChange={(e) => setSecretKey(e.target.value)}
                        className="font-mono"
                      />
                    </div>

                    <div>
                      <Label htmlFor="algorithm">算法</Label>
                      <Select value={algorithm} onValueChange={setAlgorithm}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="HS256">HS256</SelectItem>
                          <SelectItem value="HS384">HS384</SelectItem>
                          <SelectItem value="HS512">HS512</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={verifyJWT} disabled={isVerifying} className="flex-1">
                        {isVerifying ? (
                          <>
                            <Shield className="w-4 h-4 mr-2 animate-spin" />
                            验证中...
                          </>
                        ) : (
                          <>
                            <Shield className="w-4 h-4 mr-2" />
                            验证签名
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={regenerateJWT}
                        disabled={isGenerating || !secretKey.trim()}
                        variant="secondary"
                        className="flex-1"
                      >
                        {isGenerating ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            生成中...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            重新生成
                          </>
                        )}
                      </Button>
                    </div>

                    {/* 验证结果 */}
                    {isValid !== null && (
                      <div className="flex items-center gap-2">
                        {isValid ? (
                          <>
                            <Unlock className="w-5 h-5 text-green-500" />
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              签名有效
                            </Badge>
                          </>
                        ) : (
                          <>
                            <Lock className="w-5 h-5 text-red-500" />
                            <Badge variant="destructive">签名无效</Badge>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 解析结果 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  解析结果
                </CardTitle>
                <CardDescription>JWT token的详细信息，可编辑Payload重新生成</CardDescription>
              </CardHeader>
              <CardContent>
                {parsedJWT ? (
                  <Tabs defaultValue="header" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="header">Header</TabsTrigger>
                      <TabsTrigger value="payload">Payload</TabsTrigger>
                      <TabsTrigger value="signature">Signature</TabsTrigger>
                    </TabsList>

                    <TabsContent value="header" className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>算法 (alg)</Label>
                          <Badge variant="outline">{parsedJWT.header.alg}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>类型 (typ)</Label>
                          <Badge variant="outline">{parsedJWT.header.typ}</Badge>
                        </div>
                      </div>

                      <div>
                        <Label>完整 Header</Label>
                        <Textarea
                          value={JSON.stringify(parsedJWT.header, null, 2)}
                          readOnly
                          className="min-h-[200px] font-mono text-sm"
                        />
                        <Button
                          onClick={() => copyToClipboard(JSON.stringify(parsedJWT.header, null, 2), "Header")}
                          className="w-full mt-2"
                          variant="outline"
                        >
                          {copied === "Header" ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              已复制
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 mr-2" />
                              复制 Header
                            </>
                          )}
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="payload" className="space-y-4">
                      <div className="space-y-3">
                        {/* 标准声明 */}
                        {parsedJWT.payload.iss && (
                          <div className="flex items-center justify-between">
                            <Label>签发者 (iss)</Label>
                            <span className="text-sm font-mono">{parsedJWT.payload.iss}</span>
                          </div>
                        )}
                        {parsedJWT.payload.sub && (
                          <div className="flex items-center justify-between">
                            <Label>主题 (sub)</Label>
                            <span className="text-sm font-mono">{parsedJWT.payload.sub}</span>
                          </div>
                        )}
                        {parsedJWT.payload.aud && (
                          <div className="flex items-center justify-between">
                            <Label>受众 (aud)</Label>
                            <span className="text-sm font-mono">
                              {Array.isArray(parsedJWT.payload.aud)
                                ? parsedJWT.payload.aud.join(", ")
                                : parsedJWT.payload.aud}
                            </span>
                          </div>
                        )}
                        {parsedJWT.payload.exp && (
                          <div className="flex items-center justify-between">
                            <Label className="flex items-center gap-2">
                              过期时间 (exp)
                              <Clock className="w-4 h-4" />
                              {isTokenExpired(parsedJWT.payload.exp) && (
                                <Badge variant="destructive" className="text-xs">
                                  已过期
                                </Badge>
                              )}
                            </Label>
                            <div className="text-right">
                              <div className="text-sm font-mono">{parsedJWT.payload.exp}</div>
                              <div className="text-xs text-gray-500">{formatTimestamp(parsedJWT.payload.exp)}</div>
                            </div>
                          </div>
                        )}
                        {parsedJWT.payload.nbf && (
                          <div className="flex items-center justify-between">
                            <Label>生效时间 (nbf)</Label>
                            <div className="text-right">
                              <div className="text-sm font-mono">{parsedJWT.payload.nbf}</div>
                              <div className="text-xs text-gray-500">{formatTimestamp(parsedJWT.payload.nbf)}</div>
                            </div>
                          </div>
                        )}
                        {parsedJWT.payload.iat && (
                          <div className="flex items-center justify-between">
                            <Label>签发时间 (iat)</Label>
                            <div className="text-right">
                              <div className="text-sm font-mono">{parsedJWT.payload.iat}</div>
                              <div className="text-xs text-gray-500">{formatTimestamp(parsedJWT.payload.iat)}</div>
                            </div>
                          </div>
                        )}
                        {parsedJWT.payload.jti && (
                          <div className="flex items-center justify-between">
                            <Label>JWT ID (jti)</Label>
                            <span className="text-sm font-mono">{parsedJWT.payload.jti}</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label>可编辑 Payload</Label>
                          <Badge variant="secondary" className="text-xs">
                            可编辑
                          </Badge>
                        </div>
                        <Textarea
                          value={editablePayload}
                          onChange={(e) => setEditablePayload(e.target.value)}
                          className="min-h-[200px] font-mono text-sm"
                          placeholder="编辑Payload内容，必须是有效的JSON格式"
                        />
                        <div className="flex gap-2 mt-2">
                          <Button
                            onClick={() => copyToClipboard(editablePayload, "Payload")}
                            className="flex-1"
                            variant="outline"
                          >
                            {copied === "Payload" ? (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                已复制
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4 mr-2" />
                                复制 Payload
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={() => setEditablePayload(JSON.stringify(parsedJWT.payload, null, 2))}
                            variant="outline"
                            className="flex-1"
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            重置
                          </Button>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          <p>• 修改Payload后，点击左侧"重新生成"按钮生成新的JWT</p>
                          <p>• 确保内容是有效的JSON格式</p>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="signature" className="space-y-4">
                      <div>
                        <Label>签名算法</Label>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <Badge variant="outline" className="text-lg">
                            {parsedJWT.header.alg}
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <Label>签名值</Label>
                        <Textarea value={parsedJWT.signature} readOnly className="min-h-[100px] font-mono text-sm" />
                        <Button
                          onClick={() => copyToClipboard(parsedJWT.signature, "Signature")}
                          className="w-full mt-2"
                          variant="outline"
                        >
                          {copied === "Signature" ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              已复制
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 mr-2" />
                              复制签名
                            </>
                          )}
                        </Button>
                      </div>

                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold mb-2">签名验证说明</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• 签名用于验证JWT的完整性和真实性</li>
                          <li>• 需要提供正确的密钥才能验证签名</li>
                          <li>• 当前支持 HS256、HS384、HS512 算法</li>
                          <li>• 签名验证失败可能表示token被篡改</li>
                        </ul>
                      </div>
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500 min-h-[400px] flex items-center justify-center">
                    <div>
                      <Key className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p>解析后的JWT信息将在这里显示</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {error && (
            <Alert className="mt-6" variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* JWT 信息说明 */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>JWT 结构说明</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Header
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 包含token类型和签名算法</li>
                    <li>• alg: 签名算法 (如 HS256)</li>
                    <li>• typ: token类型 (通常是 JWT)</li>
                    <li>• Base64URL 编码</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Payload
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 包含声明信息 (claims)</li>
                    <li>• iss: 签发者</li>
                    <li>• exp: 过期时间</li>
                    <li>• sub: 主题</li>
                    <li>• 可包含自定义声明</li>
                    <li>
                      • <strong>支持编辑和重新生成</strong>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Signature
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 用于验证token完整性</li>
                    <li>• 基于header和payload生成</li>
                    <li>• 需要密钥进行验证</li>
                    <li>• 防止token被篡改</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
