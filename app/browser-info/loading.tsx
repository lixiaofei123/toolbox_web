import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Monitor, Home, Eye } from "lucide-react"
import Link from "next/link"

export default function BrowserInfoLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <Home className="w-4 h-4 mr-2" />
                  返回首页
                </Button>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-2">
                <Monitor className="w-5 h-5 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">浏览器信息检测</h1>
              </div>
            </div>
            <Badge variant="secondary">
              <Eye className="w-3 h-3 mr-1" />
              系统检测
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-8 w-20" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* 标签页骨架 */}
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 flex-1" />
                  ))}
                </div>

                {/* 内容骨架 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i}>
                      <CardHeader className="pb-3">
                        <Skeleton className="h-6 w-24" />
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {Array.from({ length: 3 }).map((_, j) => (
                          <div key={j} className="flex justify-between items-center py-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
