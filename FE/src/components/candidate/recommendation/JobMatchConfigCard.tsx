import React, { RefObject } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { FileText, Star, Loader2 } from 'lucide-react'

interface JobMatchConfigCardProps {
  cvMode: 'existing' | 'new'
  setCvMode: (mode: 'existing' | 'new') => void
  loadingCvs: boolean
  cvs: any[]
  selectedCvId: string
  setSelectedCvId: (id: string) => void
  cvTitle: string
  setCvTitle: (title: string) => void
  selectedFile: File | null
  fileInputRef: RefObject<HTMLInputElement | null>
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleStartProcess: () => void
  isStarting: boolean
  isProcessActive: boolean
}

export function JobMatchConfigCard({
  cvMode,
  setCvMode,
  loadingCvs,
  cvs,
  selectedCvId,
  setSelectedCvId,
  cvTitle,
  setCvTitle,
  selectedFile,
  fileInputRef,
  handleFileChange,
  handleStartProcess,
  isStarting,
  isProcessActive
}: JobMatchConfigCardProps) {
  return (
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
  )
}
