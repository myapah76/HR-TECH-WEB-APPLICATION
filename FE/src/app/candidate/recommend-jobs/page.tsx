'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { useGetAllCvs, useUploadCv } from '@/src/hooks/cv/cv.hooks'
import { useStartJobMatching, useGetJobMatchingStatus } from '@/src/hooks/recommendation/recommendation.hooks'
import { JobMatchingTaskResponse } from '@/src/types/recommendation'
import {
  Star,
  UploadCloud,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Map,
  Layers,
  FileSearch,
} from 'lucide-react'
import { Progress } from '@/src/components/ui/progress'
import Link from 'next/link'

export default function RecommendJobsPage() {
  const { data: cvs = [], isLoading: loadingCvs } = useGetAllCvs()
  const uploadCvMutation = useUploadCv()
  const startJobMatchingMutation = useStartJobMatching()

  // Input states
  const [cvMode, setCvMode] = useState<'existing' | 'new'>('existing')
  const [selectedCvId, setSelectedCvId] = useState<string>('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [cvTitle, setCvTitle] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Process states
  const [isStarting, setIsStarting] = useState(false)
  const [taskId, setTaskId] = useState<string | null>(null)
  const [taskStatus, setTaskStatus] = useState<JobMatchingTaskResponse | null>(null)

  useEffect(() => {
    if (cvs.length > 0 && !selectedCvId) {
      setSelectedCvId(cvs.find((c) => c.isPrimary)?.id || cvs[0].id)
    } else if (cvs.length === 0 && !loadingCvs) {
      setCvMode('new')
    }
  }, [cvs, loadingCvs, selectedCvId])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
      if (!cvTitle) {
        setCvTitle(e.target.files[0].name.replace('.pdf', ''))
      }
    }
  }

  const { data: polledStatus } = useGetJobMatchingStatus(taskId, !!taskId)

  useEffect(() => {
    if (polledStatus) {
      setTaskStatus(polledStatus)
    }
  }, [polledStatus])

  const handleStartProcess = () => {
    let targetCvId = selectedCvId

    if (cvMode === 'new') {
      if (!selectedFile || !cvTitle) {
        alert('Vui lòng chọn file và nhập tên CV')
        return
      }
      setIsStarting(true)
      uploadCvMutation.mutate(
        { file: selectedFile, title: cvTitle },
        {
          onSuccess: (newCv) => {
            triggerJobMatching(newCv.id)
            setSelectedFile(null)
            setCvTitle('')
            if (fileInputRef.current) fileInputRef.current.value = ''
          },
          onError: () => {
            setIsStarting(false)
          },
        }
      )
    } else {
      if (!targetCvId) {
        alert('Không tìm thấy ID CV hợp lệ')
        return
      }
      triggerJobMatching(targetCvId)
    }
  }

  const triggerJobMatching = (id: string) => {
    setIsStarting(true)
    startJobMatchingMutation.mutate(id, {
      onSuccess: ({ taskId: newTaskId }) => {
        setTaskId(newTaskId)
        setTaskStatus({
          taskId: newTaskId,
          status: 'PENDING',
          message: 'Đang khởi tạo tiến trình AI...',
          progressPercentage: 5,
          recommendedJobs: null,
        })
      },
      onSettled: () => {
        setIsStarting(false)
      },
    })
  }

  const getStatusIcon = (status: string | undefined) => {
    switch (status) {
      case 'PENDING':
        return <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      case 'EXTRACTING':
        return <FileSearch className="w-8 h-8 text-amber-500 animate-pulse" />
      case 'MAPPING':
        return <Map className="w-8 h-8 text-blue-500 animate-pulse" />
      case 'SCORING':
        return <Layers className="w-8 h-8 text-indigo-500 animate-pulse" />
      case 'DONE':
        return <CheckCircle2 className="w-8 h-8 text-emerald-500" />
      case 'FAILED':
        return <AlertCircle className="w-8 h-8 text-rose-500" />
      default:
        return <Loader2 className="w-8 h-8 text-slate-400" />
    }
  }

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'PENDING':
        return 'bg-slate-500'
      case 'EXTRACTING':
        return 'bg-amber-500'
      case 'MAPPING':
        return 'bg-blue-500'
      case 'SCORING':
        return 'bg-indigo-500'
      case 'DONE':
        return 'bg-emerald-500'
      case 'FAILED':
        return 'bg-rose-500'
      default:
        return 'bg-blue-600'
    }
  }

  const isProcessActive = taskId && taskStatus && taskStatus.status !== 'DONE'
  const isDone = taskStatus?.status === 'DONE'

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <Star className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            AI Cố vấn: Gợi ý Việc làm
          </h1>
        </div>
        <p className="text-slate-500 font-medium">
          Sử dụng công nghệ Graph & LLM để tìm kiếm và đề xuất những công việc phù hợp nhất với kỹ
          năng trong CV của bạn.
        </p>
      </div>

      {isDone && taskStatus?.recommendedJobs ? (
        /* RESULT UI */
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              Đã tìm thấy {taskStatus.recommendedJobs.length} công việc phù hợp
            </h2>
            <Button
              variant="outline"
              onClick={() => {
                setTaskId(null)
                setTaskStatus(null)
              }}
              className="font-bold border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              Tìm kiếm lại
            </Button>
          </div>

          {taskStatus.recommendedJobs.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-sm">
              <p className="text-slate-500 font-medium text-lg">
                Rất tiếc, chưa tìm thấy công việc nào phù hợp với kỹ năng của bạn lúc này.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {taskStatus.recommendedJobs.map((rec, idx) => (
                <Card
                  key={idx}
                  className="border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all bg-white overflow-hidden group"
                >
                  <CardHeader className="bg-slate-50 border-b border-slate-100 group-hover:bg-blue-50/50 transition-colors">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <Link href={`/jobs/${rec.jobId}`} className="hover:underline">
                          <CardTitle className="text-lg text-blue-900 leading-tight">
                            {rec.jobTitle}
                          </CardTitle>
                        </Link>
                        <CardDescription className="mt-1 font-medium text-slate-600">
                          {rec.companyName}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-black flex items-center gap-1 shadow-sm">
                          {(rec.matchScore * 100).toFixed(0)}%{' '}
                          <span className="text-xs font-semibold">Phù hợp</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 space-y-4">
                    <div className="flex flex-col gap-2 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Map className="w-4 h-4 text-slate-400" /> {rec.location}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Kỹ năng đáp ứng
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {rec.matchedSkills?.length > 0 ? (
                          rec.matchedSkills.slice(0, 5).map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded border border-blue-100"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400">Không có dữ liệu</span>
                        )}
                        {rec.matchedSkills?.length > 5 && (
                          <span className="px-2 py-0.5 bg-slate-50 text-slate-500 text-xs font-semibold rounded border border-slate-100">
                            +{rec.matchedSkills.length - 5}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* UPLOAD & MOCKUP UI */
        <div
          className={`grid grid-cols-1 ${isProcessActive ? 'lg:grid-cols-2' : ''} gap-8 items-start transition-all duration-700`}
        >
          {/* Left: Form */}
          <Card
            className={`border-blue-100 shadow-lg bg-white overflow-hidden relative z-10 transition-all duration-500 ${!isProcessActive ? 'max-w-2xl mx-auto w-full' : ''}`}
          >
            <CardHeader className="bg-blue-50/50 border-b border-blue-50">
              <CardTitle className="text-blue-900 flex items-center gap-2">
                <FileText className="w-5 h-5" /> Cấu hình Tìm kiếm
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex bg-slate-100 p-1 rounded-lg mb-6 w-full">
                <button
                  className={`flex-1 py-3 text-sm font-bold rounded-md transition-all ${cvMode === 'existing' ? 'bg-white shadow text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
                  onClick={() => setCvMode('existing')}
                >
                  Dùng CV Có Sẵn
                </button>
                <button
                  className={`flex-1 py-3 text-sm font-bold rounded-md transition-all ${cvMode === 'new' ? 'bg-white shadow text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
                  onClick={() => setCvMode('new')}
                >
                  Tải lên CV Mới
                </button>
              </div>

              {cvMode === 'existing' ? (
                <div className="space-y-4">
                  <Label className="font-bold text-slate-700">Chọn Hồ Sơ</Label>
                  {loadingCvs ? (
                    <div className="text-sm text-slate-500">Đang tải...</div>
                  ) : cvs.length > 0 ? (
                    <select
                      className="flex h-12 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
                      value={selectedCvId}
                      onChange={(e) => setSelectedCvId(e.target.value)}
                    >
                      <option value="">-- Chọn CV để phân tích --</option>
                      {cvs.map((cv) => (
                        <option key={cv.id} value={cv.id}>
                          {cv.title} {cv.isPrimary ? '(Mặc định)' : ''}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-sm text-amber-600 bg-amber-50 p-4 rounded-md border border-amber-200 font-medium">
                      {'Bạn chưa có CV nào. Vui lòng chuyển sang tab "Tải lên CV Mới".'}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="cv-title" className="font-bold text-slate-700">
                      Tên Hồ Sơ
                    </Label>
                    <Input
                      id="cv-title"
                      placeholder="Ví dụ: CV Frontend Developer 2026"
                      value={cvTitle}
                      onChange={(e) => setCvTitle(e.target.value)}
                      className="h-12 border-slate-200 focus-visible:ring-blue-500 shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cv-file" className="font-bold text-slate-700">
                      Tệp PDF
                    </Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="cv-file"
                        type="file"
                        accept=".pdf"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="h-12 cursor-pointer file:cursor-pointer file:bg-blue-50 file:text-blue-700 file:font-bold file:border-0 file:mr-4 file:px-4 file:py-1.5 file:rounded-full hover:file:bg-blue-100 transition-all border-slate-200 shadow-sm pt-2.5"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-slate-100">
                <Button
                  onClick={handleStartProcess}
                  disabled={
                    isStarting ||
                    isProcessActive ||
                    (cvMode === 'existing' && !selectedCvId) ||
                    (cvMode === 'new' && (!selectedFile || !cvTitle))
                  }
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 px-8 text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isStarting || isProcessActive ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Star className="w-6 h-6" />
                  )}
                  {isStarting || isProcessActive ? 'ĐANG PHÂN TÍCH...' : 'BẮT ĐẦU TÌM KIẾM BẰNG AI'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Right: Visual Mockup */}
          {isProcessActive && (
            <div className="relative flex flex-col items-center justify-center p-8 bg-slate-100/50 rounded-2xl border border-slate-200 shadow-inner min-h-[500px] overflow-hidden animate-in fade-in slide-in-from-right-8 duration-500">
              {/* The CV Mockup Image */}
              <div className="relative w-full max-w-sm aspect-[1/1.4] rounded-lg shadow-2xl overflow-hidden border border-slate-300 bg-white">
                <img
                  src="/cv_mockup.png"
                  alt="CV Mockup"
                  className="w-full h-full object-cover opacity-90"
                />

                {/* Scanner overlay */}
                {isProcessActive && (
                  <>
                    <div className="absolute left-0 w-full h-[3px] bg-blue-500 shadow-[0_0_25px_8px_rgba(59,130,246,0.8)] z-20 animate-scanner" />
                    <div className="absolute inset-0 bg-blue-500/10 mix-blend-overlay animate-pulse z-10" />
                  </>
                )}
              </div>

              {/* Polling Progress Overlay */}
              {isProcessActive && taskStatus && (
                <div className="absolute bottom-12 w-[85%] max-w-sm bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-blue-100 animate-in slide-in-from-bottom-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-50 rounded-full">
                      {getStatusIcon(taskStatus.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-sm text-slate-800">
                          {taskStatus.message}
                        </span>
                        <span className="font-black text-blue-700">
                          {taskStatus.progressPercentage}%
                        </span>
                      </div>
                      <Progress
                        value={taskStatus.progressPercentage}
                        className="h-2 bg-blue-100"
                        indicatorColor={getStatusColor(taskStatus.status)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-1 w-full opacity-80">
                    <div
                      className={`text-[10px] font-bold text-center p-1.5 rounded ${taskStatus.progressPercentage >= 20 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-400'}`}
                    >
                      Bóc tách
                    </div>
                    <div
                      className={`text-[10px] font-bold text-center p-1.5 rounded ${taskStatus.progressPercentage >= 50 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'}`}
                    >
                      Ánh xạ
                    </div>
                    <div
                      className={`text-[10px] font-bold text-center p-1.5 rounded ${taskStatus.progressPercentage >= 80 ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-400'}`}
                    >
                      Graph
                    </div>
                    <div
                      className={`text-[10px] font-bold text-center p-1.5 rounded ${taskStatus.progressPercentage === 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}
                    >
                      Xong
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes scanner {
          0% { top: 0%; }
          100% { top: 100%; }
        }
        .animate-scanner {
          animation: scanner 2s ease-in-out infinite alternate;
        }
      `,
        }}
      />
    </div>
  )
}

