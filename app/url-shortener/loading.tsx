import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Link2, Plus, Trash2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header Skeleton */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-8 w-32" />
            </div>
            <Skeleton className="h-9 w-20" />
          </div>
        </div>
      </header>

      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Skeleton className="h-6 w-80 mx-auto" />
          </div>

          {/* Tabs Skeleton */}
          <div className="w-full mb-6">
            <div className="grid w-full grid-cols-2 h-10 bg-muted rounded-md p-1">
              <div className="flex items-center justify-center gap-2 bg-background rounded-sm">
                <Plus className="w-4 h-4" />
                <span>生成短网址</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Trash2 className="w-4 h-4" />
                <span>删除短网址</span>
              </div>
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="w-5 h-5" />
                  生成短网址
                </CardTitle>
                <CardDescription>输入原始网址和设置参数</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-12 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-6 w-11" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 w-16" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Skeleton className="w-5 h-5" />
                  生成结果
                </CardTitle>
                <CardDescription>生成的短网址</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
                  <div>
                    <Link2 className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>生成的短网址将在这里显示</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
