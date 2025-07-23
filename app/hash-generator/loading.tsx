import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function HashGeneratorLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header Skeleton */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-20" />
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <div>
                <Skeleton className="h-6 w-40 mb-1" />
                <Skeleton className="h-4 w-60" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Algorithm Selection Skeleton */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-t-lg">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-80" />
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-12 w-full" />
              </div>
              <div className="p-4 border-2 rounded-lg">
                <Skeleton className="h-5 w-24 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Skeleton */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 h-12 bg-gray-100 rounded-lg p-1">
            <Skeleton className="h-full rounded-md" />
            <Skeleton className="h-full rounded-md" />
          </div>

          {/* Content Skeleton */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-60" />
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </div>

        {/* Security Guidelines Skeleton */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-t-lg">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-80" />
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <Skeleton className="h-5 w-24 mb-3" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <Skeleton className="h-5 w-24 mb-3" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </div>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Skeleton className="h-5 w-20 mb-2" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
