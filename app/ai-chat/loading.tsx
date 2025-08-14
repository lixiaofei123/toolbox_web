export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* 导航栏骨架 */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-24 h-6 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* 主要内容骨架 */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 animate-pulse"></div>
          <div className="w-32 h-8 bg-gray-200 rounded mx-auto mb-2 animate-pulse"></div>
          <div className="w-64 h-4 bg-gray-200 rounded mx-auto animate-pulse"></div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {/* 聊天区域骨架 */}
          <div className="h-96 mb-4 space-y-4">
            <div className="flex justify-start">
              <div className="w-3/4 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
            <div className="flex justify-end">
              <div className="w-2/3 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
            <div className="flex justify-start">
              <div className="w-4/5 h-16 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>

          {/* 输入区域骨架 */}
          <div className="flex gap-2">
            <div className="flex-1 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
