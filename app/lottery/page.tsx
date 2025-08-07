'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Upload, Plus, Trash2, Play, Square, Users, FileText, Settings, Gift, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
// import { toast } from '@/hooks/use-toast'

interface Participant {
  id: string
  name: string
}

interface Prize {
  id: string
  name: string
  weight: number
  color: string
}

type LotteryMode = 'participants' | 'wheel'

export default function LotteryPage() {
  const [mode, setMode] = useState<LotteryMode>('participants')
  
  // 参与者模式状态
  const [participants, setParticipants] = useState<Participant[]>([])
  const [newParticipant, setNewParticipant] = useState('')
  const [winnerCount, setWinnerCount] = useState(1)
  const [isDrawing, setIsDrawing] = useState(false)
  const [winners, setWinners] = useState<Participant[]>([])
  const [currentDisplayIndex, setCurrentDisplayIndex] = useState(-1)
  const [rollingNames, setRollingNames] = useState<string[]>([])
  
  // 转盘模式状态
  const [prizes, setPrizes] = useState<Prize[]>([])
  const [newPrizeName, setNewPrizeName] = useState('')
  const [newPrizeWeight, setNewPrizeWeight] = useState(1)
  const [wheelRotation, setWheelRotation] = useState(0)
  const [isWheelSpinning, setIsWheelSpinning] = useState(false)
  const [wheelWinner, setWheelWinner] = useState<Prize | null>(null)
  
  // 分页相关
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const totalPages = Math.ceil(participants.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentParticipants = participants.slice(startIndex, endIndex)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const drawingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const displayIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const wheelSpinRef = useRef<NodeJS.Timeout | null>(null)

  // 预定义颜色
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
  ]

  // 添加参与者
  const addParticipant = () => {
    if (!newParticipant.trim()) {
      return
    }

    if (participants.some(p => p.name === newParticipant.trim())) {
      return
    }

    const newId = Date.now().toString()
    setParticipants(prev => [...prev, { id: newId, name: newParticipant.trim() }])
    setNewParticipant('')
  }

  // 删除参与者
  const removeParticipant = (id: string) => {
    setParticipants(prev => prev.filter(p => p.id !== id))
    const newTotalPages = Math.ceil((participants.length - 1) / itemsPerPage)
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages)
    }
  }

  // 添加奖品
  const addPrize = () => {
    if (!newPrizeName.trim()) {
      return
    }

    if (prizes.some(p => p.name === newPrizeName.trim())) {
      return
    }

    const newId = Date.now().toString()
    const color = colors[prizes.length % colors.length]
    setPrizes(prev => [...prev, { 
      id: newId, 
      name: newPrizeName.trim(), 
      weight: newPrizeWeight,
      color 
    }])
    setNewPrizeName('')
    setNewPrizeWeight(1)
  }

  // 删除奖品
  const removePrize = (id: string) => {
    setPrizes(prev => prev.filter(p => p.id !== id))
  }

  // 导入txt文件
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== 'text/plain') {
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      const names = content
        .split('\n')
        .map(name => name.trim())
        .filter(name => name.length > 0)
        .filter((name, index, arr) => arr.indexOf(name) === index)

      if (names.length === 0) {
        return
      }

      const newParticipants = names.map(name => ({
        id: `${Date.now()}-${Math.random()}`,
        name
      }))

      setParticipants(prev => {
        const existingNames = prev.map(p => p.name)
        const uniqueNew = newParticipants.filter(p => !existingNames.includes(p.name))
        return [...prev, ...uniqueNew]
      })
    }

    reader.readAsText(file, 'UTF-8')
    event.target.value = ''
  }

  // 批量添加参与者
  const handleBatchAdd = (text: string) => {
    const names = text
      .split('\n')
      .map(name => name.trim())
      .filter(name => name.length > 0)
      .filter((name, index, arr) => arr.indexOf(name) === index)

    if (names.length === 0) {
      return
    }

    const newParticipants = names.map(name => ({
      id: `${Date.now()}-${Math.random()}`,
      name
    }))

    setParticipants(prev => {
      const existingNames = prev.map(p => p.name)
      const uniqueNew = newParticipants.filter(p => !existingNames.includes(p.name))
      return [...prev, ...uniqueNew]
    })
  }

  // 开始参与者抽奖
  const startDraw = () => {
    if (participants.length === 0) {
      return
    }

    if (winnerCount > participants.length) {
      return
    }

    setIsDrawing(true)
    setWinners([])
    setCurrentDisplayIndex(-1)

    // 加快滚动速度，从100ms改为50ms
    drawingIntervalRef.current = setInterval(() => {
      const randomNames = Array.from({ length: winnerCount }, () => {
        const randomIndex = Math.floor(Math.random() * participants.length)
        return participants[randomIndex].name
      })
      setRollingNames(randomNames)
    }, 50)
  }

  // 停止参与者抽奖
  const stopDraw = () => {
    if (drawingIntervalRef.current) {
      clearInterval(drawingIntervalRef.current)
      drawingIntervalRef.current = null
    }

    setIsDrawing(false)
    setRollingNames([])

    const shuffled = [...participants].sort(() => Math.random() - 0.5)
    const selectedWinners = shuffled.slice(0, winnerCount)
    setWinners(selectedWinners)

    setCurrentDisplayIndex(0)
    let index = 0
    displayIntervalRef.current = setInterval(() => {
      if (index < selectedWinners.length - 1) {
        index++
        setCurrentDisplayIndex(index)
      } else {
        if (displayIntervalRef.current) {
          clearInterval(displayIntervalRef.current)
          displayIntervalRef.current = null
        }
      }
    }, 1000)
  }

  // 开始转盘抽奖
  const startWheelSpin = () => {
    if (prizes.length === 0) {
      return
    }

    setIsWheelSpinning(true)
    setWheelWinner(null)

    // 计算总权重
    const totalWeight = prizes.reduce((sum, prize) => sum + prize.weight, 0)
    
    // 随机选择获奖者
    const random = Math.random() * totalWeight
    let currentWeight = 0
    let selectedPrize = prizes[0]
    
    for (const prize of prizes) {
      currentWeight += prize.weight
      if (random <= currentWeight) {
        selectedPrize = prize
        break
      }
    }

    // 计算转盘应该停止的角度
    let accumulatedAngle = 0
    let targetAngle = 0
    
    for (let i = 0; i < prizes.length; i++) {
      const prize = prizes[i]
      const prizeAngle = (prize.weight / totalWeight) * 360
      
      if (prize.id === selectedPrize.id) {
        // 停在该奖品区域的中间，让指针指向正确位置
        targetAngle = accumulatedAngle + (prizeAngle / 2)
        break
      }
      accumulatedAngle += prizeAngle
    }

    // 修正旋转角度，确保指针指向中奖奖品
    const finalRotation = wheelRotation + 1800 + targetAngle

    setWheelRotation(finalRotation)

    // 3秒后停止并显示结果
    wheelSpinRef.current = setTimeout(() => {
      setIsWheelSpinning(false)
      setWheelWinner(selectedPrize)
    }, 3000)
  }

  // 重置转盘
  const resetWheel = () => {
    if (wheelSpinRef.current) {
      clearTimeout(wheelSpinRef.current)
      wheelSpinRef.current = null
    }
    setIsWheelSpinning(false)
    setWheelWinner(null)
    setWheelRotation(0)
  }

  // 清空所有参与者
  const clearAll = () => {
    setParticipants([])
    setWinners([])
    setCurrentDisplayIndex(-1)
    setCurrentPage(1)
  }

  // 清空所有奖品
  const clearAllPrizes = () => {
    setPrizes([])
    setWheelWinner(null)
    setWheelRotation(0)
  }

  // 重置抽奖
  const resetDraw = () => {
    if (drawingIntervalRef.current) {
      clearInterval(drawingIntervalRef.current)
      drawingIntervalRef.current = null
    }
    if (displayIntervalRef.current) {
      clearInterval(displayIntervalRef.current)
      displayIntervalRef.current = null
    }
    setIsDrawing(false)
    setWinners([])
    setCurrentDisplayIndex(-1)
    setRollingNames([])
  }

  // 渲染转盘
  const renderWheel = () => {
    if (prizes.length === 0) {
      return (
        <div className="w-96 h-96 mx-auto flex items-center justify-center border-4 border-gray-300 rounded-full bg-gray-100">
          <span className="text-gray-500">请先添加奖品</span>
        </div>
      )
    }

    const totalWeight = prizes.reduce((sum, prize) => sum + prize.weight, 0)
    const centerX = 200
    const centerY = 200
    const radius = 180

    return (
      <div className="relative w-96 h-96 mx-auto">
        {/* 转盘 */}
        <div 
          className="w-full h-full rounded-full border-4 border-gray-800 transition-transform duration-3000 ease-out relative"
          style={{ 
            transform: `rotate(${wheelRotation}deg)`,
            transitionDuration: isWheelSpinning ? '3000ms' : '0ms'
          }}
        >
          <svg viewBox="0 0 400 400" className="w-full h-full">
            {prizes.map((prize, index) => {
              // 计算当前奖品的角度
              let accumulatedAngle = 0
              for (let i = 0; i < index; i++) {
                accumulatedAngle += (prizes[i].weight / totalWeight) * 360
              }
              
              const prizeAngle = (prize.weight / totalWeight) * 360
              const startAngle = accumulatedAngle - 90 // 从顶部开始
              const endAngle = accumulatedAngle + prizeAngle - 90
              
              const startAngleRad = (startAngle * Math.PI) / 180
              const endAngleRad = (endAngle * Math.PI) / 180
              
              const x1 = centerX + radius * Math.cos(startAngleRad)
              const y1 = centerY + radius * Math.sin(startAngleRad)
              const x2 = centerX + radius * Math.cos(endAngleRad)
              const y2 = centerY + radius * Math.sin(endAngleRad)
              
              const largeArcFlag = prizeAngle > 180 ? 1 : 0
              
              const pathData = [
                `M ${centerX} ${centerY}`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ')

              // 文字位置 - 指向圆心
              const textAngle = startAngle + prizeAngle / 2
              const textAngleRad = (textAngle * Math.PI) / 180
              const textRadius = radius * 0.65
              const textX = centerX + textRadius * Math.cos(textAngleRad)
              const textY = centerY + textRadius * Math.sin(textAngleRad)

              return (
                <g key={prize.id}>
                  <path
                    d={pathData}
                    fill={prize.color}
                    stroke="#fff"
                    strokeWidth="2"
                  />
                  <text
                    x={textX}
                    y={textY}
                    fill="white"
                    fontSize="14"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${textAngle + 90}, ${textX}, ${textY})`}
                  >
                    {prize.name}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>
        
        {/* 指针 - 从圆心向上 */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="relative">
            <div 
              className="w-1 bg-red-600 absolute left-1/2 transform -translate-x-1/2"
              style={{ height: '90px', top: '-90px' }}
            ></div>
            <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-red-600 absolute left-1/2 transform -translate-x-1/2" style={{ top: '-90px' }}></div>
            <div className="w-4 h-4 bg-red-600 rounded-full absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  // 清理定时器
  useEffect(() => {
    return () => {
      if (drawingIntervalRef.current) {
        clearInterval(drawingIntervalRef.current)
      }
      if (displayIntervalRef.current) {
        clearInterval(displayIntervalRef.current)
      }
      if (wheelSpinRef.current) {
        clearTimeout(wheelSpinRef.current)
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* 顶部导航 */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>返回首页</span>
            </Link>
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-purple-600" />
              <h1 className="text-xl font-semibold">抽奖程序</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* 模式选择 */}
        <Card className="bg-white/80 backdrop-blur-sm mb-6">
          <CardHeader>
            <CardTitle>选择抽奖模式</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={mode} onValueChange={(value: LotteryMode) => setMode(value)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="participants">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>参与者抽奖</span>
                  </div>
                </SelectItem>
                <SelectItem value="wheel">
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4" />
                    <span>转盘抽奖</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {mode === 'participants' ? (
          // 参与者抽奖模式
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左侧：参与者管理 */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    参与者管理
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="manual" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="manual">手动添加</TabsTrigger>
                      <TabsTrigger value="batch">批量添加</TabsTrigger>
                      <TabsTrigger value="import">导入文件</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="manual" className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="输入参与者姓名"
                          value={newParticipant}
                          onChange={(e) => setNewParticipant(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addParticipant()}
                        />
                        <Button onClick={addParticipant}>
                          <Plus className="w-4 h-4 mr-2" />
                          添加
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="batch" className="space-y-4">
                      <div className="space-y-2">
                        <Label>批量添加（每行一个姓名）</Label>
                        <Textarea
                          placeholder="张三&#10;李四&#10;王五"
                          rows={6}
                          id="batchInput"
                        />
                        <Button 
                          onClick={() => {
                            const textarea = document.getElementById('batchInput') as HTMLTextAreaElement
                            handleBatchAdd(textarea.value)
                            textarea.value = ''
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          批量添加
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="import" className="space-y-4">
                      <div className="space-y-2">
                        <Label>导入txt文件（每行一个姓名）</Label>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            选择文件
                          </Button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".txt"
                            onChange={handleFileImport}
                            className="hidden"
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* 参与者列表 */}
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      参与者列表 ({participants.length}人)
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={clearAll}>
                      清空全部
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {participants.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      暂无参与者，请先添加参与者
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2 mb-4">
                        {currentParticipants.map((participant) => (
                          <div
                            key={participant.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <span className="font-medium">{participant.name}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeParticipant(participant.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      {/* 分页 */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-500">
                            第 {currentPage} 页，共 {totalPages} 页
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={currentPage === 1}
                              onClick={() => setCurrentPage(prev => prev - 1)}
                            >
                              上一页
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={currentPage === totalPages}
                              onClick={() => setCurrentPage(prev => prev + 1)}
                            >
                              下一页
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 右侧：抽奖区域 */}
            <div className="space-y-6">
              {/* 抽奖设置 */}
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>抽奖设置</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>中奖人数</Label>
                    <Input
                      type="number"
                      min="1"
                      max={participants.length}
                      value={winnerCount}
                      onChange={(e) => setWinnerCount(Math.max(1, parseInt(e.target.value) || 1))}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    {!isDrawing ? (
                      <Button 
                        onClick={startDraw} 
                        disabled={participants.length === 0}
                        className="flex-1"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        开始抽奖
                      </Button>
                    ) : (
                      <Button onClick={stopDraw} variant="destructive" className="flex-1">
                        <Square className="w-4 h-4 mr-2" />
                        停止抽奖
                      </Button>
                    )}
                    <Button variant="outline" onClick={resetDraw}>
                      重置
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* 抽奖结果显示 */}
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>抽奖结果</CardTitle>
                </CardHeader>
                <CardContent>
                  {isDrawing ? (
                    <div className="space-y-4">
                      <div className="text-center text-lg font-semibold text-blue-600 mb-4">
                        抽奖进行中...
                      </div>
                      <div className="space-y-2">
                        {rollingNames.map((name, index) => (
                          <div
                            key={index}
                            className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-center font-bold text-lg animate-pulse"
                          >
                            {name}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : winners.length > 0 ? (
                    <div className="space-y-4">
                      <div className="text-center text-lg font-semibold text-green-600 mb-4">
                        🎉 恭喜中奖者 🎉
                      </div>
                      <div className="space-y-2">
                        {winners.map((winner, index) => (
                          <div
                            key={winner.id}
                            className={`p-4 rounded-lg text-center font-bold text-lg transition-all duration-500 ${
                              index <= currentDisplayIndex
                                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white transform scale-105'
                                : 'bg-gray-200 text-gray-400'
                            }`}
                          >
                            <div className="flex items-center justify-center gap-2">
                              <Badge variant="secondary">第{index + 1}名</Badge>
                              <span>{winner.name}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      点击"开始抽奖"开始抽奖
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          // 转盘抽奖模式
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 左侧：奖品管理 */}
            <div className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="w-5 h-5" />
                    奖品管理
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label>奖品名称</Label>
                      <Input
                        placeholder="输入奖品名称"
                        value={newPrizeName}
                        onChange={(e) => setNewPrizeName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>权重</Label>
                      <Input
                        type="number"
                        min="1"
                        value={newPrizeWeight}
                        onChange={(e) => setNewPrizeWeight(Math.max(1, parseInt(e.target.value) || 1))}
                      />
                    </div>
                  </div>
                  <Button onClick={addPrize} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    添加奖品
                  </Button>
                </CardContent>
              </Card>

              {/* 奖品列表 */}
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>奖品列表 ({prizes.length}个)</CardTitle>
                    <Button variant="outline" size="sm" onClick={clearAllPrizes}>
                      清空全部
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {prizes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      暂无奖品，请先添加奖品
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {prizes.map((prize) => (
                        <div
                          key={prize.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: prize.color }}
                            />
                            <span className="font-medium">{prize.name}</span>
                            <Badge variant="outline">权重: {prize.weight}</Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removePrize(prize.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 右侧：转盘区域 */}
            <div className="space-y-6">
              {/* 转盘控制 */}
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>转盘抽奖</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Button 
                      onClick={startWheelSpin} 
                      disabled={prizes.length === 0 || isWheelSpinning}
                      className="flex-1"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {isWheelSpinning ? '转盘转动中...' : '开始抽奖'}
                    </Button>
                    <Button variant="outline" onClick={resetWheel}>
                      重置
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* 转盘显示 */}
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>转盘</CardTitle>
                </CardHeader>
                <CardContent className="overflow-auto">
                  <div className="flex flex-col items-center space-y-4">
                    {renderWheel()}
                    
                    {wheelWinner && (
                      <div className="text-center p-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg">
                        <div className="text-lg font-bold">🎉 恭喜中奖！🎉</div>
                        <div className="text-xl font-bold mt-2">{wheelWinner.name}</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
