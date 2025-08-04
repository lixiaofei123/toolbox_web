import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeftRight, Home } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" disabled>
                <Home className="w-4 h-4 mr-2" />
                返回首页
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">JSON/YAML转换器</h1>
              </div>
            </div>
            <Badge variant="secondary">
              <ArrowLeftRight className="w-3 h-3 mr-1" />
              格式转换
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center mb-8">
          <p className="text-gray-600">支持JSON和YAML格式互相转换，自动检测语法错误</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* JSON区域 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>JSON</span>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </CardTitle>
              <CardDescription>输入或粘贴JSON内容</CardDescription>
            </CardHeader>
            <CardContent>
              <Skeleton className="w-full h-[400px]" />
            </CardContent>
          </Card>

          {/* YAML区域 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>YAML</span>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-16" />
                </div>
              </CardTitle>
              <CardDescription>输入或粘贴YAML内容</CardDescription>
            </CardHeader>
            <CardContent>
              <Skeleton className="w-full h-[400px]" />
            </CardContent>
          </Card>
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-center gap-4 mt-6">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </div>
  )
}
