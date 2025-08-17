"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, ExternalLink, Zap, ArrowLeft, Home } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function CdnAccelerator() {
  const [currentDomain, setCurrentDomain] = useState("")
  const [customUrl, setCustomUrl] = useState("")
  const [cnbUrl, setCnbUrl] = useState("")
  const [convertedCnbUrl, setConvertedCnbUrl] = useState("")
  const [githubUrl, setGithubUrl] = useState("")
  const [convertedGithubUrl, setConvertedGithubUrl] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    if (typeof window !== "undefined") {
      const origin = window.location.origin
      setCurrentDomain(origin)
    }
  }, [])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "复制成功",
        description: "链接已复制到剪贴板",
      })
    } catch (err) {
      toast({
        title: "复制失败",
        description: "请手动复制链接",
        variant: "destructive",
      })
    }
  }

  const convertCnbUrl = (url: string) => {
    const cnbRegex = /^https:\/\/cnb\.cool\/([^/]+)\/([^/]+)\/-\/(?:blob|git\/raw)\/([^/]+)\/(.+)$/
    const match = url.match(cnbRegex)

    if (match) {
      const [, username, project, version, filePath] = match
      return `${currentDomain}/cdn/cnb/${username}/${project}@${version}/${filePath}`
    }

    return ""
  }

  const convertGithubUrl = (url: string) => {
    const githubBlobRegex = /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/
    const githubRawRegex = /^https:\/\/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/refs\/heads\/([^/]+)\/(.+)$/

    let match = url.match(githubBlobRegex)
    if (match) {
      const [, username, project, branch, filePath] = match
      return `${currentDomain}/cdn/gh/${username}/${project}@${branch}/${filePath}`
    }

    match = url.match(githubRawRegex)
    if (match) {
      const [, username, project, branch, filePath] = match
      return `${currentDomain}/cdn/gh/${username}/${project}@${branch}/${filePath}`
    }

    return ""
  }

  const handleCnbConvert = () => {
    const converted = convertCnbUrl(cnbUrl)
    if (converted) {
      setConvertedCnbUrl(converted)
      copyToClipboard(converted)
    } else {
      toast({
        title: "转换失败",
        description: "请输入正确的CNB平台链接格式",
        variant: "destructive",
      })
    }
  }

  const handleGithubConvert = () => {
    const converted = convertGithubUrl(githubUrl)
    if (converted) {
      setConvertedGithubUrl(converted)
      copyToClipboard(converted)
    } else {
      toast({
        title: "转换失败",
        description: "请输入正确的GitHub链接格式",
        variant: "destructive",
      })
    }
  }

  const examples = [
    {
      title: "jQuery 示例",
      original: "https://cdn.jsdelivr.net/gh/jquery/jquery@3.6.4/dist/jquery.min.js",
      accelerated: `${currentDomain}/cdn/gh/jquery/jquery@3.6.4/dist/jquery.min.js`,
    },
  ]

  const cnbExamples = [
    {
      title: "CNB 平台资源示例",
      original: "https://cnb.cool/xiaofei/jquery/-/blob/3.6.4/dist/jquery.min.js",
      accelerated: `${currentDomain}/cdn/cnb/xiaofei/jquery@3.6.4/dist/jquery.min.js`,
    },
  ]

  const githubExamples = [
    {
      title: "GitHub 平台资源示例",
      original: "https://github.com/caddyserver/caddy/blob/master/cmd/cobra.go",
      accelerated: `${currentDomain}/cdn/gh/caddyserver/caddy@master/cmd/cobra.go`,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
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
              <h1 className="text-2xl font-bold text-gray-900">静态资源加速</h1>
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

      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Zap className="w-8 h-8 text-yellow-600" />
              <h1 className="text-3xl font-bold">静态资源加速</h1>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              通过本站 CDN 加速服务，提升静态资源加载速度，支持 jsdelivr 和 cnb 平台资源代理
            </p>
          </div>

          <div className="mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="w-5 h-5" />
                  当前加速域名
                </CardTitle>
                <CardDescription>您的 CDN 加速服务地址</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input value={`${currentDomain}/cdn`} readOnly className="font-mono" />
                  <Button onClick={() => copyToClipboard(`${currentDomain}/cdn`)} size="sm" variant="outline">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 text-amber-600 mt-0.5">
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.19-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-amber-800 mb-1">建议自行部署</p>
                      <p className="text-sm text-amber-700">
                        为了获得最佳的加速效果和稳定性，建议您自行部署本工具到 EdgeOne Pages 上。
                        <a
                          href="https://github.com/lixiaofei123/toolbox_web"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 ml-1 text-blue-600 hover:text-blue-800 underline"
                        >
                          查看部署教程
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="jsdelivr" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="jsdelivr">jsdelivr 加速</TabsTrigger>
              <TabsTrigger value="github">GitHub 平台代理</TabsTrigger>
              <TabsTrigger value="cnb">CNB 平台代理</TabsTrigger>
              <TabsTrigger value="custom">自定义代理</TabsTrigger>
            </TabsList>

            <TabsContent value="jsdelivr" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>jsdelivr CDN 加速</CardTitle>
                  <CardDescription>替代 https://cdn.jsdelivr.net/ 加速，只需要将域名替换即可</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>使用方法</Label>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">将原始链接中的：</p>
                      <code className="text-sm bg-white px-2 py-1 rounded">https://cdn.jsdelivr.net/</code>
                      <p className="text-sm text-gray-600 my-2">替换为：</p>
                      <code className="text-sm bg-white px-2 py-1 rounded">{currentDomain}/cdn/</code>
                    </div>
                  </div>

                  {examples.map((example, index) => (
                    <div key={index} className="space-y-2">
                      <Label>{example.title}</Label>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label className="text-xs text-gray-500 w-16">原始：</Label>
                          <Input value={example.original} readOnly className="font-mono text-xs" />
                          <Button onClick={() => copyToClipboard(example.original)} size="sm" variant="outline">
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="text-xs text-green-600 w-16">加速：</Label>
                          <Input value={example.accelerated} readOnly className="font-mono text-xs" />
                          <Button onClick={() => copyToClipboard(example.accelerated)} size="sm" variant="outline">
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="github" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>GitHub 平台资源代理</CardTitle>
                  <CardDescription>
                    代理 GitHub 平台的资源，实现类似于 https://cdn.jsdelivr.net/gh 的效果
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>使用方法</Label>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">使用格式：</p>
                      <code className="text-sm bg-white px-2 py-1 rounded">
                        {currentDomain}/cdn/gh/用户名/仓库名@分支名/文件路径
                      </code>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="github-url">GitHub 链接转换</Label>
                    <div className="flex gap-2">
                      <Input
                        id="github-url"
                        placeholder="https://github.com/caddyserver/caddy/blob/master/cmd/cobra.go"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        className="font-mono"
                      />
                      <Button onClick={handleGithubConvert} disabled={!githubUrl}>
                        转换并复制
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">请输入Github上公开仓库的文件原始链接,raw和blob链接皆可</p>
                  </div>

                  {convertedGithubUrl && (
                    <div className="space-y-2">
                      <Label>转换结果</Label>
                      <div className="flex items-center gap-2">
                        <Input value={convertedGithubUrl} readOnly className="font-mono text-sm" />
                        <Button onClick={() => copyToClipboard(convertedGithubUrl)} size="sm" variant="outline">
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {githubExamples.map((example, index) => (
                    <div key={index} className="space-y-2">
                      <Label>{example.title}</Label>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label className="text-xs text-gray-500 w-16">原始：</Label>
                          <Input value={example.original} readOnly className="font-mono text-xs" />
                          <Button onClick={() => copyToClipboard(example.original)} size="sm" variant="outline">
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="text-xs text-green-600 w-16">加速：</Label>
                          <Input value={example.accelerated} readOnly className="font-mono text-xs" />
                          <Button onClick={() => copyToClipboard(example.accelerated)} size="sm" variant="outline">
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cnb" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>CNB 平台资源代理</CardTitle>
                  <CardDescription>代理 CNB 平台的资源，实现类似于 https://cdn.jsdelivr.net/gh 的效果</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>使用方法</Label>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">使用格式：</p>
                      <code className="text-sm bg-white px-2 py-1 rounded">
                        {currentDomain}/cdn/cnb/组织名/仓库名@版本号/文件路径
                      </code>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cnb-url">CNB 链接转换</Label>
                    <div className="flex gap-2">
                      <Input
                        id="cnb-url"
                        placeholder="https://cnb.cool/xiaofei/jquery/-/blob/3.6.4/dist/jquery.min.js"
                        value={cnbUrl}
                        onChange={(e) => setCnbUrl(e.target.value)}
                        className="font-mono"
                      />
                      <Button onClick={handleCnbConvert} disabled={!cnbUrl}>
                        转换并复制
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">请输入CNB上公开仓库的文件原始链接,raw和blob链接皆可</p>
                  </div>

                  {convertedCnbUrl && (
                    <div className="space-y-2">
                      <Label>转换结果</Label>
                      <div className="flex items-center gap-2">
                        <Input value={convertedCnbUrl} readOnly className="font-mono text-sm" />
                        <Button onClick={() => copyToClipboard(convertedCnbUrl)} size="sm" variant="outline">
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {cnbExamples.map((example, index) => (
                    <div key={index} className="space-y-2">
                      <Label>{example.title}</Label>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label className="text-xs text-gray-500 w-16">原始：</Label>
                          <Input value={example.original} readOnly className="font-mono text-xs" />
                          <Button onClick={() => copyToClipboard(example.original)} size="sm" variant="outline">
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="text-xs text-green-600 w-16">加速：</Label>
                          <Input value={example.accelerated} readOnly className="font-mono text-xs" />
                          <Button onClick={() => copyToClipboard(example.accelerated)} size="sm" variant="outline">
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="custom" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>自定义网址代理</CardTitle>
                  <CardDescription>直接代理任意网址，在 CDN 地址后面加上要代理的完整网址</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>使用方法</Label>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">使用格式：</p>
                      <code className="text-sm bg-white px-2 py-1 rounded">
                        {currentDomain}/cdn/proxy/要代理的完整网址
                      </code>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="custom-url">输入要代理的网址</Label>
                    <div className="flex gap-2">
                      <Input
                        id="custom-url"
                        placeholder="https://example.com/path/to/file.js"
                        value={customUrl}
                        onChange={(e) => setCustomUrl(e.target.value)}
                        className="font-mono"
                      />
                      <Button
                        onClick={() => {
                          if (customUrl) {
                            copyToClipboard(`${currentDomain}/cdn/proxy/${customUrl}`)
                          }
                        }}
                        disabled={!customUrl}
                      >
                        生成并复制
                      </Button>
                    </div>
                  </div>

                  {customUrl && (
                    <div className="space-y-2">
                      <Label>生成的加速链接</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          value={`${currentDomain}/cdn/proxy/${customUrl}`}
                          readOnly
                          className="font-mono text-sm"
                        />
                        <Button
                          onClick={() => copyToClipboard(`${currentDomain}/cdn/proxy/${customUrl}`)}
                          size="sm"
                          variant="outline"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>使用说明</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-600">
                <p>
                  • <strong>jsdelivr 加速：</strong>适用于加速 npm 包和 GitHub 仓库资源
                </p>
                <p>
                  • <strong>GitHub 平台代理：</strong>专门用于代理 GitHub 平台的代码仓库资源
                </p>
                <p>
                  • <strong>CNB 平台代理：</strong>专门用于代理腾讯 CNB 平台的代码仓库资源
                </p>
                <p>
                  • <strong>自定义代理：</strong>可以代理任意公开的网络资源
                </p>
                <p>• 所有代理服务都会自动缓存资源，提升后续访问速度</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
