import React, { RefObject } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'

import { CvUploadCardProps } from '@/src/types/cv'

export function CvUploadCard({
  cvTitle,
  setCvTitle,
  selectedFile,
  fileInputRef,
  handleFileChange,
  handleUpload,
  isPending,
}: CvUploadCardProps) {
  return (
    <Card className="border-blue-100 shadow-sm overflow-hidden bg-white relative h-fit">
      <CardHeader className="bg-blue-50/50 border-b border-blue-50">
        <CardTitle className="text-blue-800">Tải lên CV mới</CardTitle>
        <CardDescription>
          Chọn tệp PDF và hệ thống AI sẽ tự động phân tích kỹ năng.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 relative">
        {isPending && (
          <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded-b-xl opacity-70">
            <div className="absolute left-0 top-0 w-full h-0.75 bg-blue-500 shadow-[0_0_15px_5px_rgba(59,130,246,0.5)] z-20 animate-[scan_2s_ease-in-out_infinite]" />
            <div className="absolute inset-0 bg-blue-50/30 backdrop-blur-[1px]" />
          </div>
        )}

        <div className="space-y-5 relative z-0">
          <div className="space-y-2">
            <Label htmlFor="cv-title" className="font-bold text-slate-700">
              Tên Hồ Sơ
            </Label>
            <Input
              id="cv-title"
              placeholder="Ví dụ: CV Frontend Developer 2026"
              value={cvTitle}
              onChange={(e) => setCvTitle(e.target.value)}
              className="border-slate-200 focus-visible:ring-blue-500"
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
                className="cursor-pointer file:cursor-pointer file:bg-blue-50 file:text-blue-700 file:font-bold file:border-0 file:mr-4 file:px-4 file:py-1 file:rounded-full hover:file:bg-blue-100 transition-all border-slate-200"
              />
            </div>
          </div>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || !cvTitle || isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 text-base transition-all shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {isPending ? 'ĐANG PHÂN TÍCH...' : 'TẢI LÊN & PHÂN TÍCH'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
