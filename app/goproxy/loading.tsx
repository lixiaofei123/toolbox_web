import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function GoProxyLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      {/* 顶部导航骨架 */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <Skeleton className="w-24 h-6" />
            </div>
            <Skeleton className="w-16 h-6" />
          </div>
        </div>
      </nav>

      {/* 主要内容区域 */}
      <div className="flex-1">
        <div className="max-w-4xl mx-auto p-6">
          {/* 标题骨架 */}
          <header className="mb-8 text-center">
            <Skeleton className="w-48 h-9 mx-auto mb-2" />
            <Skeleton className="w-64 h-6 mx-auto" />
          </header>

          <div className="space-y-6">
            {/* 代理地址卡片骨架 */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Skeleton className="w-5 h-5" />
                  <Skeleton className="w-20 h-6" />
                </div>
                <Skeleton className="w-48 h-5" />
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="w-80 h-6" />
                    <Skeleton className="w-16 h-8" />
                  </div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <Skeleton className="w-full h-4 mb-2" />
                  <Skeleton className="w-3/4 h-4" />
                </div>
              </CardContent>
            </Card>

            {/* 使用方法卡片骨架 */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Skeleton className="w-5 h-5" />
                  <Skeleton className="w-20 h-6" />
                </div>
                <Skeleton className="w-64 h-5" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Skeleton className="w-20 h-5" />
                    <Skeleton className="w-32 h-4" />
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <Skeleton className="w-96 h-5 bg-gray-700" />
                      <Skeleton className="w-16 h-8" />
                    </div>
                  </div>
                  <Skeleton className="w-full h-4 mt-2" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Skeleton className="w-16 h-5" />
                    <Skeleton className="w-28 h-4" />
                  </div>
                  <div className="bg-blue-900 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <Skeleton className="w-80 h-5 bg-blue-700" />
                      <Skeleton className="w-16 h-8" />
                    </div>
                  </div>
                  <Skeleton className="w-full h-4 mt-2" />
                </div>
              </CardContent>
            </Card>

            {/* 验证配置卡片骨架 */}
            <Card>
              <CardHeader>
                <Skeleton className="w-20 h-6" />
                <Skeleton className="w-48 h-5" />
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="w-32 h-5 bg-gray-700" />
                    <Skeleton className="w-16 h-8" />
                  </div>
                </div>
                <Skeleton className="w-full h-4 mt-2" />
              </CardContent>
            </Card>

            {/* 使用说明卡片骨架 */}
            <Card>
              <CardHeader>
                <Skeleton className="w-32 h-6" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Skeleton className="w-40 h-5 mb-2" />
                  <Skeleton className="w-full h-4 mb-1" />
                  <Skeleton className="w-3/4 h-4" />
                </div>
                <div>
                  <Skeleton className="w-32 h-5 mb-2" />
                  <Skeleton className="w-full h-4 mb-1" />
                  <Skeleton className="w-5/6 h-4" />
                </div>
                <div>
                  <Skeleton className="w-20 h-5 mb-2" />
                  <div className="space-y-1">
                    <Skeleton className="w-full h-4" />
                    <Skeleton className="w-4/5 h-4" />
                    <Skeleton className="w-3/4 h-4" />
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
