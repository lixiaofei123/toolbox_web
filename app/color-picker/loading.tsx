import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ColorPickerLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header Skeleton */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-20" />
              <div className="h-6 w-px bg-gray-200" />
              <div className="flex items-center gap-2">
                <Skeleton className="w-5 h-5 rounded" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 gap-6">
          {/* 工具说明骨架 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Skeleton className="w-5 h-5 rounded" />
                <Skeleton className="h-6 w-20" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Skeleton className="w-6 h-6 rounded-full flex-shrink-0" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 主要内容骨架 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-24" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
              <Skeleton className="h-4 w-96 mt-2" />
            </CardHeader>
            <CardContent>
              <div className="flex gap-6">
                {/* 图片区域骨架 */}
                <div className="relative">
                  <Skeleton className="w-[600px] h-[400px] rounded-lg" />
                </div>

                {/* 右侧工具区域骨架 */}
                <div className="flex flex-col gap-4">
                  {/* 放大镜骨架 */}
                  <div className="border rounded-lg p-3 bg-white shadow-sm">
                    <Skeleton className="h-4 w-16 mb-2" />
                    <Skeleton className="w-[150px] h-[150px] rounded" />
                    <div className="mt-2 space-y-1">
                      <Skeleton className="h-3 w-24 mx-auto" />
                      <Skeleton className="h-3 w-20 mx-auto" />
                    </div>
                  </div>

                  {/* 颜色信息骨架 */}
                  <div className="border rounded-lg p-3 bg-white shadow-sm w-[156px]">
                    <Skeleton className="h-4 w-16 mb-3" />
                    <Skeleton className="w-full h-16 rounded mb-3" />
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i}>
                          <div className="flex items-center justify-between mb-1">
                            <Skeleton className="h-3 w-8" />
                            <Skeleton className="h-6 w-6 rounded" />
                          </div>
                          <Skeleton className="h-6 w-full rounded" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
