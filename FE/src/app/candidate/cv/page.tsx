'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { getAllCvs, uploadCv, setPrimaryCv, deleteCv } from '@/src/services/cv.service'
import { getSavedJobs } from '@/src/services/job.service'
import { calculateMatchScore } from '@/src/services/recommendation.service'
import { CvSummaryResponse } from '@/src/types/cv.type'
import { SavedJobResponse } from '@/src/types/job.type'
import { SkillMatchScoreResponse } from '@/src/types/recommendation.type'

export default function CandidateCvPage() {
  const [cvs, setCvs] = useState<CvSummaryResponse[]>([])
  const [savedJobs, setSavedJobs] = useState<SavedJobResponse[]>([])
  const [loading, setLoading] = useState(true)

  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [cvTitle, setCvTitle] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Matching state
  const [selectedCvId, setSelectedCvId] = useState<string>('')
  const [selectedJobId, setSelectedJobId] = useState<string>('')
  const [matchScore, setMatchScore] = useState<SkillMatchScoreResponse | null>(null)
  const [isMatching, setIsMatching] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      try {
        const cvData = await getAllCvs()
        setCvs(cvData)
      } catch (err) {
        console.error('Failed to fetch CVs:', err)
      }
      try {
        const jobData = await getSavedJobs()
        setSavedJobs(jobData)
      } catch (err) {
        console.error('Failed to fetch saved jobs:', err)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
      if (!cvTitle) {
        setCvTitle(e.target.files[0].name.replace('.pdf', ''))
      }
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !cvTitle) return
    try {
      setIsUploading(true)
      await uploadCv(selectedFile, cvTitle)
      setSelectedFile(null)
      setCvTitle('')
      if (fileInputRef.current) fileInputRef.current.value = ''
      await fetchData()
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleSetPrimary = async (id: string) => {
    try {
      await setPrimaryCv(id)
      await fetchData()
    } catch (error) {
      console.error('Failed to set primary CV:', error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      if (confirm('Bạn có chắc chắn muốn xóa CV này không?')) {
        await deleteCv(id)
        await fetchData()
      }
    } catch (error: any) {
      console.error('Failed to delete CV:', error)
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi xóa CV!';
      alert(errorMessage);
    }
  }

  const handleMatch = async () => {
    if (!selectedCvId || !selectedJobId) return
    try {
      setIsMatching(true)
      const score = await calculateMatchScore(selectedCvId, selectedJobId)
      setMatchScore(score)
    } catch (error) {
      console.error('Failed to calculate match score:', error)
    } finally {
      setIsMatching(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-medium">Đang tải dữ liệu...</div>
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight text-blue-900">Quản lý Hồ sơ & Phân tích AI</h1>
        <p className="text-slate-500 font-medium">Tải lên CV của bạn, chọn CV làm mặc định và chấm điểm mức độ phù hợp với các công việc đã lưu bằng công nghệ AI.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          {/* UPLOAD SECTION WITH SCANNING ANIMATION */}
          <Card className="border-blue-100 shadow-sm overflow-hidden bg-white relative">
            <CardHeader className="bg-blue-50/50 border-b border-blue-50">
              <CardTitle className="text-blue-800">Tải lên CV mới</CardTitle>
              <CardDescription>Chọn tệp PDF và hệ thống AI sẽ tự động phân tích kỹ năng.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 relative">
              {isUploading && (
                <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded-b-xl opacity-70">
                  <div className="absolute left-0 top-0 w-full h-[3px] bg-blue-500 shadow-[0_0_15px_5px_rgba(59,130,246,0.5)] z-20 animate-[scan_2s_ease-in-out_infinite]" />
                  <div className="absolute inset-0 bg-blue-50/30 backdrop-blur-[1px]" />
                </div>
              )}
              
              <div className="space-y-5 relative z-0">
                <div className="space-y-2">
                  <Label htmlFor="cv-title" className="font-bold text-slate-700">Tên Hồ Sơ</Label>
                  <Input 
                    id="cv-title" 
                    placeholder="Ví dụ: CV Frontend Developer 2026" 
                    value={cvTitle}
                    onChange={(e) => setCvTitle(e.target.value)}
                    className="border-slate-200 focus-visible:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cv-file" className="font-bold text-slate-700">Tệp PDF</Label>
                  <div className="flex items-center gap-4">
                    <Input 
                      id="cv-file" 
                      type="file" 
                      accept=".pdf"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="cursor-pointer file:cursor-pointer file:bg-blue-50 file:text-blue-700 file:font-bold file:border-0 file:mr-4 file:px-4 file:py-1 file:rounded-full hover:file:bg-blue-100 transition-all border-slate-200"
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleUpload} 
                  disabled={!selectedFile || !cvTitle || isUploading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 text-base transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  {isUploading ? 'ĐANG PHÂN TÍCH...' : 'TẢI LÊN & PHÂN TÍCH'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* AI MATCHING SECTION */}
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-slate-800">Chấm điểm Phù hợp (AI Matching)</CardTitle>
              <CardDescription>Kiểm tra xem CV của bạn có đáp ứng đủ yêu cầu của công việc không.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">Chọn Hồ Sơ</Label>
                  <select 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    value={selectedCvId}
                    onChange={(e) => setSelectedCvId(e.target.value)}
                  >
                    <option value="">-- Chọn CV --</option>
                    {cvs.map(cv => (
                      <option key={cv.id} value={cv.id}>{cv.title}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">Chọn Công Việc Đã Lưu</Label>
                  <select 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                  >
                    <option value="">-- Chọn Job --</option>
                    {savedJobs.map(sj => (
                      <option key={sj.job.id} value={sj.job.id}>{sj.job.title} - {sj.job.companyName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <Button 
                onClick={handleMatch}
                disabled={!selectedCvId || !selectedJobId || isMatching}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-6 text-base transition-all"
              >
                {isMatching ? 'ĐANG TÍNH TOÁN...' : 'CHẤM ĐIỂM NGAY'}
              </Button>

              {/* Match Result */}
              {matchScore && !isMatching && (
                <div className="mt-6 p-5 rounded-xl border border-blue-100 bg-blue-50/30 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex flex-col items-center mb-6">
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Độ phù hợp</span>
                    <div className="relative flex items-center justify-center">
                      <svg className="w-32 h-32 transform -rotate-90">
                        <circle cx="64" cy="64" r="56" className="stroke-slate-200" strokeWidth="12" fill="none" />
                        <circle 
                          cx="64" cy="64" r="56" 
                          className="stroke-blue-600 transition-all duration-1000 ease-out" 
                          strokeWidth="12" fill="none" 
                          strokeDasharray="351.86" 
                          strokeDashoffset={351.86 - (351.86 * matchScore.matchScore) / 100} 
                        />
                      </svg>
                      <span className="absolute text-3xl font-black text-blue-700">{matchScore.matchScore}%</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-bold text-emerald-700 mb-1 flex items-center gap-2">Kỹ năng trùng khớp</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {matchScore.matchingSkills.length > 0 ? matchScore.matchingSkills.map(skill => (
                          <span key={skill} className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-md">{skill}</span>
                        )) : <span className="text-sm text-slate-500">Không có kỹ năng nào khớp.</span>}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-rose-700 mb-1 flex items-center gap-2">Kỹ năng thiếu sót</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {matchScore.missingSkills.length > 0 ? matchScore.missingSkills.map(skill => (
                          <span key={skill} className="px-2.5 py-1 bg-rose-100 text-rose-800 text-xs font-semibold rounded-md">{skill}</span>
                        )) : <span className="text-sm text-slate-500">Tuyệt vời, bạn đáp ứng mọi kỹ năng!</span>}
                      </div>
                    </div>
                    {matchScore.recommendations.length > 0 && (
                      <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
                        <h4 className="font-bold text-amber-800 mb-1">Gợi ý từ AI</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {matchScore.recommendations.map((rec, idx) => (
                            <li key={idx} className="text-sm text-amber-900 leading-snug">{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* CV LIST SECTION */}
        <Card className="border-slate-200 shadow-sm bg-white h-fit">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <CardTitle className="text-slate-800">Danh sách Hồ sơ</CardTitle>
            <CardDescription>Quản lý các CV đã tải lên của bạn.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {cvs.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                Bạn chưa tải lên hồ sơ nào.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {cvs.map(cv => (
                  <div key={cv.id} className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-800 text-lg">{cv.title}</h3>
                        {cv.isPrimary && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wider">Mặc định</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">Tải lên: {new Date(cv.createdAt).toLocaleDateString('vi-VN')} lúc {new Date(cv.createdAt).toLocaleTimeString('vi-VN')}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                      {!cv.isPrimary && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleSetPrimary(cv.id)}
                          className="text-blue-600 border-blue-200 hover:bg-blue-50 flex-1 sm:flex-none"
                        >
                          ĐẶT MẶC ĐỊNH
                        </Button>
                      )}
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDelete(cv.id)}
                        disabled={cv.isPrimary}
                        className="bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 hover:text-rose-700 flex-1 sm:flex-none shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        XÓA
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}} />
    </div>
  )
}
