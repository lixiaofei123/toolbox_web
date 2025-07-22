"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Copy, Shield, ArrowLeft, Home, CheckCircle, RefreshCw, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function PasswordGenerator() {
  const [password, setPassword] = useState("")
  const [length, setLength] = useState([12])
  const [includeUppercase, setIncludeUppercase] = useState(true)
  const [includeLowercase, setIncludeLowercase] = useState(true)
  const [includeNumbers, setIncludeNumbers] = useState(true)
  const [includeSymbols, setIncludeSymbols] = useState(true)
  const [excludeSimilar, setExcludeSimilar] = useState(false)
  const [showPassword, setShowPassword] = useState(true)
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: "", color: "" })
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const generatePassword = () => {
    let charset = ""

    if (includeUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    if (includeLowercase) charset += "abcdefghijklmnopqrstuvwxyz"
    if (includeNumbers) charset += "0123456789"
    if (includeSymbols) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?"

    if (excludeSimilar) {
      charset = charset.replace(/[0O1lI]/g, "")
    }

    if (!charset) {
      toast({
        title: "生成失败",
        description: "请至少选择一种字符类型",
        variant: "destructive",
      })
      return
    }

    let newPassword = ""
    for (let i = 0; i < length[0]; i++) {
      newPassword += charset.charAt(Math.floor(Math.random() * charset.length))
    }

    setPassword(newPassword)
    calculateStrength(newPassword)

    toast({
      title: "密码生成成功",
      description: "新密码已生成",
    })
  }

  const calculateStrength = (pwd: string) => {
    let score = 0
    const feedback = []

    // 长度检查
    if (pwd.length >= 8) score += 1
    if (pwd.length >= 12) score += 1
    if (pwd.length >= 16) score += 1

    // 字符类型检查
    if (/[a-z]/.test(pwd)) score += 1
    if (/[A-Z]/.test(pwd)) score += 1
    if (/[0-9]/.test(pwd)) score += 1
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1

    // 复杂度检查
    if (pwd.length >= 10 && /[a-z]/.test(pwd) && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) {
      score += 1
    }

    let strengthText = ""
    let strengthColor = ""

    if (score <= 2) {
      strengthText = "弱"
      strengthColor = "text-red-500"
    } else if (score <= 4) {
      strengthText = "中等"
      strengthColor = "text-yellow-500"
    } else if (score <= 6) {
      strengthText = "强"
      strengthColor = "text-green-500"
    } else {
      strengthText = "非常强"
      strengthColor = "text-green-600"
    }

    setPasswordStrength({ score, text: strengthText, color: strengthColor })
  }

  const copyToClipboard = async () => {
    if (!password) return

    try {
      await navigator.clipboard.writeText(password)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: "复制成功",
        description: "密码已复制到剪贴板",
      })
    } catch (err) {
      toast({
        title: "复制失败",
        description: "请手动选择并复制密码",
        variant: "destructive",
      })
    }
  }

  const generateMultiplePasswords = () => {
    const passwords = []
    for (let i = 0; i < 5; i++) {
      let charset = ""

      if (includeUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
      if (includeLowercase) charset += "abcdefghijklmnopqrstuvwxyz"
      if (includeNumbers) charset += "0123456789"
      if (includeSymbols) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?"

      if (excludeSimilar) {
        charset = charset.replace(/[0O1lI]/g, "")
      }

      let pwd = ""
      for (let j = 0; j < length[0]; j++) {
        pwd += charset.charAt(Math.floor(Math.random() * charset.length))
      }
      passwords.push(pwd)
    }
    return passwords
  }

  const [multiplePasswords, setMultiplePasswords] = useState<string[]>([])

  const generateBatch = () => {
    const passwords = generateMultiplePasswords()
    setMultiplePasswords(passwords)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100">
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
              <h1 className="text-2xl font-bold text-gray-900">密码生成器</h1>
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
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-gray-600">生成安全的随机密码，保护您的账户安全</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* 密码设置 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  密码设置
                </CardTitle>
                <CardDescription>自定义密码生成规则</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="password-length">密码长度: {length[0]}</Label>
                  <Slider
                    id="password-length"
                    min={4}
                    max={50}
                    step={1}
                    value={length}
                    onValueChange={setLength}
                    className="mt-2"
                  />
                </div>

                <div className="space-y-4">
                  <Label>字符类型</Label>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="uppercase" checked={includeUppercase} onCheckedChange={setIncludeUppercase} />
                      <Label htmlFor="uppercase" className="text-sm">
                        大写字母 (A-Z)
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox id="lowercase" checked={includeLowercase} onCheckedChange={setIncludeLowercase} />
                      <Label htmlFor="lowercase" className="text-sm">
                        小写字母 (a-z)
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox id="numbers" checked={includeNumbers} onCheckedChange={setIncludeNumbers} />
                      <Label htmlFor="numbers" className="text-sm">
                        数字 (0-9)
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox id="symbols" checked={includeSymbols} onCheckedChange={setIncludeSymbols} />
                      <Label htmlFor="symbols" className="text-sm">
                        特殊字符 (!@#$%^&*)
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>高级选项</Label>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="exclude-similar" checked={excludeSimilar} onCheckedChange={setExcludeSimilar} />
                    <Label htmlFor="exclude-similar" className="text-sm">
                      排除相似字符 (0, O, 1, l, I)
                    </Label>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={generatePassword} className="flex-1">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    生成密码
                  </Button>
                  <Button onClick={generateBatch} variant="outline">
                    批量生成
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 密码结果 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  生成的密码
                </CardTitle>
                <CardDescription>您的安全密码</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {password ? (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="generated-password">密码</Label>
                        <Button variant="ghost" size="sm" onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                      <div className="relative">
                        <Input
                          id="generated-password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          readOnly
                          className="font-mono text-lg pr-12"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <Label className="text-sm">密码强度</Label>
                        <p className={`font-semibold ${passwordStrength.color}`}>{passwordStrength.text}</p>
                      </div>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-3 h-3 rounded-full ${
                              i < passwordStrength.score
                                ? passwordStrength.score <= 2
                                  ? "bg-red-500"
                                  : passwordStrength.score <= 4
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                                : "bg-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <Button onClick={copyToClipboard} className="w-full bg-transparent" variant="outline">
                      {copied ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          已复制
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          复制密码
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500 min-h-[200px] flex items-center justify-center">
                    <div>
                      <Shield className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p>生成的密码将在这里显示</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 批量生成结果 */}
          {multiplePasswords.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>批量生成的密码</CardTitle>
                <CardDescription>多个密码选项供您选择</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {multiplePasswords.map((pwd, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <Input value={pwd} readOnly className="font-mono text-sm" />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setPassword(pwd)
                          calculateStrength(pwd)
                        }}
                      >
                        选择
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(pwd)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 密码安全提示 */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>密码安全提示</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">强密码特征</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 长度至少12个字符</li>
                    <li>• 包含大小写字母、数字和特殊字符</li>
                    <li>• 避免使用个人信息</li>
                    <li>• 不使用常见的密码模式</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">使用建议</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 为每个账户使用不同的密码</li>
                    <li>• 定期更换重要账户密码</li>
                    <li>• 使用密码管理器存储密码</li>
                    <li>• 启用双因素认证</li>
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
