'use client'

import React from 'react'
import { Button } from '@/src/components/ui/button'
import { Label } from '@/src/components/ui/label'
import { X } from 'lucide-react'
import { CvSummaryResponse } from '@/src/types/cv'
import { Job } from '@/src/types/job'

interface CreateSessionModalProps {
  isOpen: boolean
  onClose: () => void
  savedJobs: Job[]
  cvs: CvSummaryResponse[]
  selectedJob: string
  setSelectedJob: (id: string) => void
  selectedCv: string
  setSelectedCv: (id: string) => void
  handleCreateSession: () => void
  isCreating: boolean
}

export function CreateSessionModal({
  isOpen,
  onClose,
  savedJobs,
  cvs,
  selectedJob,
  setSelectedJob,
  selectedCv,
  setSelectedCv,
  handleCreateSession,
  isCreating,
}: CreateSessionModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-black text-xl text-slate-800">Tạo Phiên Tư Vấn Mới</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-slate-200 rounded-full h-8 w-8 text-slate-500"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="p-6 space-y-6">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-sm text-blue-800 font-medium">
            Vui lòng chọn ít nhất 1 Công việc hoặc 1 Hồ sơ để AI có dữ liệu ngữ cảnh (Context)
            phân tích cho bạn.
          </div>

          <div className="space-y-3">
            <Label className="font-bold text-slate-700">Công việc đã lưu (Tùy chọn)</Label>
            <select
              className="flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm hover:border-slate-300 transition-colors"
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
            >
              <option value="">-- Chọn Công việc --</option>
              {savedJobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title} - {job.companyName}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <Label className="font-bold text-slate-700">Hồ sơ cá nhân (Tùy chọn)</Label>
            <select
              className="flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm hover:border-slate-300 transition-colors"
              value={selectedCv}
              onChange={(e) => setSelectedCv(e.target.value)}
            >
              <option value="">-- Chọn Hồ sơ (CV) --</option>
              {cvs.map((cv) => (
                <option key={cv.id} value={cv.id}>
                  {cv.title}
                </option>
              ))}
            </select>
          </div>

          <Button
            onClick={handleCreateSession}
            disabled={(!selectedCv && !selectedJob) || isCreating}
            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold h-12 text-base transition-all rounded-xl"
          >
            {isCreating ? 'ĐANG TẠO...' : 'BẮT ĐẦU CHAT'}
          </Button>
        </div>
      </div>
    </div>
  )
}
