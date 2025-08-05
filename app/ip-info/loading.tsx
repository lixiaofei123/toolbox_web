import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* 顶部导航栏骨架 */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-8 w-20" />
              <div className="w-px h-6 bg-gray-300" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      </header>

      {/* 主要内容骨架 */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center mb-6">
          <Skeleton className="w-12 h-12 rounded-full mx-auto mb-3" />
          <Skeleton className="h-6 w-48 mx-auto mb-1" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 左侧骨架 */}
          <div className="space-y-4">
            {/* 基本信息卡片骨架 */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-24" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-3">
                  <div className="p-2 bg-gray-50 rounded">
                    <Skeleton className="h-3 w-12 mb-1" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <Skeleton className="h-3 w-12 mb-1" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2 bg-gray-50 rounded">
                      <Skeleton className="h-3 w-8 mb-1" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <div className="p-2 bg-gray-50 rounded">
                      <Skeleton className="h-3 w-8 mb-1" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 地理位置卡片骨架 */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-24" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="p-2 bg-gray-50 rounded">
                      <Skeleton className="h-3 w-12 mb-1" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 国家代码卡片骨架 */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-24" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="text-center p-2 bg-gray-50 rounded">
                      <Skeleton className="h-3 w-12 mx-auto mb-1" />
                      <Skeleton className="h-4 w-8 mx-auto" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧地图骨架 */}
          <div className="space-y-4">
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-3 w-48" />
              </CardHeader>
              <CardContent className="p-0">
                <Skeleton className="h-96 w-full rounded-b-lg" />
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="pt-4">
                <Skeleton className="h-4 w-32 mb-2" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-28" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
