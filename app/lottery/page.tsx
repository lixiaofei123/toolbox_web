'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Upload, Plus, Trash2, Play, Square, Users, FileText, Settings, Gift, RotateCcw, Database } from 'lucide-react'
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

type LotteryMode = 'participants' | 'wheel' | 'numbers'

export default function LotteryPage() {
  const [mode, setMode] = useState<LotteryMode>('participants')
  
  // 参与者模式状态
  const [participants, setParticipants] = useState<Participant[]>([])
  const [newParticipant, setNewParticipant] = useState('')
  const [winnerCount, setWinnerCount] = useState(1)
  const [isDrawing, setIsDrawing] = useState(false)
  const [isStopping, setIsStopping] = useState(false) // 新增：是否正在停止状态
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
  const [wheelPower, setWheelPower] = useState(0) // 力度 (0-100)
  const [isPowerCharging, setIsPowerCharging] = useState(false) // 是否正在蓄力
  
  // 数字抽奖模式状态
  const [minNumber, setMinNumber] = useState(1)
  const [maxNumber, setMaxNumber] = useState(100)
  const [numberCount, setNumberCount] = useState(1)
  const [isNumberDrawing, setIsNumberDrawing] = useState(false)
  const [isNumberStopping, setIsNumberStopping] = useState(false) // 新增：是否正在停止状态
  const [numberWinners, setNumberWinners] = useState<number[]>([])
  const [currentNumberIndex, setCurrentNumberIndex] = useState(-1)
  const [rollingNumbers, setRollingNumbers] = useState<number[]>([])
  
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
  const powerChargingRef = useRef<NodeJS.Timeout | null>(null) // 新增：蓄力定时器引用
  const numberDrawingRef = useRef<NodeJS.Timeout | null>(null)
  const numberDisplayRef = useRef<NodeJS.Timeout | null>(null)

  // 预定义颜色
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
  ]

  // 生成随机测试数据
  const generateTestData = () => {
    // 生成随机参与者
    const testNames = [
      '张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十',
      '郑十一', '王十二', '冯十三', '陈十四', '褚十五', '卫十六', '蒋十七', '沈十八',
      '韩十九', '杨二十', '朱二十一', '秦二十二', '尤二十三', '许二十四', '何二十五', '吕二十六',
      '施二十七', '张二十八', '孔二十九', '曹三十', '严三十一', '华三十二', '金三十三', '魏三十四'
    ]
    
    const shuffledNames = [...testNames].sort(() => Math.random() - 0.5)
    const randomCount = Math.floor(Math.random() * 20) + 10 // 10-30个参与者
    
    const newParticipants = shuffledNames.slice(0, randomCount).map((name, index) => ({
      id: `test-${Date.now()}-${index}`,
      name
    }))
    
    setParticipants(newParticipants)
    
    // 生成随机奖品
    const testPrizes = [
      '一等奖', '二等奖', '三等奖', '四等奖', '五等奖',
      '特等奖', '幸运奖', '安慰奖', '纪念奖', '参与奖',
      '神秘大奖', '惊喜礼品', '精美奖品', '豪华礼包', '超级大奖'
    ]
    
    const shuffledPrizes = [...testPrizes].sort(() => Math.random() - 0.5)
    const prizeCount = Math.floor(Math.random() * 8) + 4 // 4-12个奖品
    
    const newPrizes = shuffledPrizes.slice(0, prizeCount).map((prize, index) => ({
      id: `prize-${Date.now()}-${index}`,
      name: prize,
      weight: Math.floor(Math.random() * 10) + 1, // 1-10的权重
      color: colors[index % colors.length]
    }))
    
    setPrizes(newPrizes)
  }

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
      setWinnerCount(participants.length)
      return
    }

    setIsDrawing(true)
    setWinners([])
    setCurrentDisplayIndex(-1)

    // 预先生成中奖者列表，确保不重复
    const shuffled = [...participants]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    const selectedWinners = shuffled.slice(0, winnerCount)
    
    // 保存中奖者到全局变量，供停止时使用
    ;(window as any).selectedWinners = selectedWinners

    // 滚动速度设置为100ms，确保不重复
    drawingIntervalRef.current = setInterval(() => {
      // 滚动时只显示未中奖的参与者，确保不会与最终结果重复
      const remainingParticipants = participants.filter(p => 
        !selectedWinners.some(winner => winner.id === p.id)
      )
      
      // 如果剩余参与者不够，则从所有参与者中随机选择
      const availableParticipants = remainingParticipants.length >= winnerCount 
        ? remainingParticipants 
        : participants
      
      // 随机打乱可用参与者
      const shuffled = [...availableParticipants]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      
      const randomNames = shuffled.slice(0, winnerCount).map(p => p.name)
      setRollingNames(randomNames)
    }, 100)
  }

  // 停止参与者抽奖
  const stopDraw = () => {
    if (drawingIntervalRef.current) {
      clearInterval(drawingIntervalRef.current)
      drawingIntervalRef.current = null
    }

    setIsDrawing(false)
    setIsStopping(true) // 设置停止状态

    // 获取预生成的中奖者
    const selectedWinners = (window as any).selectedWinners || []
    if (selectedWinners.length === 0) {
      setIsStopping(false)
      return
    }
    
    setWinners(selectedWinners)

    // 直接显示所有中奖者，不再滚动
    setRollingNames(selectedWinners.map(w => w.name))
    setCurrentDisplayIndex(selectedWinners.length - 1)
    
    // 1秒后完成停止
    setTimeout(() => {
      setIsStopping(false)
      // 清理全局变量
      delete (window as any).selectedWinners
    }, 1000)
  }



  // 开始蓄力
  const startPowerCharging = () => {
    if (prizes.length === 0 || isWheelSpinning || isPowerCharging) {
      return
    }
    
    setIsPowerCharging(true)
    setWheelPower(0) // 重置力度
    
    // 开始蓄力，力度逐渐增加
    const chargeInterval = setInterval(() => {
      setWheelPower(prev => {
        if (prev >= 100) {
          clearInterval(chargeInterval)
          return 100
        }
        return prev + 2 // 每50ms增加2点力度
      })
    }, 50)
    
    // 保存定时器引用到专门的蓄力定时器
    powerChargingRef.current = chargeInterval
  }

  // 停止蓄力并开始转盘
  const stopPowerCharging = () => {
    if (!isPowerCharging) {
      return
    }
    
    setIsPowerCharging(false)
    
    // 清除蓄力定时器
    if (powerChargingRef.current) {
      clearInterval(powerChargingRef.current)
      powerChargingRef.current = null
    }
    
    // 开始转盘旋转
    startWheelSpinWithPower()
  }

  // 根据力度开始转盘旋转
  const startWheelSpinWithPower = () => {
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
        targetAngle = accumulatedAngle + (prizeAngle / 2)
        break
      }
      accumulatedAngle += prizeAngle
    }

    // 根据力度计算转圈数 (5-10圈)
    const minSpins = 5
    const maxSpins = 10
    const spinCount = minSpins + Math.floor((wheelPower / 100) * (maxSpins - minSpins))
    const totalRotation = spinCount * 360

    // 计算最终旋转角度
    const finalRotation = wheelRotation + totalRotation - targetAngle

    setWheelRotation(finalRotation)

    // 根据力度调整停止时间 (4-6秒)
    const minDuration = 4000
    const maxDuration = 6000
    const stopDuration = minDuration + (wheelPower / 100) * (maxDuration - minDuration)

    // 停止并显示结果
    wheelSpinRef.current = setTimeout(() => {
      setIsWheelSpinning(false)
      setWheelWinner(selectedPrize)
      // 不重置力度，让用户看到最终的力度值
    }, stopDuration)
  }

  // 重置转盘
  const resetWheel = () => {
    if (wheelSpinRef.current) {
      clearTimeout(wheelSpinRef.current)
      wheelSpinRef.current = null
    }
    if (powerChargingRef.current) {
      clearInterval(powerChargingRef.current)
      powerChargingRef.current = null
    }
    setIsWheelSpinning(false)
    setIsPowerCharging(false)
    setWheelWinner(null)
    setWheelRotation(0)
    setWheelPower(0)
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
    setIsStopping(false) // 重置停止状态
    setWinners([])
    setCurrentDisplayIndex(-1)
    setRollingNames([])
  }

  // 开始数字抽奖
  const startNumberDraw = () => {
    if (minNumber >= maxNumber) {
      return
    }

    if (numberCount > (maxNumber - minNumber + 1)) {
      return
    }

    setIsNumberDrawing(true)
    setIsNumberStopping(false)
    setNumberWinners([])
    setCurrentNumberIndex(-1)
    setRollingNumbers([])

    // 生成不重复的随机数字
    const allNumbers = Array.from({ length: maxNumber - minNumber + 1 }, (_, i) => minNumber + i)
    const shuffled = [...allNumbers].sort(() => Math.random() - 0.5)
    const selectedNumbers = shuffled.slice(0, numberCount)

    // 开始持续滚动
    startContinuousRolling(selectedNumbers)
  }

  // 开始持续滚动
  const startContinuousRolling = (selectedNumbers: number[]) => {
    // 保存选中的数字到全局变量，供停止时使用
    ;(window as any).selectedNumbers = selectedNumbers
    
    // 初始化滚动数字数组
    setRollingNumbers(Array.from({ length: numberCount }, () => 
      Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber
    ))
    
    // 开始持续滚动
    numberDrawingRef.current = setInterval(() => {
      setRollingNumbers(prev => prev.map(() => 
        Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber
      ))
    }, 50)
  }

  // 开始逐个停止
  const startSequentialStop = (selectedNumbers: number[], currentIndex: number) => {
    // 停止当前数字的滚动，其他数字继续滚动
    setRollingNumbers(prev => prev.map((_, index) => 
      index === currentIndex ? selectedNumbers[currentIndex] : 
      Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber
    ))
    
    // 将当前数字添加到结果中
    setNumberWinners(prev => [...prev, selectedNumbers[currentIndex]])
    
    // 继续其他数字的滚动
    if (currentIndex < selectedNumbers.length - 1) {
      numberDrawingRef.current = setInterval(() => {
        setRollingNumbers(prev => prev.map((num, index) => 
          index <= currentIndex ? selectedNumbers[index] : 
          Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber
        ))
      }, 50)
    }
    
    // 1秒后开始下一个数字
    setTimeout(() => {
      const nextIndex = currentIndex + 1
      if (nextIndex < selectedNumbers.length) {
        // 清除当前的滚动定时器
        if (numberDrawingRef.current) {
          clearInterval(numberDrawingRef.current)
          numberDrawingRef.current = null
        }
        setCurrentNumberIndex(nextIndex)
        startSequentialStop(selectedNumbers, nextIndex)
      } else {
        // 所有数字都显示完毕，重新启用按钮
        if (numberDrawingRef.current) {
          clearInterval(numberDrawingRef.current)
          numberDrawingRef.current = null
        }
        setIsNumberDrawing(false)
        setIsNumberStopping(false)
      }
    }, 1000)
  }

  // 开始数字滚动
  const startNumberRolling = (targetNumber: number, currentIndex: number, allSelectedNumbers: number[]) => {
    // 快速滚动效果
    numberDrawingRef.current = setInterval(() => {
      setRollingNumbers(prev => prev.map(() => 
        Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber
      ))
    }, 50)

    // 3秒后停止并显示目标数字
    numberDisplayRef.current = setTimeout(() => {
      if (numberDrawingRef.current) {
        clearInterval(numberDrawingRef.current)
        numberDrawingRef.current = null
      }
      setRollingNumbers(prev => prev.map((_, index) => 
        index === currentIndex ? targetNumber : 
        Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber
      ))

      // 将当前数字添加到结果中
      setNumberWinners(prev => [...prev, targetNumber])

      // 1秒后开始下一个数字
      setTimeout(() => {
        const nextIndex = currentIndex + 1
        if (nextIndex < allSelectedNumbers.length) {
          setCurrentNumberIndex(nextIndex)
          startNumberRolling(allSelectedNumbers[nextIndex], nextIndex, allSelectedNumbers)
        } else {
          // 所有数字都显示完毕
          setIsNumberDrawing(false)
        }
      }, 1000)
    }, 3000)
  }

  // 停止数字抽奖
  const stopNumberDraw = () => {
    if (numberDrawingRef.current) {
      clearInterval(numberDrawingRef.current)
      numberDrawingRef.current = null
    }
    if (numberDisplayRef.current) {
      clearTimeout(numberDisplayRef.current)
      numberDisplayRef.current = null
    }
    
    // 设置停止状态，禁用按钮
    setIsNumberStopping(true)
    
    // 获取选中的数字
    const selectedNumbers = (window as any).selectedNumbers || []
    if (selectedNumbers.length === 0) {
      setIsNumberDrawing(false)
      setIsNumberStopping(false)
      return
    }
    
    // 开始逐个停止，按钮变为禁用状态
    setCurrentNumberIndex(0)
    startSequentialStop(selectedNumbers, 0)
  }

  // 重置数字抽奖
  const resetNumberDraw = () => {
    if (numberDrawingRef.current) {
      clearInterval(numberDrawingRef.current)
      numberDrawingRef.current = null
    }
    if (numberDisplayRef.current) {
      clearTimeout(numberDisplayRef.current)
      numberDisplayRef.current = null
    }
    setIsNumberDrawing(false)
    setIsNumberStopping(false)
    setNumberWinners([])
    setCurrentNumberIndex(-1)
    setRollingNumbers([])
    // 清理全局变量
    delete (window as any).selectedNumbers
  }

  // 计算对比度颜色
  const getContrastColor = (backgroundColor: string) => {
    // 将颜色转换为RGB
    const hex = backgroundColor.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    
    // 计算亮度
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    
    // 根据亮度返回黑色或白色
    return brightness > 128 ? '#000000' : '#FFFFFF'
  }

  // 渲染转盘
  const renderWheel = () => {
    if (prizes.length === 0) {
      return (
        <div className="w-[480px] h-[480px] max-w-full max-h-[70vh] mx-auto flex items-center justify-center border-4 border-gray-300 rounded-full bg-gray-100">
          <span className="text-gray-500">请先添加奖品</span>
        </div>
      )
    }

    const totalWeight = prizes.reduce((sum, prize) => sum + prize.weight, 0)
    const centerX = 240
    const centerY = 240
    const radius = 216

    return (
      <div className="relative w-[480px] h-[480px] max-w-full max-h-[70vh] mx-auto">
        {/* 转盘 */}
        <div 
          className="w-full h-full rounded-full border-4 border-gray-800 transition-transform ease-out relative"
          style={{ 
            transform: `rotate(${wheelRotation}deg)`,
            transitionDuration: isWheelSpinning 
              ? `${Math.max(4000, 4000 + (wheelPower / 100) * 2000)}ms` 
              : '0ms'
          }}
        >
          <svg viewBox="0 0 480 480" className="w-full h-full" style={{ pointerEvents: 'none' }}>
            {prizes.map((prize, index) => {
              // 计算当前奖品的角度
              let accumulatedAngle = 0
              for (let i = 0; i < index; i++) {
                accumulatedAngle += (prizes[i].weight / totalWeight) * 360
              }
              
              const prizeAngle = (prize.weight / totalWeight) * 360
              const startAngle = accumulatedAngle // 从0度开始
              const endAngle = accumulatedAngle + prizeAngle
              
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

              // 计算对比度颜色
              const textColor = getContrastColor(prize.color)

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
                    fill={textColor}
                    fontSize="14"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${textAngle + 90}, ${textX}, ${textY})`}
                  >
                    {prize.name.split('').map((char, charIndex) => (
                      <tspan
                        key={charIndex}
                        x={textX}
                        dy={charIndex === 0 ? 0 : "1.2em"}
                        textAnchor="middle"
                      >
                        {char}
                      </tspan>
                    ))}
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
              className="w-2 bg-red-600 absolute left-1/2 transform -translate-x-1/2"
              style={{ height: '108px', top: '-108px' }}
            ></div>
            <div className="w-0 h-0 border-l-6 border-r-6 border-b-12 border-l-transparent border-r-transparent border-b-red-600 absolute left-1/2 transform -translate-x-1/2" style={{ top: '-108px' }}></div>
            <div className="w-6 h-6 bg-red-600 rounded-full absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
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
      if (powerChargingRef.current) {
        clearInterval(powerChargingRef.current)
      }
      if (numberDrawingRef.current) {
        clearInterval(numberDrawingRef.current)
      }
      if (numberDisplayRef.current) {
        clearTimeout(numberDisplayRef.current)
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
            <div className="flex gap-4 items-center">
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
                  <SelectItem value="numbers">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>数字抽奖</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              
              <Button onClick={generateTestData} variant="outline">
                <Database className="w-4 h-4 mr-2" />
                生成测试数据
              </Button>
            </div>
          </CardContent>
        </Card>

        {mode === 'participants' ? (
          // 参与者抽奖模式
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左侧：参与者管理 */}
            <div className="lg:col-span-1 space-y-6">
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
                          placeholder="张三"
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
            <div className="lg:col-span-2 space-y-6">
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
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 1
                        const maxValue = Math.min(value, participants.length)
                        setWinnerCount(Math.max(1, maxValue))
                      }}
                    />
                    <div className="text-sm text-gray-500">
                      可选范围：1 - {participants.length}（总人数）
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {!isDrawing ? (
                      <Button 
                        onClick={startDraw} 
                        disabled={participants.length === 0 || isStopping}
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
                    <Button variant="outline" onClick={resetDraw} disabled={isStopping}>
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
                  {isDrawing || isStopping ? (
                    <div className="space-y-4">
                      <div className="text-center text-lg font-semibold text-blue-600 mb-4">
                        {isDrawing ? '抽奖进行中...' : '抽奖停止中...'}
                      </div>
                      <div className="space-y-2">
                        {rollingNames.map((name, index) => (
                          <div
                            key={index}
                            className={`p-4 rounded-lg text-center font-bold text-lg transition-all duration-500 ${
                              isStopping && index <= currentDisplayIndex
                                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white transform scale-105'
                                : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white animate-pulse'
                            }`}
                          >
                            <div className="flex items-center justify-center gap-2">
                              <Badge variant="secondary">第{index + 1}名</Badge>
                              <span>{name}</span>
                            </div>
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
                            className="p-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg text-center font-bold text-lg"
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
        ) : mode === 'wheel' ? (
          // 转盘抽奖模式
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左侧：奖品管理 */}
            <div className="lg:col-span-1 space-y-6">
              {/* 奖品管理 */}
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="w-5 h-5" />
                    奖品管理
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-2">
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
            <div className="lg:col-span-2">
              <Card className="bg-white/80 backdrop-blur-sm h-full">
                <CardHeader>
                  <CardTitle>转盘</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center space-y-6">
                    <div className="w-full flex justify-center">
                      {renderWheel()}
                    </div>
                    
                    {/* 转盘控制按钮 */}
                    <div className="flex flex-col gap-4 w-full max-w-md">
                      <div className="flex gap-4">
                        <Button 
                          onMouseDown={startPowerCharging}
                          onMouseUp={stopPowerCharging}
                          onMouseLeave={stopPowerCharging}
                          onTouchStart={startPowerCharging}
                          onTouchEnd={stopPowerCharging}
                          disabled={prizes.length === 0 || isWheelSpinning}
                          className="flex-1"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          {isWheelSpinning ? '转盘转动中...' : isPowerCharging ? '蓄力中...' : '按住开始抽奖'}
                        </Button>
                        <Button variant="outline" onClick={resetWheel}>
                          重置
                        </Button>
                      </div>
                      
                      {/* 力度进度条 */}
                      {(isPowerCharging || wheelPower > 0) && (
                        <div className="w-full space-y-2">
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>力度</span>
                            <span>{Math.round(wheelPower)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-100 ease-out rounded-full"
                              style={{ width: `${wheelPower}%` }}
                            />
                          </div>
                          <div className="text-xs text-gray-500 text-center">
                            {wheelPower < 30 ? '轻力' : wheelPower < 70 ? '中力' : '大力'}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          // 数字抽奖模式
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 左侧：数字设置 */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    数字设置
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>最小值</Label>
                      <Input
                        type="number"
                        value={minNumber}
                        onChange={(e) => setMinNumber(parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>最大值</Label>
                      <Input
                        type="number"
                        value={maxNumber}
                        onChange={(e) => setMaxNumber(parseInt(e.target.value) || 100)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>抽奖数量</Label>
                    <Input
                      type="number"
                      min="1"
                      max={maxNumber - minNumber + 1}
                      value={numberCount}
                      onChange={(e) => setNumberCount(Math.max(1, parseInt(e.target.value) || 1))}
                    />
                    <div className="text-sm text-gray-500">
                      可选范围：1 - {maxNumber - minNumber + 1}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 右侧：数字抽奖区域 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 抽奖控制 */}
              <Card className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>数字抽奖</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    {!isNumberDrawing ? (
                      <Button 
                        onClick={startNumberDraw} 
                        disabled={minNumber >= maxNumber || numberCount > (maxNumber - minNumber + 1)}
                        className="flex-1"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        开始抽奖
                      </Button>
                    ) : (
                      <Button onClick={stopNumberDraw} variant="destructive" className="flex-1" disabled={isNumberStopping}>
                        <Square className="w-4 h-4 mr-2" />
                        停止抽奖
                      </Button>
                    )}
                    <Button variant="outline" onClick={resetNumberDraw}>
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
                  {isNumberDrawing ? (
                    <div className="space-y-4">
                      <div className="text-center text-lg font-semibold text-blue-600 mb-4">
                        抽奖进行中...
                      </div>
                      <div className="space-y-2">
                        {Array.from({ length: numberCount }, (_, index) => (
                          <div
                            key={index}
                            className={`p-4 rounded-lg text-center font-bold text-lg transition-all duration-500 ${
                              index === currentNumberIndex
                                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white transform scale-105'
                                : index < currentNumberIndex
                                ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white'
                                : 'bg-gray-200 text-gray-400'
                            }`}
                          >
                            <div className="flex items-center justify-center gap-2">
                              <Badge variant="secondary">第{index + 1}个</Badge>
                              <span>
                                {index === currentNumberIndex 
                                  ? rollingNumbers[index] || '?'
                                  : index < currentNumberIndex 
                                    ? numberWinners[index] 
                                    : rollingNumbers[index] || '?'
                                }
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : numberWinners.length > 0 ? (
                    <div className="space-y-4">
                      <div className="text-center text-lg font-semibold text-green-600 mb-4">
                        🎉 抽奖完成 🎉
                      </div>
                      <div className="space-y-2">
                        {numberWinners.map((number, index) => (
                          <div
                            key={index}
                            className="p-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg text-center font-bold text-lg"
                          >
                            <div className="flex items-center justify-center gap-2">
                              <Badge variant="secondary">第{index + 1}个</Badge>
                              <span>{number}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      点击"开始抽奖"开始数字抽奖
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
