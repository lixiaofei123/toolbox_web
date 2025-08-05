import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* 顶部导航栏骨架 */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-32" />
            <div className="w-24"></div>
          </div>
        </div>
      </div>

      {/* 主要内容骨架 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
          <Skeleton className="h-8 w-48 mx-auto mb-2" />
          <Skeleton className="h-4 w-96 mx-auto" />
        </div>

        <div className="space-y-6">
          {/* 控制面板骨架 */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-32" />
            </CardContent>
          </Card>

          {/* 信息卡片骨架 */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
